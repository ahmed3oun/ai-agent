'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import Sidebar from '@/components/layout/Sidebar';
import ChatWorkspace from '@/components/chat/ChatWorkspace';
import KnowledgeBase from '@/components/knowledge/KnowledgeBase';

export default function Home() {
  const { activeTab } = useAppStore();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Workspace Component */}
      <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
        {activeTab === 'chat' ? <ChatWorkspace /> : <KnowledgeBase />}
      </main>
    </div>
  );
}
