import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Star } from 'lucide-react';

const WhyUsSection = () => {
  const differentials = [
    {
      title: "Revendedor Oficial Denso",
      description: "Marca referência mundial utilizada em linhas de montagem. Qualidade garantida de fábrica em cada componente."
    },
    {
      title: "Garantia de até 8 meses",
      description: "Alguns produtos com garantia de até oito meses. Trabalhe com tranquilidade sabendo que está protegido."
    },
    {
      title: "Entrega Rápida para Oficinas",
      description: "Sabemos que oficina parada é prejuízo. Entregamos com agilidade para você não perder tempo."
    },
    {
      title: "Estacionamento Gratuito",
      description: "Localizado no centro de Castanhal com estacionamento próprio. Acesso fácil para você e sua equipe."
    },
    {
      title: "Múltiplas Formas de Pagamento",
      description: "Cartão de crédito, débito e boleto. Condições especiais para oficinas parceiras."
    },
    {
      title: "Atendimento Varejo e Atacado",
      description: "Seja você consumidor final ou dono de oficina, temos o atendimento certo para sua necessidade."
    }
  ];

  return (
    <section id="diferenciais" className="bg-hcb-black pt-24 pb-24 px-[max(24px,5vw)] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-hcb-blue/10 border border-hcb-blue/30 mb-4">
            <span className="font-['Rajdhani'] text-xs font-semibold tracking-[0.12em] text-hcb-blue-light uppercase">
              Por que escolher a HCB
            </span>
          </div>
          <h2 className="font-['Bebas_Neue'] text-[clamp(40px,5.5vw,72px)] text-hcb-white leading-tight uppercase mb-4">
            Qualidade que você sente, confiança que fica
          </h2>
          <p className="font-['Inter'] text-lg text-hcb-gray max-w-2xl mx-auto">
            Em Castanhal e região, somos a referência em refrigeração automotiva.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Column Left - List */}
          <div className="space-y-0">
            {differentials.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6 py-6 border-b border-hcb-border group hover:bg-hcb-blue/5 transition-colors px-4 rounded-lg"
              >
                <span className="font-['Bebas_Neue'] text-[48px] text-hcb-blue/15 leading-none shrink-0">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-['Rajdhani'] text-[18px] font-bold text-hcb-white mb-2 uppercase group-hover:text-hcb-blue-light transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-['Inter'] text-[15px] text-hcb-gray leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Column Right - Feature Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:sticky lg:top-32 bg-gradient-to-br from-[#111318] to-[#0D1B2A] border border-hcb-blue/25 rounded-[24px] p-10 lg:p-12 shadow-[0_0_40px_rgba(0,102,204,0.1)] relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-hcb-blue/5 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hcb-gold/10 border border-hcb-gold/30 mb-8">
                <Star className="w-3.5 h-3.5 text-hcb-gold" fill="currentColor" />
                <span className="font-['Rajdhani'] text-[11px] font-bold tracking-[0.15em] text-hcb-gold uppercase">
                  Denso Official Partner
                </span>
              </div>

              <p className="font-['Inter'] text-[20px] font-light text-hcb-gray-light leading-[1.8] italic mb-10">
                "Revendedores autorizados da Denso, marca japonesa líder mundial em peças para sistemas de ar-condicionado automotivo."
              </p>

              <div className="flex items-center gap-4 mb-10">
                <span className="font-['Bebas_Neue'] text-2xl text-hcb-white">HCB</span>
                <div className="h-px flex-1 bg-gradient-to-r from-hcb-blue/40 to-transparent" />
                <span className="font-['Bebas_Neue'] text-2xl text-hcb-gold">DENSO</span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="w-5 h-5 text-hcb-blue shrink-0 mt-1" />
                  <div>
                    <div className="font-['Rajdhani'] text-[15px] text-hcb-gray uppercase font-bold mb-1">Endereço</div>
                    <div className="font-['Rajdhani'] text-[15px] text-hcb-gray-light">
                      Tv. Primeiro de Maio, 1.719<br />
                      Centro — Castanhal, PA
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone className="w-5 h-5 text-hcb-blue shrink-0 mt-1" />
                  <div>
                    <div className="font-['Rajdhani'] text-[15px] text-hcb-gray uppercase font-bold mb-1">Telefones</div>
                    <div className="font-['Rajdhani'] text-[15px] text-hcb-gray-light">
                      (91) 98516-1991<br />
                      (91) 2122-2481
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="w-5 h-5 text-hcb-blue shrink-0 mt-1" />
                  <div>
                    <div className="font-['Rajdhani'] text-[15px] text-hcb-gray uppercase font-bold mb-1">Horário</div>
                    <div className="font-['Rajdhani'] text-[15px] text-hcb-gray-light">
                      Seg a Sex: 8h às 18h<br />
                      Sábado: 8h às 13h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
