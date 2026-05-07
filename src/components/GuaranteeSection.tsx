import { Shield, Award, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const GuaranteeSection = () => {
  const guarantees = [
    {
      icon: Shield,
      iconColor: "text-hcb-blue",
      title: "Até 8 Meses de Garantia",
      text: "Produtos selecionados com garantia de até oito meses. Compre com segurança e tranquilidade.",
      highlight: false
    },
    {
      icon: Award,
      iconColor: "text-hcb-gold",
      title: "Peças Originais Denso",
      text: "Revendedor oficial da Denso — marca líder mundial utilizada em linhas de montagem globais.",
      highlight: true
    },
    {
      icon: CheckCircle,
      iconColor: "text-hcb-blue",
      title: "Produto Verificado",
      text: "Cada peça passa por verificação de qualidade antes de chegar até você ou sua oficina.",
      highlight: false
    }
  ];

  return (
    <section id="garantia" className="bg-hcb-dark border-y border-hcb-border py-24 px-[max(24px,5vw)]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-hcb-blue/10 border border-hcb-blue/30 mb-4">
            <span className="font-['Rajdhani'] text-xs font-semibold tracking-[0.12em] text-hcb-blue-light uppercase">
              Garantia e Qualidade
            </span>
          </div>
          <h2 className="font-['Bebas_Neue'] text-[clamp(40px,5vw,64px)] text-hcb-white leading-tight uppercase">
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
              className={`rounded-[20px] p-10 text-center border transition-all duration-300 ${
                item.highlight 
                  ? 'bg-gradient-to-br from-[#0D1B2A] to-[#111318] border-hcb-gold/30 shadow-[0_0_30px_rgba(200,168,75,0.05)] scale-105 z-10' 
                  : 'bg-hcb-card border-hcb-border'
              }`}
            >
              <div className="flex justify-center mb-6">
                <item.icon className={`w-16 h-16 ${item.iconColor}`} />
              </div>
              <h3 className="font-['Bebas_Neue'] text-[32px] text-hcb-white mb-4 uppercase tracking-wider">
                {item.title}
              </h3>
              <p className="font-['Inter'] text-base text-hcb-gray leading-[1.7]">
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
