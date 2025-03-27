'''
Schema:
  doc_id (UUID)
  embedding (Vector)
  metadata (JSON - filename, date, source)
'''

import chromadb

client = chromadb.PersistentClient(path="./vector_db")

collection = client.get_or_create_collection("documents")

collection.add(
    ids=["doc_001"],
    embeddings=[[0.12, 0.45, 0.78, ...]],  # 1536-d vector from OpenAI/transformer model
    metadatas=[{"filename": "Elevator_Manual.pdf", "source": "Manuals", "date": "2023-12-01"}]
)
results = collection.query(
    query_embeddings=[[0.15, 0.42, 0.80, ...]],  # Query embedding vector
    n_results=5
)
