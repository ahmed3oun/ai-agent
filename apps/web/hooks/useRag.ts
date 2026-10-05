import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import { SearchResultChunk } from '@/utils/types';
import { IngestDocumentDto } from '@repo/schemas';
import { useDocIngestionStore } from '@/store/useAppStore';



export const fetchRagSearch = async (query: string, limit: number = 5): Promise<SearchResultChunk[]> => {
  if (!query.trim()) return [];
  const params = new URLSearchParams();
  query && params.append('query', query);
  limit && params.append('limit', limit.toString());
  const { data } = await api.get('/rag/search', { params });
  return data;
};

export const ingestDocument = async (payload: IngestDocumentDto) => {
  const { data } = await api.post('/rag/ingest', payload);
  return data;
};


export function useRagSearch(query: string, limit: number = 5) {
  return useQuery({
    queryKey: ['rag-search', query, limit],
    queryFn: () => fetchRagSearch(query, limit),
    enabled: !!query.trim(),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}

export function useIngestDocument() {
  const { setIngestStatus, setDocTitle, setDocFilename, setDocContent } = useDocIngestionStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ingestDocument,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rag-search'] });
      setIngestStatus(`✅ Successfully indexed document "${data.title}"! Total vector chunks created: ${data.totalChunks}`);
      setDocTitle('');
      setDocFilename('');
      setDocContent('');
    },
    onError: (error: any) => {
      setIngestStatus(`❌ Error during ingestion: ${error.message}`);
    },
  });
}
