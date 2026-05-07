import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Star } from 'lucide-react';
import whyUsBg from '../assets/why-us-bg.jpg';

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
    <section id="diferenciais" className="bg-[#0A0A0A] pt-24 pb-24 px-[max(24px,5vw)] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-[#0066CC]/10 border border-[#0066CC]/30 mb-4">
            <span className="font-['Rajdhani'] text-xs font-semibold tracking-[0.12em] text-[#60C0FF] uppercase">
              Por que escolher a HCB
            </span>
          </div>
          <h2 className="font-['Bebas_Neue'] text-[clamp(40px,5.5vw,72px)] text-[#F5F8FF] leading-tight uppercase mb-4">
            Qualidade que você sente, confiança que fica
          </h2>
          <p className="font-['Inter'] text-lg text-[#8A9BB5] max-w-2xl mx-auto">
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
                className="flex gap-6 py-6 border-b border-[#1E2330] group hover:bg-[#0066CC]/5 transition-all duration-300 px-4 rounded-xl"
              >
                <div className="flex flex-col items-center shrink-0">
                  <span className="font-['Bebas_Neue'] text-[40px] text-[#0066CC]/20 leading-none group-hover:text-[#0066CC]/40 transition-colors">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="w-px h-full bg-gradient-to-b from-[#0066CC]/40 to-transparent mt-2 hidden group-hover:block" />
                </div>
                <div>
                  <h3 className="font-['Rajdhani'] text-[19px] font-bold text-[#F5F8FF] mb-2 uppercase group-hover:text-[#60C0FF] transition-colors tracking-tight">
                    {item.title}
                  </h3>
                  <p className="font-['Inter'] text-[15px] text-[#B8C8DC] leading-relaxed group-hover:text-white transition-colors">
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
            className="lg:sticky lg:top-32 bg-gradient-to-br from-[#111318] to-[#0D1B2A] border border-[#0066CC]/25 rounded-[24px] p-10 lg:p-12 shadow-[0_0_40px_rgba(0,102,204,0.1)] relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute inset-0 z-0 opacity-20">
              <img 
                src={storefrontImg} 
                alt="HCB Storefront" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#111318] via-[#0D1B2A]/80 to-[#0D1B2A]" />
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066CC]/5 rounded-full blur-3xl -mr-10 -mt-10 z-0" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A84B]/10 border border-[#C8A84B]/30 mb-8">
                <Star className="w-3.5 h-3.5 text-[#C8A84B]" fill="currentColor" />
                <span className="font-['Rajdhani'] text-[11px] font-bold tracking-[0.15em] text-[#C8A84B] uppercase">
                  Denso Official Partner
                </span>
              </div>

              <p className="font-['Inter'] text-[20px] font-light text-[#B8C8DC] leading-[1.8] italic mb-10">
                "Revendedores autorizados da Denso, marca japonesa líder mundial em peças para sistemas de ar-condicionado automotivo."
              </p>

              <div className="flex items-center gap-4 mb-10">
                <span className="font-['Bebas_Neue'] text-2xl text-[#F5F8FF]">HCB</span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#0066CC]/40 to-transparent" />
                <span className="font-['Bebas_Neue'] text-2xl text-[#C8A84B]">DENSO</span>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="w-5 h-5 text-[#0066CC] shrink-0 mt-1" />
                  <div>
                    <div className="font-['Rajdhani'] text-[15px] text-[#8A9BB5] uppercase font-bold mb-1">Endereço</div>
                    <div className="font-['Rajdhani'] text-[15px] text-[#B8C8DC]">
                      Tv. Primeiro de Maio, 1.719<br />
                      Centro — Castanhal, PA
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Phone className="w-5 h-5 text-[#0066CC] shrink-0 mt-1" />
                  <div>
                    <div className="font-['Rajdhani'] text-[15px] text-[#8A9BB5] uppercase font-bold mb-1">Telefones</div>
                    <div className="font-['Rajdhani'] text-[15px] text-[#B8C8DC]">
                      (91) 98516-1991<br />
                      (91) 2122-2481
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="w-5 h-5 text-[#0066CC] shrink-0 mt-1" />
                  <div>
                    <div className="font-['Rajdhani'] text-[15px] text-[#8A9BB5] uppercase font-bold mb-1">Horário</div>
                    <div className="font-['Rajdhani'] text-[15px] text-[#B8C8DC]">
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
