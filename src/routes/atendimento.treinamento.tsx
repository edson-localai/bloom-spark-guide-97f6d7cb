import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { 
  PlayCircle, 
  BookOpen, 
  Users, 
  UserRound, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  MessageSquare,
  FileText,
  Kanban,
  BarChart3,
  Smartphone,
  Settings,
  GraduationCap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCrmAuth } from '@/hooks/useCrmAuth';

export const Route = createFileRoute('/atendimento/treinamento')({
  component: TreinamentoPage,
});

type UserType = 'vendedor' | 'gerente' | 'admin';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'text' | 'practical';
  icon: any;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

const COURSES: Record<UserType, Module[]> = {
  vendedor: [
    {
      id: 'v-1',
      title: 'Primeiros Passos',
      lessons: [
        { id: 'l1', title: 'Visão Geral do Inbox', description: 'Aprenda a navegar pelas conversas e responder clientes.', duration: '5 min', type: 'video', icon: MessageSquare },
        { id: 'l2', title: 'Atendimento via WhatsApp', description: 'Como usar a integração oficial para falar com clientes.', duration: '8 min', type: 'video', icon: Smartphone },
      ]
    },
    {
      id: 'v-2',
      title: 'Vendas & Orçamentos',
      lessons: [
        { id: 'l3', title: 'Gerando Propostas Profissionais', description: 'Passo a passo para criar e enviar PDFs de orçamentos.', duration: '10 min', type: 'video', icon: FileText },
        { id: 'l4', title: 'Gestão de Kanban', description: 'Como organizar seu funil de vendas e não perder leads.', duration: '6 min', type: 'video', icon: Kanban },
      ]
    }
  ],
  gerente: [
    {
      id: 'g-1',
      title: 'Gestão de Equipe',
      lessons: [
        { id: 'g-l1', title: 'Monitoramento em Tempo Real', description: 'Como supervisionar as conversas e dar suporte aos vendedores.', duration: '7 min', type: 'video', icon: Users },
        { id: 'g-l2', title: 'Análise de Dashboard', description: 'Interpretando métricas de conversão e tempo de resposta.', duration: '12 min', type: 'video', icon: BarChart3 },
      ]
    }
  ],
  admin: [
    {
      id: 'a-1',
      title: 'Configurações Avançadas',
      lessons: [
        { id: 'a-l1', title: 'Gestão de Usuários', description: 'Como criar contas e definir permissões de acesso.', duration: '5 min', type: 'video', icon: ShieldCheck },
        { id: 'a-l2', title: 'Configuração da Instância', description: 'Conectando números e ajustando webhooks.', duration: '15 min', type: 'video', icon: Settings },
      ]
    }
  ]
};

function TreinamentoPage() {
  const { roles } = useCrmAuth();
  const userRole = roles[0] || 'agent';
  const isAdmin = userRole === 'admin';

  const getDefaultUserType = (role: string): UserType => {
    if (role === 'admin') return 'admin';
    if (role === 'supervisor') return 'gerente';
    return 'vendedor';
  };

  const [activeUserType, setActiveUserType] = useState<UserType>(getDefaultUserType(userRole));
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    setActiveUserType(getDefaultUserType(userRole));
  }, [userRole]);

  return (
    <div className="h-full flex flex-col bg-[#0A0A0F]">
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Centro de Treinamento HCB</h1>
        </div>
        <p className="text-zinc-500 text-sm">Cursos especializados para sua função de <span className="text-cyan-400 font-bold uppercase">{userRole}</span>.</p>
      </div>

      {/* Role Selector - Only visible/interactive for Admins */}
      <div className="px-8 mb-8">
        <div className="flex gap-4 p-1 bg-[#151821] rounded-2xl w-fit border border-[#1F232E]">
          {(isAdmin || activeUserType === 'vendedor') && (
            <RoleTab 
              active={activeUserType === 'vendedor'} 
              onClick={() => isAdmin && setActiveUserType('vendedor')}
              icon={UserRound}
              label="Vendedor"
              disabled={!isAdmin}
            />
          )}
          {(isAdmin || activeUserType === 'gerente') && (
            <RoleTab 
              active={activeUserType === 'gerente'} 
              onClick={() => isAdmin && setActiveUserType('gerente')}
              icon={Users}
              label="Gerente"
              disabled={!isAdmin}
            />
          )}
          {(isAdmin || activeUserType === 'admin') && (
            <RoleTab 
              active={activeUserType === 'admin'} 
              onClick={() => isAdmin && setActiveUserType('admin')}
              icon={ShieldCheck}
              label="Administrador"
              disabled={!isAdmin}
            />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-8 space-y-8">
            {COURSES[activeUserType].map((module) => (
              <section key={module.id} className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                    {module.id.split('-')[1]}
                  </span>
                  {module.title}
                </h2>
                <div className="grid gap-3">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                        selectedLesson?.id === lesson.id 
                          ? 'bg-cyan-500/5 border-cyan-500/30' 
                          : 'bg-[#0F1117] border-[#1F232E] hover:border-zinc-700'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
                        selectedLesson?.id === lesson.id ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'
                      }`}>
                        <lesson.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-0.5">{lesson.title}</h3>
                        <p className="text-xs text-zinc-500 truncate">{lesson.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-zinc-600 block mb-1 uppercase tracking-wider">{lesson.duration}</span>
                        <div className="flex items-center gap-1 text-cyan-500 text-xs font-semibold">
                          <PlayCircle className="h-3 w-3" />
                          Assistir
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Player/Detail Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-0 space-y-6">
              {selectedLesson ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0F1117] border border-[#1F232E] rounded-3xl overflow-hidden shadow-2xl"
                >
                  <div className="aspect-video bg-zinc-900 flex items-center justify-center border-b border-[#1F232E] relative group cursor-pointer">
                    <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <PlayCircle className="h-16 w-16 text-cyan-500 drop-shadow-lg" />
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                       <span className="text-[10px] font-bold bg-black/60 px-2 py-1 rounded-md text-white backdrop-blur-sm">PLAYER HCB</span>
                       <span className="text-[10px] font-bold bg-cyan-500 px-2 py-1 rounded-md text-black">{selectedLesson.duration}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3">{selectedLesson.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                      {selectedLesson.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        Aprenda na prática como otimizar seu tempo.
                      </div>
                      <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-colors mt-4">
                        Marcar como Concluído
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-[#151821] border border-dashed border-[#1F232E] rounded-3xl p-12 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-600 mx-auto mb-6">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <h3 className="text-white font-bold mb-2">Selecione uma aula</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Clique em qualquer aula ao lado para iniciar seu treinamento e dominar o sistema HCB.
                  </p>
                </div>
              )}

              {/* Progress Summary */}
              <div className="bg-[#0F1117] border border-[#1F232E] rounded-3xl p-6">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Seu Progresso</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Total Concluído</span>
                    <span className="text-cyan-500 font-bold">0%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-0 transition-all duration-1000" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                    <ChevronRight className="h-3 w-3" />
                    Complete as aulas para ganhar o selo HCB Expert
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleTab({ active, onClick, icon: Icon, label, disabled }: { active: boolean; onClick: () => void; icon: any; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active 
          ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
          : disabled ? 'text-zinc-700 cursor-default' : 'text-zinc-500 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
