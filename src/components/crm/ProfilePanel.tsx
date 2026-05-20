import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { 
  User, 
  Lock, 
  Camera, 
  Loader2, 
  Save, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfilePanel() {
  const { user, loading: authLoading } = useCrmAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agentData, setAgentData] = useState<{
    name: string;
    avatar_url: string | null;
    description: string;
    role: string;
  }>({
    name: '',
    avatar_url: null,
    description: '',
    role: 'agent'
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      fetchAgentProfile();
    }
  }, [user]);

  async function fetchAgentProfile() {
    try {
      setLoading(true);
      if (!user) return;
      
      const { data, error } = await supabase
        .from('agents')
        .select('name, avatar_url, role, description')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAgentData({
          name: data.name || user.user_metadata?.name || user.email?.split('@')[0] || '',
          avatar_url: data.avatar_url,
          description: data.description || '',
          role: data.role || 'agent'
        });
      } else {
        // If agent doesn't exist, use auth data as default
        setAgentData({
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          description: '',
          role: 'agent'
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      toast.error(`Erro ao carregar dados do perfil: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!agentData.name.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    setSaving(true);
    try {
      // 1. Update/Upsert agents table
      const { error: agentError } = await supabase
        .from('agents')
        .upsert({
          user_id: user.id,
          name: agentData.name,
          avatar_url: agentData.avatar_url,
          description: agentData.description,
          email: user.email || '',
          role: agentData.role, // Use existing role to avoid downgrading
          status: 'online'
        }, { onConflict: 'user_id' });

      if (agentError) {
        console.error('Agent update error details:', agentError);
        throw agentError;
      }

      // 2. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          name: agentData.name,
          avatar_url: agentData.avatar_url
        }
      });

      if (authError) throw authError;

      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(`Falha ao atualizar perfil: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
      toast.error('Falha ao alterar senha. Verifique se a nova senha é diferente da atual.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setSaving(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAgentData(prev => ({ ...prev, avatar_url: publicUrl }));
      
      // Update agent table immediately
      await supabase
        .from('agents')
        .upsert({ 
          user_id: user.id,
          name: agentData.name,
          avatar_url: publicUrl,
          email: user.email || ''
        }, { onConflict: 'user_id' });

      toast.success('Foto atualizada!');
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error('Falha ao enviar imagem.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Info & Avatar */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="bg-[#0F1117] border-[#1F232E] overflow-hidden">
            <CardHeader className="text-center pb-2">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Avatar className="w-24 h-24 border-2 border-cyan-500/20">
                  <AvatarImage src={agentData.avatar_url || ''} />
                  <AvatarFallback className="bg-zinc-800 text-cyan-500 text-2xl font-bold">
                    {agentData.name?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 p-1.5 bg-cyan-500 rounded-full cursor-pointer hover:bg-cyan-400 transition-colors shadow-lg"
                >
                  <Camera className="h-4 w-4 text-black" />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    disabled={saving}
                  />
                </label>
              </div>
              <CardTitle className="text-white truncate">{agentData.name}</CardTitle>
              <CardDescription className="text-zinc-500 truncate">{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 border-t border-[#1F232E]">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Conta Verificada</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <AlertCircle className="h-4 w-4 text-cyan-500" />
                <span>Acesso Autorizado</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Forms */}
        <div className="flex-1 space-y-8">
          {/* General Info */}
          <Card className="bg-[#0F1117] border-[#1F232E]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-500" />
                Informações Pessoais
              </CardTitle>
              <CardDescription className="text-zinc-500">Atualize seu nome e detalhes do perfil.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-zinc-400">Nome de Exibição</Label>
                  <Input 
                    id="profile-name" 
                    value={agentData.name}
                    onChange={e => setAgentData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-[#151821] border-[#1F232E] text-white focus:ring-cyan-500/50"
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-bio" className="text-zinc-400">Descrição / Bio</Label>
                  <Textarea 
                    id="profile-bio" 
                    placeholder="Conte um pouco sobre você..."
                    value={agentData.description}
                    onChange={e => setAgentData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-[#151821] border-[#1F232E] text-white min-h-[100px] focus:ring-cyan-500/50"
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t border-[#1F232E] pt-6">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar Alterações
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Security / Password */}
          <Card className="bg-[#0F1117] border-[#1F232E]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-cyan-500" />
                Segurança
              </CardTitle>
              <CardDescription className="text-zinc-500">Altere sua senha de acesso.</CardDescription>
            </CardHeader>
            <form onSubmit={handleChangePassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-zinc-400">Nova Senha</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="bg-[#151821] border-[#1F232E] text-white focus:ring-cyan-500/50"
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-zinc-400">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="bg-[#151821] border-[#1F232E] text-white focus:ring-cyan-500/50"
                    minLength={6}
                    placeholder="Confirme sua senha"
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t border-[#1F232E] pt-6">
                <Button 
                  type="submit" 
                  variant="outline"
                  disabled={saving || !newPassword}
                  className="border-[#1F232E] text-white hover:bg-zinc-800 font-bold gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Alterar Senha
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
