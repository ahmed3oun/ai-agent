'use client';

import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppStore } from '@/store/useAppStore';
import { BrainCircuit, Bot, Database, PlusCircle, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCreateSession, useSessions } from '@/hooks/useSessions';
import { CreateSessionDto, createSessionSchema } from '@repo/schemas/';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    try {
      const createdSession: any = await createSessionMutation(data);
      if (createdSession)
        setActiveSessionId(createdSession.id);
    } catch (err: any) {
      console.error('Error creating session:', err);
    }
  };

  return (
    <aside
      ref={sidebarRef}
      className="w-72 h-screen bg-slate-900/90 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between shadow-2xl z-20 overflow-hidden"
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Logo & Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3 shrink-0">
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
        <div className="p-3 space-y-1.5 border-b border-slate-800/80 shrink-0">
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
          <div className="flex-1 flex flex-col min-h-0 p-3 overflow-hidden">
            <div className="flex-col items-center justify-between border-0 px-2 mb-2.5 shrink-0">
              <form
                onSubmit={handleSubmit(addSession)} 
                className="border-transparent border-0 flex-col-reverse justify-center items-center w-full space-x-2 space-y-2 mb-2"
              >
                <div className="relative border-0 border-transparent">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <PlusCircle className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    type="text"
                    {...register('title')}
                    className="px-3 py-2.5 border-t-0 border-r-0 border-l-0 border-b-2 bg-neutral-secondary-medium border border-default-medium rounded-base ps-9 text-heading text-sm focus:ring-brand focus:border-brand block w-full "
                    placeholder="New Session" />
                  <button  
                    disabled={isCreatingSession}
                    className="absolute end-1.5 cursor-pointer bottom-1.5 text-white bg-brand hover:bg-brand-strong box-border border border-amber-50 border-gray-500 focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded text-xs px-3 py-1.5 focus:outline-none">
                    New
                  </button>
                </div>
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </form>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">History</span>
            </div>

            {/* Scrollable Sessions List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0 custom-scrollbar">
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
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
        <span>GSAP & TanStack Query</span>
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
      </div>
    </aside>
  );
}
