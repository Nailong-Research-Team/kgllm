import asyncio
import hashlib
import json
import logging
import os
import uuid

import numpy as np
import tiktoken

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger()
tokenizer = tiktoken.encoding_for_model('gpt-4o')
lock1, lock2 = asyncio.Lock(), asyncio.Lock()

AwaitNone = type('AwaitableNone', (),
                 {'__await__': lambda self: iter(()),
                  '__bool__': lambda self: False})()


def read_json(file_path):
    if not os.path.exists(file_path):
        return None
    with open(file_path, encoding="utf-8") as f:
        return json.load(f)


def write_json(json_obj, file_path):
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(json_obj, f, indent=2, ensure_ascii=False)


def list_to_dict(objs, key='id'):
    return {obj[key]: {k: v for k, v in obj.items() if k != key} for obj in objs}


def dict_to_list(objs, key='id'):
    return [{key: k, **v} for k, v in objs.items()]


def list_to_str(list):
    return ','.join(map(str, list))

def str_to_list(str, dtype=float):
    return [dtype(i) for i in str.split(',') if i]


def md5(text, salt='', prefix=''):
    res = hashlib.md5((text + salt).encode('utf-8')).hexdigest()
    return prefix + '-' + res if prefix else res


def uuid4(prefix=''):
    res = uuid.uuid4().hex
    return prefix + '-' + res if prefix else res


def create_message(prompt, response):
    return [{"role": "user", "content": prompt},
            {"role": "assistant", "content": response}]


def cosine_similarity(vec1, vec2):
    vec1 = vec1.flatten()
    vec2 = vec2.flatten()
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    return np.dot(vec1, vec2) / (norm1 * norm2) if norm1 != 0 and norm2 != 0 else 0.0


if __name__ == '__main__':
    print(md5('Hello, World!', salt='GXU', prefix='test'))
    print(create_message('Hello, World!', 'Hello, World!'))
    print(cosine_similarity(np.array([1, 2, 3]), np.array([[1, 2, 3]])))
