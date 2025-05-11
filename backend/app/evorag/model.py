import os

import numpy as np
from openai import APIConnectionError, RateLimitError
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type


def openai_retry(func):
    return retry(stop=stop_after_attempt(5),
                 wait=wait_exponential(min=4, max=10),
                 retry=retry_if_exception_type((APIConnectionError, RateLimitError)))(func)


def get_openai_async_client(base_url=None, api_key=None):
    if not api_key:
        api_key = os.environ.get("OPENAI_API_KEY")
    return AsyncOpenAI(api_key=api_key, base_url=base_url)


@openai_retry
async def openai_complete(model, user_prompt, system_prompt=None, history=None,
                          base_url=None, api_key=None, **kwargs):
    if history is None:
        history = []
    client = get_openai_async_client(base_url, api_key)

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.extend(history)
    messages.append({"role": "user", "content": user_prompt})

    response = await client.chat.completions.create(model=model, messages=messages, **kwargs)
    content = response.choices[0].message.content
    await client.close()
    return content


@openai_retry
async def openai_embedding(model, text, base_url=None, api_key=None, **kwargs):
    client = get_openai_async_client(base_url, api_key)

    response = await client.embeddings.create(model=model, input=text, **kwargs)
    embeddings = np.array([i.embedding for i in response.data])
    await client.close()
    return embeddings


async def deepseek_v3(user_prompt, system_prompt=None, history=None, **kwargs):
    return await openai_complete(model='deepseek-chat',
                                 base_url='https://api.deepseek.com',
                                 api_key=os.getenv('DEEPSEEK_API_KEY'),
                                 system_prompt=system_prompt,
                                 user_prompt=user_prompt,
                                 history=history,
                                 **kwargs)


async def glm_4_plus(user_prompt, system_prompt=None, history=None, **kwargs):
    return await openai_complete(model='glm-4-plus',
                                 base_url='https://open.bigmodel.cn/api/paas/v4',
                                 api_key=os.getenv('ZHIPUAI_API_KEY'),
                                 system_prompt=system_prompt,
                                 user_prompt=user_prompt,
                                 history=history,
                                 **kwargs)


async def embedding_3(text, **kwargs):
    return await openai_embedding(model='embedding-3',
                                  base_url='https://open.bigmodel.cn/api/paas/v4',
                                  api_key=os.getenv('ZHIPUAI_API_KEY'),
                                  text=text,
                                  **kwargs)


if __name__ == '__main__':
    import asyncio
    from dotenv import load_dotenv

    load_dotenv()

    # print(asyncio.run(deepseek_v3('Hello')))
    print(asyncio.run(glm_4_plus('Hello')))
    print(asyncio.run(embedding_3('Hello')))
