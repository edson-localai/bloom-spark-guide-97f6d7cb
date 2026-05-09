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
  const { roles, user } = useCrmAuth();
  const userRole = roles[0] || 'agent';
  const isAdmin = userRole === 'admin' || user?.email === 'hcbautomotivo@gmail.com';

  const getDefaultUserType = (role: string): UserType => {
    if (role === 'admin') return 'admin';
    if (role === 'supervisor') return 'gerente';
    return 'vendedor';
  };

  const [activeUserType, setActiveUserType] = useState<UserType>(getDefaultUserType(userRole));
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizResults, setQuizResults] = useState<Record<string, { score: number, total: number }>>({});
  const [activeQuiz, setActiveQuiz] = useState<Question[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const currentCourse = COURSES[activeUserType];
  const allLessons = currentCourse.flatMap(m => m.lessons);
  const progressPercent = allLessons.length > 0 
    ? Math.round((completedLessons.filter(id => allLessons.some(l => l.id === id)).length / allLessons.length) * 100)
    : 0;

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('quiz_results')
      .select('lesson_id, score, total_questions')
      .eq('user_id', user.id);
    
    if (data) {
      const results: Record<string, { score: number, total: number }> = {};
      const completed: string[] = [];
      data.forEach(r => {
        results[r.lesson_id] = { score: r.score, total: r.total_questions };
        completed.push(r.lesson_id);
      });
      setQuizResults(results);
      setCompletedLessons(completed);
    }
  }

  useEffect(() => {
    setActiveUserType(getDefaultUserType(userRole));
  }, [userRole]);

  const saveQuizResult = async (lessonId: string, score: number, total: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('quiz_results')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        score,
        total_questions: total
      }, { onConflict: 'user_id,lesson_id' });

    if (error) {
      toast.error('Erro ao salvar resultado do quiz');
    } else {
      setQuizResults(prev => ({ ...prev, [lessonId]: { score, total } }));
      if (!completedLessons.includes(lessonId)) {
        setCompletedLessons(prev => [...prev, lessonId]);
      }
    }
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (!activeQuiz) return;
    
    if (optionIndex === activeQuiz[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }

    if (currentQuestionIndex < activeQuiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowQuizResult(true);
      if (selectedLesson) {
        saveQuizResult(selectedLesson.id, quizScore + (optionIndex === activeQuiz[currentQuestionIndex].correctAnswer ? 1 : 0), activeQuiz.length);
      }
    }
  };

  const startQuiz = () => {
    if (selectedLesson?.quiz) {
      setActiveQuiz(selectedLesson.quiz);
      setCurrentQuestionIndex(0);
      setQuizScore(0);
      setShowQuizResult(false);
    }
  };

  const toggleComplete = (lessonId: string) => {
    if (completedLessons.includes(lessonId)) return;
    setCompletedLessons(prev => [...prev, lessonId]);
    saveQuizResult(lessonId, 1, 1); // For practical/video without quiz
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
                    
                    <div className="space-y-4">
                      {selectedLesson.quiz && !activeQuiz && (
                        <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-widest mb-2">
                            <Trophy className="h-4 w-4" /> Desafio Final
                          </div>
                          <p className="text-xs text-zinc-500 mb-4">Complete o quiz para confirmar seu aprendizado nesta aula.</p>
                          <button 
                            onClick={startQuiz}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded-xl transition-all"
                          >
                            Iniciar Quiz
                          </button>
                        </div>
                      )}

                      {activeQuiz && !showQuizResult && (
                        <div className="p-5 rounded-2xl bg-[#151821] border border-[#1F232E]">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Questão {currentQuestionIndex + 1}/{activeQuiz.length}</span>
                            <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-cyan-500 transition-all" 
                                style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.length) * 100}%` }}
                              />
                            </div>
                          </div>
                          <h4 className="text-white font-bold mb-4">{activeQuiz[currentQuestionIndex].question}</h4>
                          <div className="space-y-2">
                            {activeQuiz[currentQuestionIndex].options.map((option, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleQuizAnswer(idx)}
                                className="w-full p-3 rounded-xl border border-[#1F232E] bg-black/20 text-left text-sm text-zinc-400 hover:border-cyan-500/50 hover:text-white transition-all"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {showQuizResult && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-6 rounded-2xl bg-[#151821] border border-cyan-500/20 text-center"
                        >
                          <Trophy className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                          <h4 className="text-white font-bold text-lg mb-1">Quiz Concluído!</h4>
                          <p className="text-sm text-zinc-400 mb-4">Você acertou {quizScore} de {activeQuiz?.length} questões.</p>
                          <button 
                            onClick={() => setActiveQuiz(null)}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl transition-all"
                          >
                            Fechar
                          </button>
                        </motion.div>
                      )}

                      {!selectedLesson.quiz && (
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
                      )}
                      
                      {completedLessons.includes(selectedLesson.id) && allLessons.findIndex(l => l.id === selectedLesson.id) < allLessons.length - 1 && (
                        <button 
                          onClick={() => { setSelectedLesson(allLessons[allLessons.findIndex(l => l.id === selectedLesson.id) + 1]); setActiveQuiz(null); }}
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
                <div className="space-y-6">
                  <div>
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
                  </div>

                  {Object.keys(quizResults).length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-[#1F232E]">
                      <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Últimos Resultados</h5>
                      {Object.entries(quizResults).slice(-3).map(([id, result]) => {
                        const lesson = allLessons.find(l => l.id === id);
                        if (!lesson) return null;
                        const scorePercent = Math.round((result.score / result.total) * 100);
                        return (
                          <div key={id} className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-zinc-300 truncate font-semibold">{lesson.title}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${scorePercent >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${scorePercent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            <span className={`text-[10px] font-black ${scorePercent >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {result.score}/{result.total}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

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
