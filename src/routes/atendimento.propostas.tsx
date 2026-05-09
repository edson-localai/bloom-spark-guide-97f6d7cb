import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { FileText, Plus, Trash2, Send, Download, Loader2, User, ChevronRight, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useContacts } from '@/hooks/useContacts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const Route = createFileRoute('/atendimento/propostas')({
  component: PropostasPage,
});

interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

function PropostasPage() {
  const { contacts } = useContacts();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [items, setItems] = useState<ProposalItem[]>([
    { id: '1', description: '', quantity: 1, price: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.quantity * item.price), 0), [items]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSave = async () => {
    if (!selectedContactId || items.some(i => !i.description)) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('proposals').insert({
        contact_id: selectedContactId,
        agent_id: user?.id,
        items: items as any,
        total: subtotal,
        notes: notes,
        status: 'draft'
      });

      if (error) throw error;

      toast.success('Proposta gerada com sucesso!');
      setIsCreating(false);
      setItems([{ id: '1', description: '', quantity: 1, price: 0 }]);
      setSelectedContactId('');
    } catch (err) {
      toast.error('Erro ao gerar proposta.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Propostas & Orçamentos</h1>
          <p className="text-zinc-500 text-sm">Gere orçamentos profissionais em PDF para seus clientes.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova Proposta
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        <AnimatePresence>
          {isCreating ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-4xl mx-auto bg-[#0F1117] rounded-3xl border border-[#1F232E] overflow-hidden"
            >
              <div className="p-6 border-b border-[#1F232E] flex justify-between items-center bg-[#151821]/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-cyan-500" />
                  Gerador de Orçamento
                </h2>
                <button onClick={() => setIsCreating(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Seleção de Contato */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cliente</label>
                  <select 
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full bg-[#151821] border border-[#1F232E] rounded-xl p-3 text-white focus:border-cyan-500/50 outline-none"
                  >
                    <option value="">Selecione um cliente...</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name || c.phone} {c.vehicle_brand ? `(${c.vehicle_brand})` : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Tabela de Itens */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Itens do Orçamento</label>
                    <button onClick={addItem} className="text-xs text-cyan-500 hover:underline flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Adicionar Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={item.id} className="flex gap-4 items-start">
                        <div className="flex-1">
                          <input 
                            placeholder="Descrição da peça ou serviço..."
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full bg-black/20 border border-[#1F232E] rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <div className="w-20">
                          <input 
                            type="number"
                            placeholder="Qtd"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full bg-black/20 border border-[#1F232E] rounded-lg p-2.5 text-sm text-white text-center"
                          />
                        </div>
                        <div className="w-32">
                          <input 
                            type="number"
                            placeholder="Preço"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full bg-black/20 border border-[#1F232E] rounded-lg p-2.5 text-sm text-white"
                          />
                        </div>
                        <button onClick={() => removeItem(item.id)} className="mt-2.5 text-zinc-600 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumo e Notas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#1F232E]">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Observações (Opcional)</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Garantia de 6 meses, prazo de entrega..."
                      className="w-full h-32 bg-black/20 border border-[#1F232E] rounded-xl p-3 text-sm text-white resize-none"
                    />
                  </div>
                  <div className="bg-[#151821] rounded-2xl p-6 flex flex-col justify-between border border-[#1F232E]">
                    <div className="space-y-2">
                      <div className="flex justify-between text-zinc-500">
                        <span className="text-xs">Subtotal</span>
                        <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500">
                        <span className="text-xs">Impostos</span>
                        <span className="font-mono">R$ 0,00</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-[#1F232E]">
                      <span className="text-sm font-bold text-white uppercase tracking-widest">Total Geral</span>
                      <span className="text-2xl font-black text-cyan-400 font-mono shadow-cyan-500/20 drop-shadow-sm">
                        R$ {subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-2.5 rounded-xl border border-[#1F232E] text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-2.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Gerar Proposta Final
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full text-center py-20 bg-[#151821]/30 rounded-3xl border-2 border-dashed border-[#1F232E]">
                <FileText className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-zinc-500 font-medium">Nenhuma proposta recente</h3>
                <p className="text-zinc-700 text-sm">Comece criando um novo orçamento profissional.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
