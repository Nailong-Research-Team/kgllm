import asyncio
import json

import numpy as np

from prompt import format_template, PROMPTS
from utils import AwaitNone, lock1, lock2, create_message, list_to_dict
from utils import cosine_similarity
from utils import logger
from utils import tokenizer, md5


def text_chunking(docs, max_tokens=1024, overlap_tokens=128):
    docs = list(docs.items())
    ids, contents = zip(*[(doc[0], doc[1]['content']) for doc in docs])

    chunks = []
    tokens = tokenizer.encode_batch(contents)
    for i, token in enumerate(tokens):
        contents, sizes = [], []
        for j in range(0, len(token), max_tokens - overlap_tokens):
            contents.append(token[j:j + max_tokens])
            sizes.append(min(max_tokens, len(token) - j))

        contents = tokenizer.decode_batch(contents)
        for j, content in enumerate(contents):
            chunks.append({'doc': ids[i],
                           'index': j,
                           'content': content.strip(),
                           'size': sizes[j]})

    res = {md5(chunk['content'], prefix='chunk'): chunk for chunk in chunks}
    return res


async def entity_extraction(chunks, chat_model, vector_model, vdb_ent, vdb_rel, max_rounds=0, threshold=0.8):
    chunks = list(chunks.items())
    global_entities, global_relations = set(), set()
    last_ent_task, last_rel_task = AwaitNone, AwaitNone

    async def get_embeddings(objs, weight1=0.7, weight2=0.3):
        name_embed, desc_embed = await asyncio.gather(vector_model([obj['name'] for obj in objs]),
                                                      vector_model([obj['desc'] for obj in objs]))
        for i, obj in enumerate(objs):
            obj['embedding'] = weight1 * name_embed[i] + weight2 * desc_embed[i]

    async def get_summaries(objs, summary_tokens=128):
        for obj in objs:
            tokens = tokenizer.encode(obj['desc'])
            if len(tokens) > summary_tokens:
                prompt = format_template(PROMPTS['SUMMARIZE_DESC'], name=obj['name'], desc=obj['desc'])
                obj['desc'] = await chat_model(prompt, max_tokens=summary_tokens)
                logger.info(f'为{obj['name']}总结了摘要')
        await get_embeddings(objs)

    async def loop_extract(objs, prompt, type):
        history = create_message(prompt, objs)
        for i in range(max_rounds):
            prompt = format_template(PROMPTS['CONTINUE_EXTRACT'], type=type)
            record = await chat_model(prompt, history=history, response_format={'type': 'json_object'})
            objs += json.loads(record)[type]
            history += create_message(prompt, record)
            if i == max_rounds - 1:
                break

            prompt = format_template(PROMPTS['LOOP_EXTRACT'], type=type)
            is_loop = await chat_model(prompt, history=history)
            is_loop = is_loop.strip().strip('"').strip("'").lower()
            if is_loop != 'yes':
                break
        return objs


    async def extract_entities(chunk):
        id, content = chunk[0], chunk[1]['content']

        prompt = format_template(PROMPTS['EXTRACT_ENTITIES'], text=content)
        record = await chat_model(prompt, response_format={'type': 'json_object'})
        entities = json.loads(record)['entities']
        entities = await loop_extract(entities, prompt, 'entities') if max_rounds > 0 else entities

        logger.info(f'完成{id}的实体提取')
        return entities

    async def merge_entities(entities):
        nonlocal global_entities
        update_entities = []
        new_entities = []

        await get_embeddings(entities)
        for ent in entities:
            match = await vdb_ent.query(ent['embedding'], top_k=1, threshold=threshold)
            match = match[0] if match else None
            if match:
                logger.info(f'合并了{ent['name']}')
                ent['id'] = match['id']
                ent['name'] = match['name']
                ent['desc'] += '\n' + match['desc']
                update_entities.append(ent)
            else:
                logger.info(f'新增了{ent['name']}')
                ent['id'] = md5(ent['desc'], prefix='ent')
                new_entities.append(ent)
            global_entities.add(ent['id'])

        ent_task = asyncio.create_task(upsert_task(vdb_ent, update_entities, new_entities))
        return entities, ent_task

    async def extract_relations(chunk, entities):
        id, content = chunk[0], chunk[1]['content']
        tuples = [(ent['name'], ent['type']) for ent in entities]

        prompt = format_template(PROMPTS['EXTRACT_RELATIONS'], text=content, entities=tuples)
        record = await chat_model(prompt, response_format={'type': 'json_object'})
        relations = json.loads(record)['relations']
        relations = await loop_extract(relations, prompt, 'relations') if max_rounds > 0 else relations

        name_to_id = {ent['name']: ent['id'] for ent in entities}
        for i in range(len(relations) - 1, -1, -1):
            rel = relations[i]
            source = name_to_id.get(rel['source'])
            target = name_to_id.get(rel['target'])
            if source is None:
                logger.info(f'发现未知实体{rel['source']}')
                relations.pop(i)
                continue
            elif target is None:
                logger.info(f'发现未知实体{rel['target']}')
                relations.pop(i)
                continue
            else:
                rel['source'] = source
                rel['target'] = target

        logger.info(f'完成{id}的关系提取')
        return relations

    async def merge_relations(relations):
        nonlocal global_relations
        update_relations = []
        new_relations = []

        await get_embeddings(relations)
        for rel in relations:
            match = await vdb_rel.query(rel['embedding'], top_k=1, threshold=threshold)
            match = match[0] if match else None
            if match:
                logger.info(f'合并了{rel['name']}')
                rel['source'] = match['source']
                rel['target'] = match['target']
                rel['id'] = match['id']
                rel['name'] = match['name']
                rel['desc'] += '\n' + match['desc']
                update_relations.append(rel)
            else:
                logger.info(f'新增了{rel['name']}')
                rel['id'] = md5(rel['desc'], prefix='rel')
                new_relations.append(rel)
            global_relations.add(rel['id'])

        rel_task = asyncio.create_task(upsert_task(vdb_rel, update_relations, new_relations))
        return rel_task

    async def upsert_task(vdb, update_objs, new_objs):
        if update_objs:
            await get_summaries(update_objs)
        objs = list_to_dict(update_objs + new_objs)
        await vdb.upsert(objs)

    async def process_chunk(chunk):
        nonlocal last_ent_task, last_rel_task

        logger.info(f'正在处理{chunk[0]}的实体提取')
        entities = await extract_entities(chunk)
        async with lock1:
            if last_ent_task:
                await last_ent_task
            entities, last_ent_task = await merge_entities(entities)

        logger.info(f'正在处理{chunk[0]}的关系提取')
        relations = await extract_relations(chunk, entities)
        async with lock2:
            if last_rel_task:
                await last_rel_task
            last_rel_task = await merge_relations(relations)

    await asyncio.gather(*[process_chunk(chunk) for chunk in chunks])

    entities, relations = await asyncio.gather(vdb_ent.get(list(global_entities)), vdb_rel.get(list(global_relations)))
    return entities, relations


