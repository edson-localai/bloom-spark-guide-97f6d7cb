import { createFileRoute } from '@tanstack/react-router';
import { useContacts } from '@/hooks/useContacts';
import { Search, User, Car, Tag, MoreHorizontal, Loader2, Plus } from 'lucide-react';

export const Route = createFileRoute('/atendimento/contatos')({
  component: ContatosPage,
});

function ContatosPage() {
  const { contacts, loading } = useContacts();

  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestão de Contatos</h1>
          <p className="text-zinc-500 text-sm">Gerencie os clientes e veículos cadastrados no sistema.</p>
        </div>
        <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
          <Plus className="h-4 w-4" />
          Novo Contato
        </button>
      </div>

      <div className="px-8 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou veículo..."
            className="w-full max-w-md bg-[#151821] border border-[#1F232E] rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-20 bg-[#151821] rounded-2xl border border-[#1F232E]">
            <p className="text-zinc-500">Nenhum contato encontrado.</p>
          </div>
        ) : (
          <div className="bg-[#0F1117] rounded-2xl border border-[#1F232E] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#151821] text-zinc-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Veículo</th>
                  <th className="px-6 py-4">Tags</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F232E]">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-[#151821]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#1F232E] flex items-center justify-center">
                          <User className="h-5 w-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{contact.name || 'Sem nome'}</p>
                          <p className="text-xs text-zinc-500">{contact.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Car className="h-4 w-4 text-cyan-500/60" />
                        <span>
                          {contact.vehicle_brand} {contact.vehicle_model} {contact.vehicle_year ? `(${contact.vehicle_year})` : ''}
                        </span>
                        {!contact.vehicle_brand && <span className="text-zinc-600 italic">Não informado</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags?.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {tag}
                          </span>
                        )) || <span className="text-zinc-600">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
