import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ConversationList } from '@/components/crm/ConversationList';
import { ChatWindow } from '@/components/crm/ChatWindow';
import { ContactSidebar } from '@/components/crm/ContactSidebar';
import { useConversations } from '@/hooks/useConversations';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/atendimento/')({
  component: InboxPage,
});

function InboxPage() {
  const { conversations, loading } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedId) || null;
  }, [conversations, selectedId]);

  if (loading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* List Column */}
      <div className="w-80 shrink-0 h-full border-r border-[#1F232E]">
        <ConversationList
          conversations={conversations as any}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Main Chat Column */}
      <div className="flex-1 h-full min-w-0">
        <ChatWindow conversation={selectedConversation as any} />
      </div>

      {/* Details Column */}
      {selectedConversation && (
        <ContactSidebar contact={selectedConversation.contact as any} />
      )}
    </div>
  );
}
