import { createFileRoute } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
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
  GraduationCap,
  Trophy,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Route = createFileRoute('/atendimento/treinamento')({
  component: TreinamentoPage,
});

type UserType = 'vendedor' | 'gerente' | 'admin';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'text' | 'practical';
  icon: any;
  quiz?: Question[];
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
      title: 'Trilha do Atendente HCB',
      lessons: [
        { 
          id: 'v-l1', 
          title: '1. Domine o Inbox', 
          description: 'Aprenda a organizar suas conversas e nunca deixar um cliente esperando.', 
          duration: '5 min', 
          type: 'video', 
          icon: MessageSquare,
          quiz: [
            { id: 'q1', question: 'Qual a principal função do Inbox?', options: ['Organizar conversas', 'Gerar relatórios', 'Configurar o bot'], correctAnswer: 0 }
          ]
        },
        { 
          id: 'v-l2', 
          title: '2. WhatsApp Profissional', 
          description: 'Como usar as ferramentas de automação e respostas rápidas.', 
          duration: '8 min', 
          type: 'video', 
          icon: Smartphone,
          quiz: [
            { id: 'q2', question: 'Para que servem as respostas rápidas?', options: ['Agilizar o atendimento', 'Bloquear clientes', 'Mudar o status da conversa'], correctAnswer: 0 }
          ]
        },
        { id: 'v-l3', title: '3. Gestão de Contatos', description: 'Cadastrando veículos e informações vitais do cliente.', duration: '7 min', type: 'video', icon: Users },
      ]
    },
    {
      id: 'v-2',
      title: 'Trilha do Consultor de Vendas',
      lessons: [
        { id: 'v-l4', title: '1. O Poder do Kanban', description: 'Como mover leads pelo funil até o fechamento.', duration: '10 min', type: 'video', icon: Kanban },
        { id: 'v-l5', title: '2. Propostas Imbatíveis', description: 'Criando orçamentos profissionais em PDF que vendem por você.', duration: '12 min', type: 'video', icon: FileText },
        { id: 'v-l6', title: '3. Técnicas de Fechamento', description: 'Como usar o histórico do CRM para converter mais.', duration: '8 min', type: 'video', icon: CheckCircle2 },
      ]
    }
  ],
  gerente: [
    {
      id: 'g-1',
      title: 'Trilha de Liderança e Performance',
      lessons: [
        { id: 'g-l1', title: '1. Supervisão de Atendimento', description: 'Como monitorar a qualidade e o tom de voz da equipe.', duration: '10 min', type: 'video', icon: Users },
        { id: 'g-l2', title: '2. Análise de Funil', description: 'Identificando gargalos no Kanban da equipe.', duration: '15 min', type: 'video', icon: BarChart3 },
        { id: 'g-l3', title: '3. Relatórios Estratégicos', description: 'Extraindo dados para tomada de decisão.', duration: '12 min', type: 'video', icon: FileText },
      ]
    }
  ],
  admin: [
    {
      id: 'a-1',
      title: 'Trilha de Gestor de Sistema',
      lessons: [
        { id: 'a-l1', title: '1. Segurança e Acesso', description: 'Gerenciando usuários, senhas e níveis de permissão.', duration: '7 min', type: 'video', icon: ShieldCheck },
        { id: 'a-l2', title: '2. Conectividade WhatsApp', description: 'Manutenção de instâncias e estabilidade do sistema.', duration: '15 min', type: 'video', icon: Settings },
        { id: 'a-l3', title: '3. Automações Globais', description: 'Configurando respostas automáticas e fluxos do CRM.', duration: '20 min', type: 'video', icon: Smartphone },
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
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const currentCourse = COURSES[activeUserType];
  const allLessons = currentCourse.flatMap(m => m.lessons);
  const progressPercent = allLessons.length > 0 
    ? Math.round((completedLessons.filter(id => allLessons.some(l => l.id === id)).length / allLessons.length) * 100)
    : 0;

  useEffect(() => {
    setActiveUserType(getDefaultUserType(userRole));
    // Reset selected lesson when role changes unless it's an admin browsing
  }, [userRole]);

  const toggleComplete = (lessonId: string) => {
    setCompletedLessons(prev => 
      prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );
  };

  const nextLesson = () => {
    if (!selectedLesson) return;
    const currentIndex = allLessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex < allLessons.length - 1) {
      setSelectedLesson(allLessons[currentIndex + 1]);
    }
  };

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
                  {module.lessons.map((lesson) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                          selectedLesson?.id === lesson.id 
                            ? 'bg-cyan-500/5 border-cyan-500/30' 
                            : 'bg-[#0F1117] border-[#1F232E] hover:border-zinc-700'
                        }`}
                      >
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors relative ${
                          selectedLesson?.id === lesson.id ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'
                        }`}>
                          <lesson.icon className="h-6 w-6" />
                          {isCompleted && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-[#0A0A0F]">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold mb-0.5 ${isCompleted ? 'text-zinc-400' : 'text-white'}`}>
                            {lesson.title}
                            {isCompleted && <span className="ml-2 text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Concluído</span>}
                          </h3>
                          <p className="text-xs text-zinc-500 truncate">{lesson.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-zinc-600 block mb-1 uppercase tracking-wider">{lesson.duration}</span>
                          <div className="flex items-center gap-1 text-cyan-500 text-xs font-semibold">
                            <PlayCircle className="h-3 w-3" />
                            {selectedLesson?.id === lesson.id ? 'Assistindo' : 'Assistir'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
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
                      <button 
                        onClick={() => toggleComplete(selectedLesson.id)}
                        className={`w-full font-bold py-3 rounded-xl transition-all border ${
                          completedLessons.includes(selectedLesson.id)
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-black border-transparent'
                        }`}
                      >
                        {completedLessons.includes(selectedLesson.id) ? 'Aula Concluída' : 'Marcar como Concluído'}
                      </button>
                      
                      {completedLessons.includes(selectedLesson.id) && allLessons.findIndex(l => l.id === selectedLesson.id) < allLessons.length - 1 && (
                        <button 
                          onClick={nextLesson}
                          className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          Próxima Aula
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
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
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Seu Progresso na Trilha</h4>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Total Concluído</span>
                    <span className="text-cyan-500 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-cyan-500 transition-all duration-500" 
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                    <ChevronRight className="h-3 w-3" />
                    {progressPercent === 100 ? 'Parabéns! Você é um HCB Expert!' : 'Continue para ganhar seu selo'}
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
