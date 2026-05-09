import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { FileText, Plus, Trash2, Send, Download, Loader2, User, ChevronRight, Calculator, X, Edit2, CheckCircle2, SendHorizonal, Clock, Search, SearchX, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useContacts } from '@/hooks/useContacts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [items, setItems] = useState<ProposalItem[]>([
    { id: '1', description: '', quantity: 1, price: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent' | 'accepted' | 'rejected'>('draft');
  const [isSaving, setIsSaving] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'rejected'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  const uniqueClients = useMemo(() => {
    const clientsMap = new Map();
    proposals.forEach(p => {
      if (p.contact?.id) {
        clientsMap.set(p.contact.id, p.contact.name || p.contact.phone || 'Sem Nome');
      }
    });
    return Array.from(clientsMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [proposals]);

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.quantity * item.price), 0), [items]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredProposals = useMemo(() => {
    let result = proposals;
    
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      const normalizedSearch = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

      result = proposals.filter(p => {
        const pNumber = (p.proposal_number || '').toLowerCase();
        const pName = (p.contact?.name || '').toLowerCase();
        const pBrand = (p.contact?.vehicle_brand || '').toLowerCase();
        const pModel = (p.contact?.vehicle_model || '').toLowerCase();

        // Check standard include
        if (pNumber.includes(s) || pName.includes(s) || pBrand.includes(s) || pModel.includes(s)) {
          return true;
        }

        // Check normalized (flexible) match
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
        
        if (normalizedSearch.length > 0) {
          if (normalize(pNumber).includes(normalizedSearch) || 
              normalize(pName).includes(normalizedSearch) || 
              normalize(pBrand).includes(normalizedSearch) || 
              normalize(pModel).includes(normalizedSearch)) {
            return true;
          }
        }

        return false;
      });
    }

    return [...result].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [proposals, debouncedSearch, sortOrder, statusFilter]);

  useEffect(() => {
    fetchProposals();
  }, []);

  async function fetchProposals() {
    setLoadingProposals(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, contact:contact_id(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProposals(false);
    }
  }

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleEdit = (proposal: any) => {
    setEditingProposalId(proposal.id);
    setSelectedContactId(proposal.contact_id || '');
    setItems(proposal.items as ProposalItem[]);
    setNotes(proposal.notes || '');
    setStatus(proposal.status || 'draft');
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingProposalId(null);
    setItems([{ id: '1', description: '', quantity: 1, price: 0 }]);
    setSelectedContactId('');
    setNotes('');
    setStatus('draft');
  };

  const generatePDF = (proposal: any) => {
    const doc = new jsPDF();
    const contact = proposal.contact;

    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(0, 204, 238);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('HCB AR CONDICIONADO', 20, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('SOLUÇÕES AUTOMOTIVAS PREMIUM', 20, 32);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`Proposta: ${proposal.proposal_number}`, 140, 50);
    doc.text(`Data: ${new Date(proposal.created_at).toLocaleDateString()}`, 140, 55);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nome: ${contact?.name || 'Não informado'}`, 20, 58);
    doc.text(`Telefone: ${contact?.phone || '-'}`, 20, 63);
    doc.text(`Veículo: ${contact?.vehicle_brand || ''} ${contact?.vehicle_model || ''} ${contact?.vehicle_year ? `(${contact.vehicle_year})` : ''}`, 20, 68);

    const tableData = proposal.items.map((item: any) => [
      item.description,
      item.quantity,
      `R$ ${item.price.toFixed(2)}`,
      `R$ ${(item.quantity * item.price).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Descrição', 'Qtd', 'Unitário', 'Subtotal']],
      body: tableData,
      headStyles: { fillColor: [0, 204, 238], textColor: [0, 0, 0], fontStyle: 'bold' },
      foot: [['', '', 'TOTAL GERAL', `R$ ${proposal.total.toFixed(2)}`]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    if (proposal.notes) {
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', 20, finalY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(proposal.notes, 20, finalY + 7, { maxWidth: 170 });
    }

    doc.save(`Proposta_HCB_${proposal.proposal_number}.pdf`);
    toast.success('Download iniciado!');
  };

  const handleSave = async () => {
    if (!selectedContactId || items.some(i => !i.description)) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        contact_id: selectedContactId,
        agent_id: user?.id,
        items: items as any,
        total: subtotal,
        notes: notes,
        status: status
      };

      let result;
      if (editingProposalId) {
        const { data, error } = await supabase
          .from('proposals')
          .update(payload)
          .eq('id', editingProposalId)
          .select('*, contact:contact_id(*)')
          .single();
        if (error) throw error;
        result = data;
        toast.success('Proposta atualizada!');
      } else {
        const { data, error } = await supabase
          .from('proposals')
          .insert(payload)
          .select('*, contact:contact_id(*)')
          .single();
        if (error) throw error;
        result = data;
        toast.success('Proposta gerada!');
      }

      handleCancel();
      fetchProposals();
      
      if (result) {
        generatePDF(result);
      }
    } catch (err) {
      toast.error('Erro ao salvar proposta.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase"><CheckCircle2 className="h-2.5 w-2.5" /> Aprovada</span>;
      case 'sent': return <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase"><SendHorizonal className="h-2.5 w-2.5" /> Enviada</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 uppercase"><X className="h-2.5 w-2.5" /> Rejeitada</span>;
      default: return <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 uppercase"><Clock className="h-2.5 w-2.5" /> Rascunho</span>;
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#0A0A0F' }}>
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Propostas & Orçamentos</h1>
          <p className="text-zinc-500 text-sm">Gere e gerencie orçamentos profissionais.</p>
        </div>
        <button 
          onClick={() => { handleCancel(); setIsCreating(true); }}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova Proposta
        </button>
      </div>

      <AnimatePresence>
        {!isCreating && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-8 py-4"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por cliente, veículo ou Nº da proposta..."
                  className="w-full bg-[#151821] border border-[#1F232E] rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-[#151821] border border-[#1F232E] rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
                >
                  <option value="all">Todos os Status</option>
                  <option value="draft">Rascunho</option>
                  <option value="sent">Enviada</option>
                  <option value="accepted">Aprovada</option>
                  <option value="rejected">Rejeitada</option>
                </select>

                <div className="flex items-center gap-2 bg-[#151821] border border-[#1F232E] rounded-xl p-1">
                  <button
                    onClick={() => setSortOrder('newest')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sortOrder === 'newest' 
                        ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Mais Recentes
                  </button>
                  <button
                    onClick={() => setSortOrder('oldest')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      sortOrder === 'oldest' 
                        ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Mais Antigas
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          {isCreating ? (
            <motion.div 
              key="creator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-4xl mx-auto bg-[#0F1117] rounded-3xl border border-[#1F232E] overflow-hidden"
            >
              <div className="p-6 border-b border-[#1F232E] flex justify-between items-center bg-[#151821]/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-cyan-500" />
                  {editingProposalId ? 'Editar Orçamento' : 'Gerador de Orçamento'}
                </h2>
                <button onClick={handleCancel} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status da Proposta</label>
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-[#151821] border border-[#1F232E] rounded-xl p-3 text-white focus:border-cyan-500/50 outline-none"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="sent">Enviada</option>
                      <option value="accepted">Aprovada</option>
                      <option value="rejected">Rejeitada</option>
                    </select>
                  </div>
                </div>

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
                    onClick={handleCancel}
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
                    {editingProposalId ? 'Atualizar & Baixar' : 'Gerar & Baixar'}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingProposals ? (
                <div className="col-span-full flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                </div>
              ) : filteredProposals.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-[#151821]/30 rounded-3xl border-2 border-dashed border-[#1F232E]">
                  <SearchX className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-zinc-500 font-medium">Nenhum resultado encontrado</h3>
                  <p className="text-zinc-700 text-sm">Tente buscar por outro termo ou limpe a busca.</p>
                </div>
              ) : (
                filteredProposals.map((prop) => (
                  <motion.div 
                    layout
                    key={prop.id}
                    className="bg-[#0F1117] border border-[#1F232E] rounded-2xl p-6 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3">
                      {getStatusBadge(prop.status)}
                    </div>

                    <div className="flex justify-between items-start mb-4">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-1 rounded bg-[#1F232E] text-zinc-500 uppercase tracking-widest mt-1">
                        {prop.proposal_number}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-white mb-1 truncate pr-16">{prop.contact?.name || 'Cliente'}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-4">
                      {new Date(prop.created_at).toLocaleDateString()}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-[#1F232E]">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Total</span>
                        <span className="text-lg font-black text-cyan-400 font-mono">R$ {prop.total.toFixed(2)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(prop)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-all group/btn"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button 
                          onClick={() => generatePDF(prop)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-black text-zinc-400 transition-all group/btn"
                          title="Baixar PDF"
                        >
                          <Download className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
