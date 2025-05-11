import asyncio
import os

import numpy as np
from nano_vectordb import NanoVectorDB

from base import BaseVectorStorage
from utils import dict_to_list


class NanoVectorDBStorage(BaseVectorStorage):
    def __init__(self, namespace, config, model):
        super().__init__(namespace, config, model)
        self.file_path = os.path.join(self.config.get('work_dir'), f'{self.namespace}.json')
        self.client = NanoVectorDB(embedding_dim=self.config.get('embedding_dim'),
                                   storage_file=self.file_path)

        self.similarity_threshold = self.config.get('similarity_threshold')
        self.max_batch_size = self.config.get('max_batch_size')


    async def get(self, ids):
        res = self.client.get(ids)
        res = [{'id': i['__id__'], **{k: v for k, v in i.items() if k != '__id__'}} for i in res]
        return res


    async def upsert(self, data):
        data = dict_to_list(data) if isinstance(data, dict) else data
        if 'embedding' in next(iter(data)):
            data = [{'__id__': i['id'], '__vector__': i['embedding'], 'embedding': i['embedding'].tolist(),
                     **{k: v for k, v in i.items() if k not in ('id', 'embedding')}} for i in data]
        else:
            contents = [i['content'] for i in data]
            batches = [contents[i: i + self.max_batch_size] for i in range(0, len(contents), self.max_batch_size)]
            embeddings = await asyncio.gather(*[self.model(i) for i in batches])
            embeddings = np.concatenate(embeddings)
            data = [{'__id__': i['id'], '__vector__': embeddings[i], **{k: v for k, v in i.items()}} for i in data]

        res = self.client.upsert(data)
        return res['update'], res['insert']

    async def query(self, query, top_k=5, threshold=None):
        if isinstance(query, str):
            query = await self.model(query)
            query = query[0]
        if threshold is None:
            threshold = self.similarity_threshold

        res = self.client.query(query, top_k, threshold)
        res = [{'id': i['__id__'], 'metrics': i['__metrics__'],
                **{k: v for k, v in i.items() if k not in ['__id__', '__metrics__', 'embedding']}} for i in res]
        return res

    async def save(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        self.client.save()


if __name__ == '__main__':
    from dotenv import load_dotenv
    from model import embedding_3

    load_dotenv()

    config = {'work_dir': 'temp',
              'embedding_dim': 2048,
              'similarity_threshold': 0.9,
              'max_batch_size': 32}

    vdb = NanoVectorDBStorage('test', config, embedding_3)
    data = {'test-123': {'name': 'apple', 'embedding': asyncio.run(embedding_3('Hello'))[0]},
            'test-456': {'name': 'banana', 'embedding': asyncio.run(embedding_3('World'))[0]}}

    print(asyncio.run(vdb.upsert(data)))
    print(asyncio.run(vdb.query('Hello', top_k=2, threshold=0.1)))
    print(asyncio.run(vdb.get(['test-123', 'test-456'])))
