import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/atendimento/contatos')({
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-4">Gestão de Contatos</h1>
      <p className="text-zinc-500 italic">Em desenvolvimento...</p>
    </div>
  ),
});
