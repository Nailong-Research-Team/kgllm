import os

import networkx as nx

from base import BaseGraphStorage
from utils import list_to_str, str_to_list


class NetworkXStorage(BaseGraphStorage):
    def __init__(self, namespace, config):
        super().__init__(namespace, config)
        self.file_path = os.path.join(self.config.get('work_dir'), f'{self.namespace}.graphml')
        self.graph = self.read_graphml(self.file_path) or nx.MultiDiGraph()
        self.ids = {e['id']: (u, v, e['id']) for u, v, e in self.graph.edges(data=True)}


    @staticmethod
    def read_graphml(file_path):
        if os.path.exists(file_path):
            return nx.read_graphml(file_path, force_multigraph=True)
        else:
            return None

    @staticmethod
    def write_graphml(graph, file_path):
        nx.write_graphml(graph, file_path)

    async def has_node(self, v):
        return self.graph.has_node(v)

    async def has_edge(self, e):
        u, v, k = e if isinstance(e, tuple) else self.ids[e]
        return self.graph.has_edge(u, v, k)

    async def get_node(self, v):
        if not await self.has_node(v):
            return None

        v = self.graph.nodes.get(v).copy()
        if 'embedding' in v:
            v['embedding'] = str_to_list(v['embedding'])
        return v

    async def get_edge(self, e):
        if not await self.has_edge(e):
            return None

        u, v, k = e if isinstance(e, tuple) else self.ids[e]
        e = self.graph.edges.get((u, v, k)).copy()
        if 'embedding' in e:
            e['embedding'] = str_to_list(e['embedding'])
        return e

    async def in_edges(self, v):
        if not await self.has_node(v):
            return []

        res = []
        for u, v, e in self.graph.in_edges(v, data=True):
            e = e.copy()
            if 'embedding' in e:
                e['embedding'] = str_to_list(e['embedding'])
            res.append((u,v,e))
        return res

    async def out_edges(self, v):
        if not await self.has_node(v):
            return []

        res = []
        for u, v, e in self.graph.out_edges(v, data=True):
            e = e.copy()
            if 'embedding' in e:
                e['embedding'] = str_to_list(e['embedding'])
            res.append((u,v,e))
        return res

    async def upsert_node(self, v):
        v = v.copy()
        if 'embedding' in v:
            v['embedding'] = list_to_str(v['embedding'])
        self.graph.add_node(v['id'], **v)

    async def upsert_edge(self, e):
        e = e.copy()
        if 'embedding' in e:
            e['embedding'] = list_to_str(e['embedding'])
        if not self.ids.get(e['id']):
            self.ids[e['id']] = (e['source'], e['target'], e['id'])
        u, v, k = self.ids[e['id']]
        self.graph.add_edge(u, v, k, **e)


    async def node_degree(self, v):
        return self.graph.degree(v) if await self.has_node(v) else 0

    async def edge_degree(self, u, v, k):
        return await self.node_degree(u) + await self.node_degree(v)

    async def save(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        self.write_graphml(self.graph, self.file_path)


if __name__ == '__main__':
    import asyncio

    config = {'work_dir': 'temp'}

    gdb = NetworkXStorage('test', config)
    node1 = {'id': 'test-123', 'name': 'apple', 'embedding': [1, 2, 3]}
    node2 = {'id': 'test-456', 'name': 'banana', 'embedding': [4, 5, 6]}
    edge = {'source': 'test-123', 'target': 'test-456',
            'id': 'test-666', 'name': 'yummy', 'embedding': [6, 6, 6]}

    asyncio.run(gdb.upsert_node(node1))
    asyncio.run(gdb.upsert_node(node2))
    asyncio.run(gdb.upsert_edge(edge))

    print(asyncio.run(gdb.get_node('test-123')))
    print(asyncio.run(gdb.get_edge('test-666')))
    print(asyncio.run(gdb.get_edge(('test-123', 'test-456', 'test-666'))))
