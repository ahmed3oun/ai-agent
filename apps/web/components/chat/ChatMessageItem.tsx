'use client';

import React, { useRef, useState, useEffect } from 'react';
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
  isLatest?: boolean;
}

export default function ChatMessageItem({ message, index, isLatest }: ChatMessageItemProps) {
  const msgRef = useRef<HTMLDivElement>(null);
  const traceRef = useRef<HTMLDivElement>(null);

  const isUser = message.role === 'user';
  const shouldStream = isLatest && !isUser;

  const [displayedContent, setDisplayedContent] = useState(shouldStream ? '' : message.content);
  const [isStreaming, setIsStreaming] = useState(shouldStream);

  // GSAP message entrance animation
  useGSAP(() => {
    gsap.from(msgRef.current, {
      y: 15,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  }, []);

  // Text streaming typewriter effect for AI assistant responses
  useEffect(() => {
    if (!shouldStream) {
      setDisplayedContent(message.content);
      setIsStreaming(false);
      return;
    }

    let currentIndex = 0;
    const fullText = message.content;
    setDisplayedContent('');
    setIsStreaming(true);

    const interval = setInterval(() => {
      currentIndex += Math.min(3, fullText.length - currentIndex);
      setDisplayedContent(fullText.slice(0, currentIndex));

      if (currentIndex >= fullText.length) {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [message.content, shouldStream]);

  // GSAP entrance animation for Agent Trace after streaming completes
  useEffect(() => {
    if (!isStreaming && traceRef.current && !isUser) {
      gsap.fromTo(
        traceRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isStreaming, isUser]);

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
          <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed font-sans relative">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {displayedContent}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-400 animate-pulse rounded-sm align-middle" />
            )}
          </div>
        )}
      </div>

      {!isUser && message.metadata?.context && (
        <div ref={traceRef}>
          <AgentTraceVisualizer index={index} context={message.metadata.context} />
        </div>
      )}
    </div>
  );
}
