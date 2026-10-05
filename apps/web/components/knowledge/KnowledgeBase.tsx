'use client';

import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Database, BookOpen, Search, Sparkles, Layers, Tag, Copy, Check, Filter } from 'lucide-react';
import { useIngestDocument, useRagSearch } from '@/hooks/useRag';
import api from '@/utils/api';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useDocIngestionStore } from '@/store/useAppStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { IngestDocumentDto, ingestDocumentSchema } from '@repo/schemas';
import { useForm } from 'react-hook-form';
import { ingestDocument } from '../../hooks/useRag';
import { metadata } from '../../app/layout';

export default function KnowledgeBase() {
  const [activeSubTab, setActiveSubTab] = useState<'search' | 'ingest'>('search');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSubmittedQuery, setSearchSubmittedQuery] = useState('');
  const [searchLimit, setSearchLimit] = useState(5);
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null);

  // Ingestion State
  // const [docTitle, setDocTitle] = useState('');
  // const [docFilename, setDocFilename] = useState('');
  // const [docContent, setDocContent] = useState('');
  // const [docTags, setDocTags] = useState('engineering, policy');
  // const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const { 
    docTitle, setDocTitle,
    docFilename, setDocFilename,
    docContent, setDocContent,
    docTags, setDocTags,
    ingestStatus, setIngestStatus 
  } = useDocIngestionStore();

  const resultsRef = useRef<HTMLDivElement>(null);

  // RAG Search Query Hook
  const {
    data: searchResults = [],
    isLoading: isSearching,
    isError: isSearchError,
    error: searchError,
  } = useRagSearch(searchSubmittedQuery, searchLimit);

  const { 
      isPending: isIngestingDocument,
      error: ingestDocumentError,
      mutateAsync: ingestDocument
    } = useIngestDocument();

  // GSAP animation for search results
  useGSAP(() => {
    if (searchResults.length > 0 && resultsRef.current) {
      gsap.fromTo(
        resultsRef.current.children,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [searchResults]);

  // Ingestion Mutation
  const { register, handleSubmit, formState: { errors } } = useForm<IngestDocumentDto>({
      resolver: zodResolver(ingestDocumentSchema),
      defaultValues: {
        title: '',
        filename: '',
        content: '',
        metadata: { tags: '' },
      },
    });

  const handleIngestSubmit = (e: React.FormEvent) => {
    try {
      // e.preventDefault();
      // if (!docTitle || !docContent) return;
      ingestDocument({
        title: docTitle,
        filename: docFilename || `${docTitle.toLowerCase().replace(/\s+/g, '_')}.txt`,
        content: docContent,
        metadata: { tags: docTags.split(',').map((t) => t.trim()).filter(Boolean) },
      })
    } catch (error: any) {
      console.error('Error ingesting document:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchSubmittedQuery(searchQuery.trim());
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkId(id);
    setTimeout(() => setCopiedChunkId(null), 2000);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-950 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Knowledge Base & pgvector RAG</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Ingest enterprise documentation or execute hybrid vector similarity search across PostgreSQL pgvector indexes.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl w-max">
            <button
              onClick={() => setActiveSubTab('search')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'search'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Hybrid Search</span>
            </button>
            <button
              onClick={() => setActiveSubTab('ingest')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'ingest'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ingest Document</span>
            </button>
          </div>
        </div>

        {/* SUB-TAB 1: HYBRID VECTOR SEARCH */}
        {activeSubTab === 'search' && (
          <div className="space-y-6">
            {/* Search Input Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-4">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search pgvector database (e.g., microservices security, SLA uptime, stipends)..."
                    className="w-full bg-slate-950 border border-slate-800/90 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                  />
                </div>

                {/* Result Limit Dropdown */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-2xl px-3 py-3 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={3}>Top 3</option>
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-semibold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/25"
                >
                  {isSearching ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Execute Hybrid Search</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Search Preset Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-[11px] font-medium text-slate-500 mr-1">Quick Queries:</span>
                {[
                  'Microservices security mTLS token validation',
                  'Home office setup stipend Concur',
                  'SLA uptime 99.95% P1 incident escalation',
                  'HNSW index optimization parameters',
                ].map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(preset);
                      setSearchSubmittedQuery(preset);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40 text-[11px] transition-all"
                  >
                    💡 {preset.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message Banner */}
            {isSearchError && (
              <div className="p-4 rounded-2xl text-xs bg-rose-950/40 border border-rose-800/80 text-rose-300 shadow-lg">
                ❌ Search Error: {searchError?.message || 'Failed to execute vector search'}
              </div>
            )}

            {/* Search Results Display */}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>pgvector Cosine Similarity Search Results ({searchResults.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Query: "{searchSubmittedQuery}"</span>
                </div>

                <div ref={resultsRef} className="space-y-3">
                  {searchResults.map((result, idx) => {
                    const simPercent = Math.round(result.similarity * 100);
                    const isHigh = simPercent >= 75;
                    const isMed = simPercent >= 45 && simPercent < 75;

                    return (
                      <div
                        key={result.id || idx}
                        className="bg-slate-900 border border-slate-800/90 rounded-2xl p-4.5 space-y-3 shadow-lg hover:border-indigo-500/40 transition-all"
                      >
                        {/* Result Item Top Bar */}
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
                                isHigh
                                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                                  : isMed
                                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                                  : 'bg-slate-800 border-slate-700 text-slate-400'
                              }`}
                            >
                              {simPercent}% Cosine Similarity
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Chunk #{result.chunkIndex}
                            </span>
                          </div>

                          <button
                            onClick={() => copyToClipboard(result.content, result.id)}
                            className="text-slate-400 hover:text-indigo-400 p-1.5 rounded-lg transition text-[11px] flex items-center space-x-1"
                          >
                            {copiedChunkId === result.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Chunk Content Block */}
                        <div className="whitespace-pre-wrap text-slate-200 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 font-mono text-[11px] leading-relaxed overflow-x-auto">
                          {result.content}
                        </div>

                        {/* Metadata Footer */}
                        {result.metadata && Object.keys(result.metadata).length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-400">
                            <Tag className="w-3 h-3 text-indigo-400 mr-1" />
                            {Object.entries(result.metadata).map(([k, v], i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                                {k}: {Array.isArray(v) ? v.join(', ') : String(v)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty Search State */}
            {searchSubmittedQuery && !isSearching && searchResults.length === 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-2">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">No vector chunks matched your query</p>
                <p className="text-[11px] text-slate-500">
                  Try broadening your search query or ingest text documents using the "Ingest Document" tab.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 2: INGEST DOCUMENT */}
        {activeSubTab === 'ingest' && (
          <div className="space-y-4">
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

            <form onSubmit={handleIngestSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-md">
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
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
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
                {errors.filename && <p className="text-sm text-red-500">{errors.filename.message}</p>}
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
                {errors.metadata && <p className="text-sm text-red-500">Error with metadata tags</p>}
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
                {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isIngestingDocument || !docTitle || !docContent}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-semibold rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/25"
              >
                {isIngestingDocument ? (
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
        )}
      </div>
    </div>
  );
}
