import { createFileRoute } from '@tanstack/react-router';
import { Inbox } from 'lucide-react';

export const Route = createFileRoute('/atendimento/')({
  component: InboxPage,
});

function InboxPage() {
  return (
    <div className="h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div
          className="h-14 w-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
          style={{ background: 'rgba(0,204,238,0.1)', color: '#00CCEE' }}
        >
          <Inbox className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">Inbox</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Fase 1 concluída — fundação do CRM pronta. As conversas aparecerão aqui na Fase 2,
          junto com o Kanban arrastável e o painel de chat em tempo real.
        </p>
      </div>
    </div>
  );
}
