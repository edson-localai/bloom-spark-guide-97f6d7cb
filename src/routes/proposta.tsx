import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, Rocket, Zap, Crown, Shield, ArrowRight, MessageCircle, X, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export const Route = createFileRoute("/proposta")({
  component: ProposalPage,
});

function ProposalPage() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [showPopupError, setShowPopupError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setCustomMessage(`Olá! Confirmo meu interesse no ${plan.name} para a HCB Ar Condicionado. Como podemos prosseguir?`);
    setShowConfirmation(true);
    setShowPopupError(false);
  };

  const confirmSelection = () => {
    const message = encodeURIComponent(customMessage);
    const url = `https://wa.me/5591981267484?text=${message}`;
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      setShowPopupError(true);
    } else {
      setShowConfirmation(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const plans = [
    {
      id: "essencial",
      name: "Plano Essencial",
      tagline: "Presença Digital Garantida",
      price: "400,00",
      period: "Anual",
      description: "Ideal para manter sua identidade online ativa e profissional.",
      features: [
        "Registro de Domínio (.com.br)",
        "Hospedagem de Alta Performance",
        "E-mails Profissionais",
        "Suporte Técnico Especializado",
        "Certificado SSL incluso"
      ],
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      color: "border-blue-500/20 bg-blue-500/5",
      buttonText: "Quero Manter Este",
      popular: false
    },
    {
      id: "pro",
      name: "Plano Profissional",
      tagline: "Sua Empresa em Outro Nível",
      price: "1.000,00",
      period: "Pagamento Único + 400,00 Anual",
      description: "O site que sua empresa merece, focado em conversão e autoridade.",
      features: [
        "Tudo do Plano Essencial",
        "Landing Page de Alta Performance",
        "Design Premium & Exclusivo",
        "Otimização para Google (SEO)",
        "Site Rápido e Responsivo",
        "Integração com WhatsApp"
      ],
      icon: <Rocket className="w-8 h-8 text-blue-500" />,
      color: "border-blue-500 bg-blue-500/10",
      buttonText: "Quero Este Plano",
      popular: true
    },
    {
      id: "elite",
      name: "Plano Elite Digital",
      tagline: "Máxima Conversão & Gestão",
      price: "1.500,00",
      period: "Pagamento Único + 200,00 Mensal",
      description: "Transforme seu atendimento em uma máquina de vendas automática.",
      features: [
        "Tudo do Plano Profissional",
        "Automação de Atendimento WhatsApp",
        "CRM Integrado (Gestão de Leads)",
        "Relatórios de Performance",
        "Suporte Prioritário VIP",
        "Manutenção Mensal Inclusa"
      ],
      icon: <Crown className="w-8 h-8 text-amber-400" />,
      color: "border-amber-500/50 bg-amber-500/5",
      buttonText: "Quero Escalar meu Negócio",
      popular: false
    }
  ];


  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-blue-500/30">
      <header className="py-6 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group transition-transform duration-300 hover:scale-[1.02]">
            <Logo size="md" />
            <div className="hidden sm:flex flex-col">
              <span className="font-['Bebas_Neue'] text-[26px] leading-none text-[#F5F8FF] tracking-wide group-hover:text-[#60C0FF] transition-colors uppercase">HCB</span>
              <span className="font-['Rajdhani'] text-[10px] font-semibold tracking-[0.15em] text-[#8A9BB5] uppercase">
                Ar Condicionado
              </span>
            </div>
          </Link>
          <div className="hidden md:block">
            <span className="text-blue-400 font-['Rajdhani'] font-bold uppercase tracking-wider text-sm border border-blue-500/30 px-4 py-2 rounded-full bg-blue-500/5">
              Proposta Comercial Exclusiva
            </span>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-blue-900/10 to-transparent">
          <div className="container mx-auto px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Evolua a Presença Digital da <span className="text-blue-500">HCB</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                Preparamos 3 caminhos estratégicos para o seu negócio. Escolha o plano que melhor se adapta ao momento da sua empresa e vamos acelerar juntos.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 relative">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative flex flex-col p-8 rounded-[2.5rem] border-2 transition-all duration-500 hover:translate-y-[-10px] group ${plan.color}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 px-6 rounded-full shadow-lg shadow-blue-500/20 z-10">
                      Escolha Estratégica
                    </div>
                  )}


                  <div className="mb-8">
                    <div className="mb-6 flex items-center justify-between">
                      <div className={`p-4 rounded-2xl ${plan.popular ? 'bg-blue-500 text-white' : 'bg-white/5 text-blue-400'}`}>
                        {plan.icon}
                      </div>
                      {plan.popular && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl font-bold mb-2 font-['Bebas_Neue'] tracking-wide group-hover:text-blue-400 transition-colors">{plan.name}</h3>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">{plan.tagline}</p>
                  </div>

                  <div className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-colors">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-tighter">R$</span>
                      <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                    </div>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{plan.period}</p>
                  </div>

                  <p className="text-gray-400 mb-10 text-sm leading-relaxed font-medium">
                    {plan.description}
                  </p>

                  <div className="space-y-5 mb-12 flex-grow">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">O que está incluso:</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-4 group/feature">
                        <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover/feature:bg-blue-500 group-hover/feature:border-blue-500 transition-all duration-300">
                          <Check className="w-3.5 h-3.5 text-blue-500 group-hover/feature:text-white transition-colors" />
                        </div>
                        <span className="text-gray-300 text-sm font-medium tracking-tight group-hover/feature:text-white transition-colors">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      plan.popular 
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20" 
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Features Section */}
        <section className="py-24 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 font-['Bebas_Neue'] tracking-wider">Detalhamento dos Planos</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Compare o que cada investimento entrega e como ele impacta o crescimento da HCB.</p>
            </div>

            <div className="space-y-12">
              {/* Essencial */}
              <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-[2.5rem] p-8 md:p-12 hover:border-blue-500/30 transition-colors group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-8 h-8 text-blue-400" />
                      <h3 className="text-2xl font-bold font-['Bebas_Neue'] tracking-wide">Plano Essencial</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">Manutenção da base tecnológica para sua operação continuar rodando sem interrupções.</p>
                    <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                      <p className="text-xs text-blue-300 font-bold uppercase mb-2">Benefício Principal:</p>
                      <p className="text-sm text-gray-300 italic">"Sua empresa sempre encontrada, com e-mails que passam confiança e domínio garantido."</p>
                    </div>
                  </div>
                  <div className="md:w-2/3 grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-blue-500 pl-3">O que inclui:</h4>
                      <ul className="space-y-3">
                        <li className="flex gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-blue-500 shrink-0" />
                          <span><strong>Domínio .com.br:</strong> Sua marca protegida na internet (ex: hcb-ar.com.br).</span>
                        </li>
                        <li className="flex gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-blue-500 shrink-0" />
                          <span><strong>Hospedagem Premium:</strong> Servidores rápidos que garantem que seu site não caia.</span>
                        </li>
                        <li className="flex gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-blue-500 shrink-0" />
                          <span><strong>E-mails @hcb:</strong> Chega de usar Gmail para fechar negócios de alto valor.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-blue-500 pl-3">Exemplo Prático:</h4>
                      <div className="bg-white/5 p-4 rounded-xl text-xs text-gray-400 leading-relaxed">
                        Imagine um cliente procurando por "ar condicionado automotivo" e encontrando sua marca com um e-mail <strong>contato@hcb-ar.com.br</strong>. A percepção de tamanho e seriedade da sua empresa muda instantaneamente.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profissional */}
              <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Rocket className="w-32 h-32 text-blue-500" />
                </div>
                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="md:w-1/3">
                    <div className="flex items-center gap-3 mb-4">
                      <Rocket className="w-8 h-8 text-blue-500" />
                      <h3 className="text-2xl font-bold font-['Bebas_Neue'] tracking-wide">Plano Profissional</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">Uma máquina de vendas 24h por dia. Seu site focado em converter visitantes em orçamentos.</p>
                    <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <p className="text-xs text-blue-400 font-bold uppercase mb-2">Benefício Principal:</p>
                      <p className="text-sm text-gray-300 italic">"Converta curiosos em clientes reais através de um site rápido, bonito e persuasivo."</p>
                    </div>
                  </div>
                  <div className="md:w-2/3 grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-blue-500 pl-3">O que inclui:</h4>
                      <ul className="space-y-3">
                        <li className="flex gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-blue-500 shrink-0" />
                          <span><strong>Landing Page Premium:</strong> Design moderno que destaca seus diferenciais (Off-road, Agrícola, etc).</span>
                        </li>
                        <li className="flex gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-blue-500 shrink-0" />
                          <span><strong>SEO Local:</strong> Configuração para aparecer no topo das buscas em sua região.</span>
                        </li>
                        <li className="flex gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-blue-500 shrink-0" />
                          <span><strong>Botão flutuante WhatsApp:</strong> Facilita o contato imediato do cliente.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-blue-500 pl-3">Exemplo Prático:</h4>
                      <div className="bg-blue-500/10 p-4 rounded-xl text-xs text-gray-300 leading-relaxed border border-blue-500/10">
                        Um dono de caminhonete vê seu anúncio, entra num site que carrega em menos de 2 segundos, vê fotos reais do seu trabalho e clica no botão do WhatsApp. Você recebe um lead já "quente".
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elite */}
              <div className="bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-[2.5rem] p-8 md:p-12 hover:border-amber-500/40 transition-colors group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3">
                    <div className="flex items-center gap-3 mb-4">
                      <Crown className="w-8 h-8 text-amber-400" />
                      <h3 className="text-2xl font-bold font-['Bebas_Neue'] tracking-wide text-amber-400">Plano Elite Digital</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">Gestão inteligente e atendimento automático. Escalabilidade total para sua oficina.</p>
                    <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                      <p className="text-xs text-amber-400 font-bold uppercase mb-2">Benefício Principal:</p>
                      <p className="text-sm text-gray-300 italic">"Nunca mais perca um cliente por demora no atendimento. Gestão profissional de leads."</p>
                    </div>
                  </div>
                  <div className="md:w-2/3 grid sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-amber-500 pl-3">O que inclui:</h4>
                      <ul className="space-y-3">
                        <li className="flex gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-amber-500 shrink-0" />
                          <span><strong>Bot de Atendimento:</strong> Qualifica o cliente (marca, modelo, defeito) antes de você falar com ele.</span>
                        </li>
                        <li className="flex gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-amber-500 shrink-0" />
                          <span><strong>CRM Básico:</strong> Painel para ver quem entrou em contato, quem fechou e quem precisa de retorno.</span>
                        </li>
                        <li className="flex gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-amber-500 shrink-0" />
                          <span><strong>Relatório Mensal:</strong> Quantas pessoas visitaram e quantos orçamentos foram gerados.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-white font-bold text-sm uppercase tracking-widest border-l-2 border-amber-500 pl-3">Exemplo Prático:</h4>
                      <div className="bg-amber-500/5 p-4 rounded-xl text-xs text-gray-400 leading-relaxed border border-amber-500/5">
                        Um cliente manda mensagem às 22h. O Bot responde: "Olá! Qual o modelo do seu carro?". Ele responde "Hilux 2022". O Bot já deixa o lead pronto no seu CRM para você fechar o agendamento no dia seguinte cedo.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Invest Now - Original Section but slightly adjusted */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Bebas_Neue'] tracking-wider">Por que investir agora?</h2>
              <p className="text-gray-400">Entenda as vantagens de cada recurso estratégico.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="text-blue-500 w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold mb-3 font-['Bebas_Neue'] tracking-wide">Velocidade</h4>
                <p className="text-gray-400 text-sm">Um site rápido não apenas agrada o cliente, mas aumenta sua nota no Google, reduzindo custos com anúncios.</p>
              </div>
              <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Check className="text-blue-500 w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold mb-3 font-['Bebas_Neue'] tracking-wide">Profissionalismo</h4>
                <p className="text-gray-400 text-sm">Abandone o e-mail amador e as redes sociais como única vitrine. Tenha uma casa digital sólida e confiável.</p>
              </div>
              <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Rocket className="text-blue-500 w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold mb-3 font-['Bebas_Neue'] tracking-wide">Automação</h4>
                <p className="text-gray-400 text-sm">Não perca vendas por demora no WhatsApp. O CRM e a automação garantem que todo lead seja atendido instantaneamente.</p>
              </div>
              <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="text-blue-500 w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold mb-3 font-['Bebas_Neue'] tracking-wide">Segurança</h4>
                <p className="text-gray-400 text-sm">Hospedagem blindada e certificados de segurança inclusos para garantir que seu site esteja sempre online e seguro.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-3xl font-bold mb-6 font-['Bebas_Neue'] tracking-wider">Pronto para dar o próximo passo?</h2>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed">
              Qualquer dúvida que tiver sobre os planos, estou à disposição para conversarmos e ajustarmos os detalhes.
            </p>
            <a 
              href="https://wa.me/5591981267484" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-4 px-10 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-green-500/20"
            >
              <MessageCircle className="w-6 h-6" />
              Falar agora pelo WhatsApp
            </a>
          </div>
        </section>
      </main>

      <Footer />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmation(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0F172A] border border-blue-500/30 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full" />
              
              <button 
                onClick={() => setShowConfirmation(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-4">
                  {selectedPlan.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">Ótima escolha!</h3>
                <p className="text-gray-400">Você selecionou o <span className="text-blue-400 font-bold">{selectedPlan.name}</span>.</p>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-4">Resumo do Plano:</h4>
                <ul className="space-y-3">
                  {selectedPlan.features.slice(0, 3).map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-blue-500" />
                      {feature}
                    </li>
                  ))}
                  <li className="text-xs text-gray-500 italic mt-2">+ todos os outros benefícios detalhados.</li>
                </ul>
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-gray-400 text-sm font-medium">Investimento:</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white">R$ {selectedPlan.price}</span>
                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{selectedPlan.period}</p>
                  </div>
                </div>
              </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Mensagem para o WhatsApp:</label>
                    <textarea 
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 min-h-[100px] resize-none"
                      placeholder="Escreva sua mensagem personalizada..."
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 text-[10px] text-gray-500 hover:text-blue-400 transition-colors uppercase tracking-widest font-bold mt-1"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar mensagem
                        </>
                      )}
                    </button>
                  </div>

                  {showPopupError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-amber-200 font-bold mb-1">O WhatsApp não abriu?</p>
                        <p className="text-[10px] text-amber-200/60 leading-tight">
                          Parece que seu navegador bloqueou a janela. Tente clicar no botão abaixo novamente ou copie a mensagem acima.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={confirmSelection}
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 group"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Confirmar e chamar no WhatsApp
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                <p className="text-center text-xs text-gray-500">
                  Ao clicar, você será direcionado para o atendimento humano para os próximos passos.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

