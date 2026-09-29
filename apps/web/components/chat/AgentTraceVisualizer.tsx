'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Layers, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';

interface AgentTraceVisualizerProps {
  index: number;
  context?: string;
}

export default function AgentTraceVisualizer({ index, context }: AgentTraceVisualizerProps) {
  const { expandedTraces, toggleTrace } = useAppStore();
  const isExpanded = expandedTraces[index] || false;

  if (!context) return null;

  return (
    <div className="mt-2 max-w-2xl w-full font-sans">
      <button
        onClick={() => toggleTrace(index)}
        className="flex items-center space-x-2 text-[11px] text-slate-400 hover:text-indigo-400 transition py-1 font-medium"
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        <Layers className="w-3.5 h-3.5 text-indigo-400" />
        <span>LangGraph Agent Trace & Retrieved Vector Context</span>
      </button>

      {isExpanded && (
        <div className="mt-1.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-2.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>RAG Hybrid Vector Search Executed</span>
          </div>
          <div className="whitespace-pre-wrap text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[10px] leading-relaxed overflow-x-auto">
            {context}
          </div>
        </div>
      )}
    </div>
  );
}
