import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  Search, 
  MoreVertical,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Mail,
  Smartphone,
  Lock,
  User,
  Pencil,
  Trash2,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute('/atendimento/usuarios')({
  component: UsuariosPage,
});

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'supervisor' | 'agent';
  department: string;
  user_id: string | null;
  status: string;
}

function UsuariosPage() {
  const { roles, loading: authLoading } = useCrmAuth();
  const isAdmin = roles.includes('admin');
  
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'supervisor' | 'agent'>('agent');
  const [userDepartment, setUserDepartment] = useState('atendimento');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_agents_with_email');
      
      if (error) throw error;
      const sorted = ((data as UserProfile[]) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
      setUsers(sorted);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      toast.error('Não foi possível carregar a lista de usuários.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: userEmail,
          password: userPassword,
          name: userName,
          role: userRole
        }
      });

      if (error) throw error;

      toast.success('Usuário criado com sucesso!');
      setIsModalOpen(false);
      
      // Reset form
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setUserRole('agent');
      
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      toast.error(err instanceof Error ? err.message : 'Falha ao criar usuário.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role);
    setUserPassword(''); // Don't show password, allow change if provided
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.user_id) return;
    
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-user', {
        body: {
          userId: editingUser.user_id,
          name: userName,
          email: userEmail !== editingUser.email ? userEmail : undefined,
          password: userPassword || undefined,
          role: userRole
        }
      });

      if (error) throw error;

      toast.success('Usuário atualizado com sucesso!');
      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      toast.error(err instanceof Error ? err.message : 'Falha ao atualizar usuário.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) throw error;

      toast.success('Usuário excluído com sucesso!');
      fetchUsers();
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      toast.error(err instanceof Error ? err.message : 'Falha ao excluir usuário.');
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'supervisor' | 'agent') => {
    try {
      // 1. Update user_roles table
      const { error: roleErr } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);
      
      if (roleErr) throw roleErr;

      // 2. Update agents table
      const { error: agentErr } = await supabase
        .from('agents')
        .update({ role: newRole })
        .eq('user_id', userId);
      
      if (agentErr) throw agentErr;

      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      toast.success('Permissão atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar papel:', err);
      toast.error('Falha ao atualizar permissões.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || (isAdmin && loading)) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0A0A0F]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-[#0A0A0F]">
        <div className="max-w-md text-center bg-[#0F1117] border border-[#1F232E] rounded-3xl p-12">
          <div className="h-16 w-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Você não tem permissão para gerenciar usuários. Este módulo é restrito apenas a administradores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0A0A0F]">
      <div className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-cyan-500" />
            Controle de Acessos
          </h1>
          <p className="text-zinc-500 text-sm">Gerencie permissões e funções da equipe.</p>
        </div>
        
        <div className="relative">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-[#0F1117] border-[#1F232E] text-white sm:max-w-[425px] rounded-3xl z-[1000]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-cyan-500" />
                Criar Novo Usuário
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="name"
                      placeholder="Ex: João Silva"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-[#151821] border-[#1F232E] pl-10 h-12 rounded-xl focus:ring-cyan-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@empresa.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="bg-[#151821] border-[#1F232E] pl-10 h-12 rounded-xl focus:ring-cyan-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Nível de Acesso</Label>
                  <Select value={userRole} onValueChange={(value: any) => setUserRole(value)}>
                    <SelectTrigger className="bg-[#151821] border-[#1F232E] h-12 rounded-xl">
                      <SelectValue placeholder="Selecione um nível" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151821] border-[#1F232E] text-white">
                      <SelectItem value="agent">Agente (Apenas Atendimento)</SelectItem>
                      <SelectItem value="supervisor">Supervisor (Gestão de Equipe)</SelectItem>
                      <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pass" className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Senha Provisória</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="pass"
                      type="password"
                      placeholder="••••••••"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="bg-[#151821] border-[#1F232E] pl-10 h-12 rounded-xl focus:ring-cyan-500/50"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 italic">Mínimo 6 caracteres.</p>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold h-12 rounded-xl"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando Usuário...
                    </>
                  ) : (
                    "Criar Usuário"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-[#0F1117] border-[#1F232E] text-white sm:max-w-[425px] rounded-3xl z-[1000]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Pencil className="h-5 w-5 text-cyan-500" />
                Editar Usuário
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="edit-name"
                      placeholder="Ex: João Silva"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-[#151821] border-[#1F232E] pl-10 h-12 rounded-xl focus:ring-cyan-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="edit-email"
                      type="email"
                      placeholder="email@empresa.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="bg-[#151821] border-[#1F232E] pl-10 h-12 rounded-xl focus:ring-cyan-500/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-role" className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Nível de Acesso</Label>
                  <Select value={userRole} onValueChange={(value: any) => setUserRole(value)}>
                    <SelectTrigger className="bg-[#151821] border-[#1F232E] h-12 rounded-xl">
                      <SelectValue placeholder="Selecione um nível" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151821] border-[#1F232E] text-white">
                      <SelectItem value="agent">Agente (Apenas Atendimento)</SelectItem>
                      <SelectItem value="supervisor">Supervisor (Gestão de Equipe)</SelectItem>
                      <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-pass" className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Nova Senha (opcional)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      id="edit-pass"
                      type="password"
                      placeholder="Deixe em branco para manter"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="bg-[#151821] border-[#1F232E] pl-10 h-12 rounded-xl focus:ring-cyan-500/50"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold h-12 rounded-xl"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando Alterações...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-8 py-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full bg-[#151821] border border-[#1F232E] rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 pt-4 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <motion.div
              layout
              key={user.id}
              className="bg-[#0F1117] border border-[#1F232E] rounded-3xl p-6 hover:border-cyan-500/20 transition-all group relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-xl font-bold text-cyan-500 border border-[#1F232E]">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit ${
                      user.role === 'admin' ? 'bg-cyan-500/10 text-cyan-500' :
                      user.role === 'supervisor' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-zinc-500/10 text-zinc-500'
                    }`}>
                      {user.role}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all"
                    title="Editar Usuário"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => user.user_id && handleDeleteUser(user.user_id)}
                    className="p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    title="Excluir Usuário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-bold text-white truncate">{user.name}</h3>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs mt-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 py-3 border-y border-[#1F232E]">
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${user.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                      <span className="text-xs text-zinc-400 capitalize">{user.status}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">ID</p>
                    <p className="text-xs text-zinc-400 font-mono">#{user.id.split('-')[0]}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Alterar Nível de Acesso</p>
                <div className="grid grid-cols-3 gap-2">
                  <RoleButton 
                    active={user.role === 'agent'} 
                    onClick={() => user.user_id && updateUserRole(user.user_id, 'agent')}
                    label="Agente"
                  />
                  <RoleButton 
                    active={user.role === 'supervisor'} 
                    onClick={() => user.user_id && updateUserRole(user.user_id, 'supervisor')}
                    label="Sup"
                  />
                  <RoleButton 
                    active={user.role === 'admin'} 
                    onClick={() => user.user_id && updateUserRole(user.user_id, 'admin')}
                    label="Admin"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
        active 
          ? 'bg-cyan-500 border-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
          : 'bg-[#151821] border-[#1F232E] text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
      }`}
    >
      {label}
    </button>
  );
}