async def graph_construction(entities, relations, gdb_kg):
    for ent in entities:
        await gdb_kg.upsert_node(ent)

    for rel in relations:
        await gdb_kg.upsert_edge(rel)

    return gdb_kg


async def path_retrieval(query, vector_model, vdb_ent, vdb_rel, gdb_kg,
                         top_k=5, base_threshold=0.5, sim_threshold=0.7,
                         beam_width=5, max_depth=5, max_paths=3):
    query = await vector_model(query)
    query = query[0]
    entities, relations = await asyncio.gather(vdb_ent.query(query, top_k, base_threshold),
                                               vdb_rel.query(query, top_k, base_threshold))
    if not entities and not relations:
        logger.info('未找到相关数据')
        return None

    seed_high, seed_low = set(), set()
    for ent in entities:
        if ent['metrics'] >= sim_threshold:
            seed_high.add(ent['id'])
        else:
            seed_low.add(ent['id'])
    for rel in relations:
        if rel['metrics'] >= sim_threshold:
            seed_high.update([rel['source'], rel['target']])
        else:
            seed_low.update([rel['source'], rel['target']])

    seed = seed_high if seed_high else seed_low
    seed = [await gdb_kg.get_node(id) for id in seed]

    def path_score(path):
        sim_avg = 0.0
        for obj in path:
            sim = cosine_similarity(np.array(obj['embedding']), query)
            sim_avg += sim
        sim_avg /= len(path)

        length_penalty = 1.0
        if len(path) < 5:
            length_penalty -= 0.03 * (7 - len(path))
        elif len(path) > 7:
            length_penalty -= 0.05 * (len(path) - 7)

        seed_bonus = 1.0
        for i, obj in enumerate(path):
            if i % 2 == 0:
                if obj['id'] in seed_high:
                    seed_bonus += 0.1
                elif obj['id'] in seed_low:
                    seed_bonus += 0.05

        return sim_avg * length_penalty * seed_bonus

    async def beam_search():
        beams = []
        for s in seed:
            path = [s]
            score = path_score(path)
            beams.append((path, score))
        beams.sort(key=lambda x: x[1], reverse=True)
        beams = beams[:beam_width]

        paths = []
        for depth in range(max_depth):
            next_beams = []
            for path, score in beams:
                last = path[-1]

                neighbors = []
                for u, v, e in await gdb_kg.out_edges(last['id']):
                    if v not in [node['id'] for node in path[::2]]:
                        v = await gdb_kg.get_node(v)
                        neighbors.append((e, v))

                for u, v, e in await gdb_kg.in_edges(last['id']):
                    if u not in [node['id'] for node in path[::2]]:
                        u = await gdb_kg.get_node(u)
                        neighbors.append((e, u))

                for e, v in neighbors:
                    new_path = path + [e, v]
                    new_score = path_score(new_path)
                    next_beams.append((new_path, new_score))

                paths.append((path, score))

            if not next_beams:
                break

            next_beams.sort(key=lambda x: x[1], reverse=True)
            beams = next_beams[:beam_width]

        paths.extend(beams)
        paths.sort(key=lambda x: x[1], reverse=True)
        return paths[:max_paths]

    paths = await beam_search()

    return paths


async def answer_generation(query, paths, chat_model, gdb_kg):
    entities, relations = {}, {}
    for path in paths:
        for i, obj in enumerate(path):
            if i % 2 == 0:
                if obj['id'] not in entities:
                    entities[obj['id']] = {'name': obj['name'], 'desc': obj['desc']}
            else:
                if obj['id'] not in relations:
                    source = await gdb_kg.get_node(obj['source'])
                    target = await gdb_kg.get_node(obj['target'])
                    relations[obj['id']] = {'source': source['name'], 'target': target['name'],
                                            'name': obj['name'], 'desc': obj['desc']}
    entities, relations = list(entities.values()), list(relations.values())

    prompt = format_template(PROMPTS['KG_QUERY'], query=query, entities=entities, relations=relations)
    answer = await chat_model(prompt)
    return answer