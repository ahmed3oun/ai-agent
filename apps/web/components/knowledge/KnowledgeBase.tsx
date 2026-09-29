'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Database, BookOpen } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function KnowledgeBase() {
  const [docTitle, setDocTitle] = useState('');
  const [docFilename, setDocFilename] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docTags, setDocTags] = useState('engineering, policy');
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  const ingestMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${API_BASE}/rag/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to ingest document');
      return res.json();
    },
    onSuccess: (data) => {
      setIngestStatus(`✅ Successfully indexed document! Total chunks created: ${data.totalChunks}`);
      setDocTitle('');
      setDocFilename('');
      setDocContent('');
    },
    onError: (error: any) => {
      setIngestStatus(`❌ Error during ingestion: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docContent) return;

    setIngestStatus(null);
    ingestMutation.mutate({
      title: docTitle,
      filename: docFilename || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.txt`,
      content: docContent,
      metadata: { tags: docTags.split(',').map((t) => t.trim()) },
    });
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>Knowledge Base Ingestion (pgvector RAG)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Upload text documents or PDF specifications. Documents are automatically chunked, embedded via Google Gemini Embeddings, and stored in PostgreSQL with vector indexes.
          </p>
        </div>

        {ingestStatus && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium border shadow-lg backdrop-blur-md ${
              ingestStatus.startsWith('✅')
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            {ingestStatus}
          </div>
        )}

        {/* Form Container (Shadcn Card style) */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document Title</label>
              <input
                type="text"
                required
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Engineering Architecture Guide"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Filename / Code</label>
              <input
                type="text"
                value={docFilename}
                onChange={(e) => setDocFilename(e.target.value)}
                placeholder="arch_spec_v1.txt"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Metadata Tags (Comma separated)</label>
            <input
              type="text"
              value={docTags}
              onChange={(e) => setDocTags(e.target.value)}
              placeholder="architecture, backend, policy"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document Content</label>
            <textarea
              rows={8}
              required
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Paste full document content, standard operating procedures, or technical documentation here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono transition"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={ingestMutation.isPending || !docTitle || !docContent}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-semibold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/25"
          >
            {ingestMutation.isPending ? (
              <span>Chunking & Embedding into pgvector...</span>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Ingest into Vector Database</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
