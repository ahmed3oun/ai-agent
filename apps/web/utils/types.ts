
export interface Session {
  id: string;
  title: string;
  createdAt: string;
}

export interface SearchResultChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  metadata: Record<string, any>;
  similarity: number;
}