import { Shield, Award, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const GuaranteeSection = () => {
  const guarantees = [
    {
      icon: Shield,
      iconColor: "text-[#0066CC]",
      title: "Até 8 Meses de Garantia",
      text: "Produtos selecionados com garantia de até oito meses. Compre com segurança e tranquilidade.",
      highlight: false
    },
    {
      icon: Award,
      iconColor: "text-[#C8A84B]",
      title: "Peças Originais Denso",
      text: "Revendedor oficial da Denso — marca líder mundial utilizada em linhas de montagem globais.",
      highlight: true
    },
    {
      icon: CheckCircle,
      iconColor: "text-[#0066CC]",
      title: "Produto Verificado",
      text: "Cada peça passa por verificação de qualidade antes de chegar até você ou sua oficina.",
      highlight: false
    }
  ];

  return (
    <section id="garantia" className="bg-[#111318] border-y border-[#1E2330] py-24 px-[max(24px,5vw)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-[#0066CC]/10 border border-[#0066CC]/30 mb-4">
            <span className="font-['Rajdhani'] text-xs font-semibold tracking-[0.12em] text-[#60C0FF] uppercase">
              Garantia e Qualidade
            </span>
          </div>
          <h2 className="font-['Bebas_Neue'] text-[clamp(40px,5vw,64px)] text-[#F5F8FF] leading-tight uppercase">
            Peças com Procedência e Garantia
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guarantees.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-[32px] p-10 text-center border transition-all duration-500 group hover:-translate-y-2 ${
                item.highlight 
                  ? 'bg-gradient-to-br from-[#0D1B2A] to-[#111318] border-[#C8A84B]/40 shadow-[0_20px_40px_rgba(200,168,75,0.1)] scale-105 z-10' 
                  : 'bg-[#16191F]/50 backdrop-blur-sm border-[#1E2330] hover:border-[#0066CC]/30'
              }`}
            >
              <div className="flex justify-center mb-8 transform group-hover:scale-110 transition-transform duration-500">
                <div className={`p-5 rounded-2xl bg-opacity-10 ${item.highlight ? 'bg-[#C8A84B]' : 'bg-[#0066CC]'}`}>
                  <item.icon className={`w-12 h-12 ${item.iconColor}`} />
                </div>
              </div>
              <h3 className="font-['Bebas_Neue'] text-[32px] text-[#F5F8FF] mb-4 uppercase tracking-wider group-hover:text-glow transition-all">
                {item.title}
              </h3>
              <p className="font-['Inter'] text-base text-[#B8C8DC] leading-[1.8]">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;
