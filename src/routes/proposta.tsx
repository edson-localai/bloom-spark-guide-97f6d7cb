import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Rocket, Zap, Crown, Shield, ArrowRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export const Route = createFileRoute("/proposta")({
  component: ProposalPage,
});

function ProposalPage() {
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
      price: "1.200,00",
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
        <section className="py-12 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-[1.02] ${plan.color}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full">
                      Mais Recomendado
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="mb-4">{plan.icon}</div>
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-blue-400 text-sm font-medium">{plan.tagline}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">R$ {plan.price}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{plan.period}</p>
                  </div>

                  <p className="text-gray-300 mb-8 text-sm leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="space-y-4 mb-10 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={`https://wa.me/5591981267484?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20${encodeURIComponent(plan.name)}%20para%20a%20HCB.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      plan.popular 
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20" 
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {plan.buttonText}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Details Section */}
        <section className="py-24 bg-white/5">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que investir agora?</h2>
              <p className="text-gray-400">Entenda as vantagens de cada recurso estratégico.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="text-blue-500 w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold mb-3">Velocidade</h4>
                <p className="text-gray-400 text-sm">Um site rápido não apenas agrada o cliente, mas aumenta sua nota no Google, reduzindo custos com anúncios.</p>
              </div>
              <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Check className="text-blue-500 w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold mb-3">Profissionalismo</h4>
                <p className="text-gray-400 text-sm">Abandone o e-mail amador e as redes sociais como única vitrine. Tenha uma casa digital sólida e confiável.</p>
              </div>
              <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Rocket className="text-blue-500 w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold mb-3">Automação</h4>
                <p className="text-gray-400 text-sm">Não perca vendas por demora no WhatsApp. O CRM e a automação garantem que todo lead seja atendido instantaneamente.</p>
              </div>
              <div className="p-6 bg-black/30 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="text-blue-500 w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold mb-3">Segurança</h4>
                <p className="text-gray-400 text-sm">Hospedagem blindada e certificados de segurança inclusos para garantir que seu site esteja sempre online e seguro.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center">
          <div className="container mx-auto px-6 max-w-2xl">
            <h2 className="text-3xl font-bold mb-6">Pronto para dar o próximo passo?</h2>
            <p className="text-gray-400 mb-10 text-lg">
              Qualquer dúvida que tiver sobre os planos, estou à disposição para conversarmos e ajustarmos os detalhes.
            </p>
            <a 
              href="https://wa.me/5591981267484" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-4 px-10 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl shadow-green-500/20"
            >
              Falar agora pelo WhatsApp
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
