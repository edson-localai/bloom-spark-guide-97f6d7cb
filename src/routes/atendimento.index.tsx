import { useState, useMemo, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ConversationList } from '@/components/crm/ConversationList';
import { ChatWindow } from '@/components/crm/ChatWindow';
import { ContactSidebar } from '@/components/crm/ContactSidebar';
import { useConversations } from '@/hooks/useConversations';
import { Loader2, ArrowLeft, Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const Route = createFileRoute('/atendimento/')({
  component: InboxPage,
});

type Pane = 'list' | 'chat' | 'details';

function InboxPage() {
  const { conversations, loading } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pane, setPane] = useState<Pane>('list');
  const isMobile = useIsMobile();

  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedId) || null,
    [conversations, selectedId],
  );

  useEffect(() => {
    if (selectedId) setPane('chat');
  }, [selectedId]);

  if (loading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

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
      <div className="h-full">
        <ConversationList
          conversations={conversations as any}
          selectedId={selectedId}
          onSelect={(id) => { setSelectedId(id); setPane('chat'); }}
        />
      </div>
    );
  }

  // Desktop / Tablet
  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-72 lg:w-80 shrink-0 h-full border-r border-[#1F232E]">
        <ConversationList
          conversations={conversations as any}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
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
