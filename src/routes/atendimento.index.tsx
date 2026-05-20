import { useState, useMemo, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ConversationList } from '@/components/crm/ConversationList';
import { ChatWindow } from '@/components/crm/ChatWindow';
import { ContactSidebar } from '@/components/crm/ContactSidebar';
import { useConversations, ConversationFilter } from '@/hooks/useConversations';
import { Loader2, ArrowLeft, Info, Inbox, User, Users, CheckCircle2, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

export const Route = createFileRoute('/atendimento/')({
  component: InboxPage,
});

type Pane = 'list' | 'chat' | 'details';

function InboxPage() {
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const { conversations, loading } = useConversations({ filter, search: debouncedSearch });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pane, setPane] = useState<Pane>('list');
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedId) || null,
    [conversations, selectedId],
  );

  useEffect(() => {
    if (selectedId) setPane('chat');
  }, [selectedId]);

  const navItems = [
    { id: 'all', label: 'Todas', icon: Inbox },
    { id: 'mine', label: 'Minhas', icon: User },
    { id: 'unassigned', label: 'Não Atribuídas', icon: Users },
    { id: 'resolved', label: 'Resolvidas', icon: CheckCircle2 },
  ];

  if (loading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  const renderSidebar = () => (
    <div className="w-16 md:w-48 shrink-0 flex flex-col border-r border-[#1F232E]" style={{ background: '#0A0A0F' }}>
      <div className="flex-1 py-4 px-2 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as ConversationFilter)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              filter === item.id 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="hidden md:block truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Mobile: single-pane navigation
  if (isMobile) {
    if (pane === 'chat' && selectedConversation) {
      return (
        <div className="h-full flex flex-col">
          <div
            className="h-12 px-3 flex items-center gap-2 shrink-0 border-b"
            style={{ background: '#0F1117', borderColor: '#1F232E' }}
          >
            <button
              onClick={() => { setSelectedId(null); setPane('list'); }}
              className="p-2 text-zinc-300 hover:text-white"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <p className="flex-1 text-sm font-semibold text-white truncate">
              {(selectedConversation as any).contact?.name || selectedConversation.whatsapp_chat_id}
            </p>
            <button
              onClick={() => setPane('details')}
              className="p-2 text-zinc-300 hover:text-cyan-400"
              aria-label="Detalhes"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatWindow conversation={selectedConversation as any} />
          </div>
        </div>
      );
    }

    if (pane === 'details' && selectedConversation) {
      return (
        <div className="h-full flex flex-col">
          <div
            className="h-12 px-3 flex items-center gap-2 shrink-0 border-b"
            style={{ background: '#0F1117', borderColor: '#1F232E' }}
          >
            <button
              onClick={() => setPane('chat')}
              className="p-2 text-zinc-300 hover:text-white"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <p className="flex-1 text-sm font-semibold text-white">Detalhes do contato</p>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ContactSidebar
              contact={(selectedConversation as any).contact}
              conversationId={selectedConversation.id}
              variant="mobile"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 space-y-3" style={{ background: '#0F1117', borderBottom: '1px solid #1F232E' }}>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id as ConversationFilter)}
                className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                  filter === item.id 
                    ? 'bg-cyan-500 text-black font-bold' 
                    : 'bg-[#1F232E] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversa..."
              className="w-full bg-[#151821] border border-[#1F232E] rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ConversationList
            conversations={conversations as any}
            selectedId={selectedId}
            onSelect={(id) => { setSelectedId(id); setPane('chat'); }}
          />
        </div>
      </div>
    );
  }

  // Desktop / Tablet
  return (
    <div className="h-full flex overflow-hidden">
      {renderSidebar()}
      
      <div className="w-72 lg:w-80 shrink-0 h-full flex flex-col border-r border-[#1F232E]" style={{ background: '#0F1117' }}>
        <div className="p-4 border-b border-[#1F232E]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversa..."
              className="w-full bg-[#151821] border border-[#1F232E] rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations as any}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      <div className="flex-1 h-full min-w-0">
        <ChatWindow conversation={selectedConversation as any} />
      </div>

      {selectedConversation && (
        <div className="hidden xl:block">
          <ContactSidebar
            contact={(selectedConversation as any).contact}
            conversationId={selectedConversation.id}
          />
        </div>
      )}
    </div>
  );
}