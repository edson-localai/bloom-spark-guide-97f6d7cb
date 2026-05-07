import { motion } from 'framer-motion';
import { MessageCircle, Phone, MapPin } from 'lucide-react';

const CTASection = () => {
  return (
    <section id="contatosection" className="relative bg-gradient-to-br from-[#0D1B2A] via-[#0A0A0A] to-[#060D18] py-32 px-[max(24px,5vw)] text-center overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-hcb-blue/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-hcb-blue/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-hcb-blue/15" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-hcb-blue/10 border border-hcb-blue/30 mb-6">
            <span className="font-['Rajdhani'] text-xs font-semibold tracking-[0.12em] text-hcb-blue-light uppercase">
              Fale conosco agora
            </span>
          </div>

          <h2 className="font-['Bebas_Neue'] text-[clamp(48px,7vw,96px)] text-hcb-white leading-[0.9] uppercase mb-8 tracking-wider">
            Pronto para resolver<br />
            o ar do seu veículo?
          </h2>

          <p className="font-['Inter'] text-lg text-hcb-gray max-w-2xl mx-auto mb-12">
            Atendemos varejo e oficinas. Localização central em Castanhal com estacionamento. 
            Entre em contato e resolva hoje mesmo.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <a 
              href="https://wa.me/5591985161991"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-br from-[#25D366] to-[#128C4E] rounded-[12px] font-['Rajdhani'] text-[18px] font-bold text-white transition-all duration-300 hover:scale-105 hover:brightness-110 hover:shadow-[0_8px_32px_rgba(37,211,102,0.35)]"
            >
              <MessageCircle className="w-6 h-6" />
              Chamar no WhatsApp
            </a>
            <a 
              href="tel:5591985161991"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-transparent border border-hcb-blue/40 rounded-[12px] font-['Rajdhani'] text-[18px] font-bold text-hcb-blue-light transition-all duration-300 hover:bg-hcb-blue/10"
            >
              <Phone className="w-6 h-6" />
              (91) 98516-1991
            </a>
          </div>

          {/* Location */}
          <a 
            href="https://maps.google.com/?q=-1.2931392,-47.9302892"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-hcb-gray hover:text-hcb-blue-light transition-colors group"
          >
            <MapPin className="w-5 h-5 text-hcb-blue group-hover:scale-110 transition-transform" />
            <span className="font-['Rajdhani'] text-base md:text-lg">
              Tv. Primeiro de Maio, 1.719 — Centro, Castanhal - PA, CEP 68742-390
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
