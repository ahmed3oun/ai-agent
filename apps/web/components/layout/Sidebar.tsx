'use client';

import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/store/useAppStore';
import { BrainCircuit, Bot, Database, PlusCircle, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Session } from '@/utils/types';
import { useCreateSession, useSessions } from '@/hooks/useSessions';
import { CreateSessionDto, createSessionSchema } from '@repo/schemas/';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// interface Session {
//   id: string;
//   title: string;
//   createdAt: string;
// }

export default function Sidebar() {
    // Fetch Chat Sessions
  const { data: sessions = [], isLoading, error: sessionsFetchError } = useSessions();
  // Create Chat Session Mutation
  const { 
      isPending: isCreatingSession,
      error: createSessionError,
      mutateAsync: createSessionMutation 
    } = useCreateSession();
  const { activeTab, setActiveTab, activeSessionId, setActiveSessionId } = useAppStore();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // GSAP subtle entrance animation
  useGSAP(() => {
    gsap.from(sidebarRef.current, {
      x: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
    });
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateSessionDto>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      title: '',
    },
  });

  const addSession = async (data: CreateSessionDto) => {
    createSessionMutation(data);
    try {
            const createdSession: any = await createSessionMutation(data);
            if (createdSession)
                setActiveSessionId(createdSession.id);
        } catch (err: any) {
            console.error('Error creating session:', err);
        }
  }

  return (
    <aside
      ref={sidebarRef}
      className="w-72 bg-slate-900/90 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between shadow-2xl z-20"
    >
      <div>
        {/* Logo & Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/25">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-slate-100">Enterprise AI</h1>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px]">LangGraph + Zustand</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Shadcn style) */}
        <div className="p-3 space-y-1.5 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Agent Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'knowledge'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Knowledge Base (RAG)</span>
          </button>
        </div>

        {/* Chat Sessions List */}
        {activeTab === 'chat' && (
          <div className="p-3">
            <div className="flex items-center justify-between px-2 mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">History</span>
              <form onSubmit={handleSubmit(addSession)} className="flex justify-center items-center w-full space-x-2 space-y-2">
                <input
                  type="text"
                  placeholder="Session title (optional)"
                  {...register('title')}
                  className="bg-slate-800 text-slate-400 placeholder:text-slate-500 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isCreatingSession}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-medium transition disabled:opacity-50"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </form>
              
            </div>

            <div className="space-y-1 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs truncate transition-all duration-150 ${
                    activeSessionId === s.id
                      ? 'bg-slate-800 text-slate-100 font-semibold border-l-2 border-indigo-500 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-300'
                  }`}
                >
                  {s.title}
                </button>
              ))}
              {sessions.length === 0 && !isLoading && (
                <div className="text-[11px] text-slate-500 px-3 py-2.5">
                  No sessions yet. Click "New" to start a session.
                </div>
              )}
              {isLoading && (
                <div className="text-[11px] text-slate-500 px-3 py-2.5">Loading sessions...</div>
              )}
              {sessionsFetchError && (
                <div className="text-[11px] text-red-500 px-3 py-2.5">
                  Error fetching sessions: {sessionsFetchError.message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span>GSAP & TanStack Query</span>
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
      </div>
    </aside>
  );
}
