'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import ChatMessageItem from './ChatMessageItem';
import { Bot, Send, BrainCircuit, Sparkles } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    context?: string;
  };
}

export default function ChatWorkspace() {
  const queryClient = useQueryClient();
  const { activeSessionId, setActiveSessionId, inputPrompt, setInputPrompt } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch session history using TanStack Query
  const { data: sessionHistoryData } = useQuery({
    queryKey: ['chat-history', activeSessionId],
    queryFn: async () => {
      if (!activeSessionId) return null;
      const res = await fetch(`${API_BASE}/chat/sessions/${activeSessionId}`);
      if (!res.ok) throw new Error('Failed to fetch session history');
      return res.json();
    },
    enabled: !!activeSessionId,
  });

  useEffect(() => {
    if (sessionHistoryData?.messages) {
      setMessages(sessionHistoryData.messages);
    }
  }, [sessionHistoryData]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, prompt }: { sessionId: string | null; prompt: string }) => {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, prompt }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.sessionId && data.sessionId !== activeSessionId) {
        setActiveSessionId(data.sessionId);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message.content,
          metadata: data.message.metadata,
        },
      ]);
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['chat-history', activeSessionId] });
    },
    onError: (error: any) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Connection Error: ${error.message}. Make sure NestJS backend is running at ${API_BASE}`,
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || sendMessageMutation.isPending) return;

    const userMsg: Message = { role: 'user', content: inputPrompt };
    setMessages((prev) => [...prev, userMsg]);
    const promptToSend = inputPrompt;
    setInputPrompt('');

    sendMessageMutation.mutate({ sessionId: activeSessionId, prompt: promptToSend });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950">
      {/* Workspace Header */}
      <div className="h-14 px-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <Bot className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-semibold text-slate-200">
            Autonomous AI Agent (LangGraph Workflow)
          </h2>
        </div>
        <span className="text-[11px] px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-medium">
          Hybrid Search + Self-Correction
        </span>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 mb-4 shadow-xl">
              <BrainCircuit className="w-9 h-9 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              Enterprise Autonomous AI Assistant
            </h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
              Ask questions across your enterprise knowledge base, trigger hybrid vector search, or execute agentic tools.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-lg w-full text-left">
              <button
                onClick={() => setInputPrompt('What are our company document policies?')}
                className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-indigo-500/50 text-xs text-slate-300 transition-all shadow-sm"
              >
                💡 "What are our document policies?"
              </button>
              <button
                onClick={() => setInputPrompt('Summarize key architectural guidelines.')}
                className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl hover:border-indigo-500/50 text-xs text-slate-300 transition-all shadow-sm"
              >
                📚 "Summarize key architectural guidelines."
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessageItem key={idx} message={msg} index={idx} />
          ))
        )}

        {sendMessageMutation.isPending && (
          <div className="flex items-center space-x-3 text-xs text-indigo-400 bg-slate-900/80 border border-indigo-500/30 w-max px-4 py-2.5 rounded-2xl animate-pulse shadow-lg backdrop-blur-md">
            <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
            <span>LangGraph Agent executing node workflow (Retrieval -&gt; Reasoning)...</span>
          </div>
        )}
      </div>

      {/* Input Prompt Form (Shadcn style bar) */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/30 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex space-x-3">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask your AI Agent anything or query indexed documents..."
            className="flex-1 bg-slate-900 border border-slate-800/90 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={sendMessageMutation.isPending || !inputPrompt.trim()}
            className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white text-xs font-semibold rounded-2xl flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/25"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
