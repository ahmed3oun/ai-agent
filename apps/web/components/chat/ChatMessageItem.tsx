'use client';

import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AgentTraceVisualizer from './AgentTraceVisualizer';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    context?: string;
  };
}

interface ChatMessageItemProps {
  message: Message;
  index: number;
}

export default function ChatMessageItem({ message, index }: ChatMessageItemProps) {
  const msgRef = useRef<HTMLDivElement>(null);

  // GSAP message entrance animation
  useGSAP(() => {
    gsap.from(msgRef.current, {
      y: 15,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  }, []);

  const isUser = message.role === 'user';

  return (
    <div
      ref={msgRef}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}
    >
      <div
        className={`max-w-2xl rounded-2xl px-4.5 py-3 text-xs leading-relaxed shadow-sm transition-all ${
          isUser
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-indigo-600/20'
            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-slate-900/40'
        }`}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed font-sans">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {!isUser && message.metadata?.context && (
        <AgentTraceVisualizer index={index} context={message.metadata.context} />
      )}
    </div>
  );
}
