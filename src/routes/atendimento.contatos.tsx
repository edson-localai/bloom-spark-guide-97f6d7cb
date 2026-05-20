import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { Search, User, Car, Loader2, Plus, Edit2, RefreshCw } from 'lucide-react';
import { ContactEditor } from '@/components/crm/ContactEditor';
import { Contact } from '@/types/crm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { syncWhatsAppContacts } from '@/lib/whatsapp.functions';


export const Route = createFileRoute('/atendimento/contatos')({
  component: ContatosPage,
});

function ContatosPage() {
  const { contacts, loading, fetchContacts } = useContacts();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Contact | null>(null);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return contacts.filter(c =>
      !s || (c.name || '').toLowerCase().includes(s) || c.phone.includes(s) ||
      (c.email || '').toLowerCase().includes(s) || (c.vehicle_model || '').toLowerCase().includes(s)
    );
  }, [contacts, search]);

  const newContact = async () => {
    const phone = prompt('Telefone (apenas números):');
    if (!phone) return;
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) return toast.error('Telefone inválido');
    const { data, error } = await supabase.from('contacts').insert({ phone: digits, stage: 'novo' }).select('*').single();
    if (error) return toast.error(error.message);
    fetchContacts();
    setEditing(data as Contact);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestão de Contatos</h1>
          <p className="text-zinc-500 text-sm">Gerencie leads, dados pessoais, endereço e veículo.</p>
        </div>
        <button onClick={newContact} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm">
          <Plus className="h-4 w-4" /> Novo Contato
        </button>
      </div>

      <div className="px-8 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar por nome, telefone, email ou veículo..."
            className="w-full max-w-md bg-[#151821] border border-[#1F232E] rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#151821] rounded-2xl border border-[#1F232E]"><p className="text-zinc-500">Nenhum contato encontrado.</p></div>
        ) : (
          <div className="bg-[#0F1117] rounded-2xl border border-[#1F232E] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#151821] text-zinc-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Estágio</th>
                  <th className="px-6 py-4">Veículo</th>
                  <th className="px-6 py-4">Cidade</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F232E]">
                {filtered.map((contact) => (
                  <tr key={contact.id} className="hover:bg-[#151821]/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#1F232E] flex items-center justify-center"><User className="h-5 w-5 text-zinc-500" /></div>
                        <div>
                          <p className="font-medium text-white">{contact.name || 'Sem nome'}</p>
                          <p className="text-xs text-zinc-500">{contact.phone}{contact.email ? ` · ${contact.email}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {contact.stage || 'novo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Car className="h-4 w-4 text-cyan-500/60" />
                        <span>{[contact.vehicle_brand, contact.vehicle_model, contact.vehicle_year ? `(${contact.vehicle_year})` : ''].filter(Boolean).join(' ') || <span className="text-zinc-600 italic">—</span>}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {contact.city ? `${contact.city}${contact.state ? `/${contact.state}` : ''}` : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setEditing(contact)} className="p-2 text-zinc-500 hover:text-cyan-400" title="Editar">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <ContactEditor
          contact={editing}
          onClose={() => { setEditing(null); fetchContacts(); }}
          onSaved={() => fetchContacts()}
        />
      )}
    </div>
  );
}
