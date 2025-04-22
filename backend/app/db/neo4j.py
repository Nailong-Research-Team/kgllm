from py2neo import Graph
from app.core.config import settings

def get_neo4j_connection():
    """获取 Neo4j 数据库连接"""
    return Graph(
        settings.NEO4J_URI,
        auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
    ) 