from opensearchpy import OpenSearch
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.utils.config import settings

class OpenSearchClient:
    def __init__(self):
        self.client = None
        self.index_name = "devops-logs"
        self._connect()
    
    def _connect(self):
        """Initialize OpenSearch connection"""
        try:
            self.client = OpenSearch(
                hosts=[{
                    'host': settings.OPENSEARCH_HOST,
                    'port': settings.OPENSEARCH_PORT
                }],
                http_auth=(settings.OPENSEARCH_USER, settings.OPENSEARCH_PASSWORD),
                use_ssl=settings.OPENSEARCH_USE_SSL,
                verify_certs=False,
                ssl_show_warn=False
            )
            
            # Create index if not exists
            if not self.client.indices.exists(index=self.index_name):
                self.client.indices.create(
                    index=self.index_name,
                    body={
                        "mappings": {
                            "properties": {
                                "timestamp": {"type": "date"},
                                "level": {"type": "keyword"},
                                "service": {"type": "keyword"},
                                "message": {"type": "text"},
                                "metadata": {"type": "object"},
                                "processed_at": {"type": "date"}
                            }
                        }
                    }
                )
        except Exception as e:
            print(f"Failed to connect to OpenSearch: {e}")
            self.client = None
    
    def index_log(self, log: Dict[str, Any]) -> Dict[str, Any]:
        """Index a log entry in OpenSearch"""
        if not self.client:
            raise ConnectionError("OpenSearch client not connected")
        
        log["processed_at"] = datetime.utcnow().isoformat()
        
        response = self.client.index(
            index=self.index_name,
            body=log,
            refresh=True
        )
        return response
    
    def search_logs(
        self,
        query: Optional[str] = None,
        limit: int = 100,
        level: Optional[str] = None,
        service: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search logs with optional filters"""
        if not self.client:
            raise ConnectionError("OpenSearch client not connected")
        
        # Build query
        must_clauses = []
        
        if query:
            must_clauses.append({
                "match": {"message": query}
            })
        
        if level:
            must_clauses.append({
                "term": {"level": level}
            })
        
        if service:
            must_clauses.append({
                "term": {"service": service}
            })
        
        search_body = {
            "query": {
                "bool": {
                    "must": must_clauses if must_clauses else [{"match_all": {}}]
                }
            },
            "sort": [{"timestamp": {"order": "desc"}}],
            "size": limit
        }
        
        response = self.client.search(
            index=self.index_name,
            body=search_body
        )
        
        logs = []
        for hit in response["hits"]["hits"]:
            log = hit["_source"]
            log["_id"] = hit["_id"]
            logs.append(log)
        
        return logs
    
    def get_log_by_id(self, log_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific log by ID"""
        if not self.client:
            raise ConnectionError("OpenSearch client not connected")
        
        try:
            response = self.client.get(index=self.index_name, id=log_id)
            log = response["_source"]
            log["_id"] = response["_id"]
            return log
        except Exception:
            return None

# Singleton instance
opensearch_client = OpenSearchClient()
