from abc import ABC


class BaseStorage(ABC):
    def __init__(self, namespace, config):
        self.namespace = namespace
        self.config = config


class BaseKVStorage(BaseStorage):
    def __init__(self, namespace, config):
        super().__init__(namespace, config)
        self.namespace = f'kvdb_{self.namespace}'


class BaseVectorStorage(BaseStorage):
    def __init__(self, namespace, config, model):
        super().__init__(namespace, config)
        self.namespace = f'vdb_{self.namespace}'
        self.model = model


class BaseGraphStorage(BaseStorage):
    def __init__(self, namespace, config):
        super().__init__(namespace, config)
        self.namespace = f'gdb_{self.namespace}'
