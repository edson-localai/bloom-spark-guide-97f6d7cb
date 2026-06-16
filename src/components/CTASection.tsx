import { motion } from "framer-motion";
import { MessageCircle, Phone, MapPin, Navigation } from "lucide-react";
import MapComponent from "./MapComponent";

const CTASection = () => {
  return (
    <section
      id="contatosection"
      className="relative bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-[#0D1B2A] dark:via-[#0A0A0A] dark:to-[#060D18] py-20 sm:py-32 px-[max(24px,5vw)] text-center overflow-hidden transition-colors duration-500"
    >
      {/* Background decoration elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#0066CC]/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#0066CC]/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-[#0066CC]/15" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-[#0066CC]/10 border border-[#0066CC]/30 mb-6">
            <span className="font-['Rajdhani'] text-xs font-semibold tracking-[0.12em] text-[#0052A3] dark:text-[#60C0FF] uppercase">
              Fale conosco agora
            </span>
          </div>

          <h2 className="font-['Bebas_Neue'] text-[clamp(48px,7vw,96px)] text-slate-900 dark:text-[#F5F8FF] leading-[0.9] uppercase mb-8 tracking-wider">
            Pronto para resolver
            <br />o ar do seu veículo?
          </h2>

          <p className="font-['Inter'] text-lg text-slate-600 dark:text-[#8A9BB5] max-w-2xl mx-auto mb-12">
            Atendemos varejo e oficinas. Localização central em Castanhal com estacionamento. Entre
            em contato e resolva hoje mesmo.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
            <a
              href="https://wa.me/5591985161991"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Iniciar conversa no WhatsApp"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-br from-[#25D366] to-[#128C4E] rounded-full font-['Rajdhani'] text-[16px] font-bold text-white transition-all duration-300 hover:scale-[1.05] hover:brightness-110 hover:shadow-[0_15px_35px_rgba(37,211,102,0.3)] active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              Chamar no WhatsApp
            </a>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=HCB+Ar+Condicionado+Automotivo+-+Tv.+Primeiro+de+Maio,+1719+-+Centro,+Castanhal+-+PA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#0066CC] rounded-full font-['Rajdhani'] text-[16px] font-bold text-white transition-all duration-300 hover:scale-[1.05] hover:brightness-110 hover:shadow-[0_15px_35px_rgba(0,102,204,0.3)] active:scale-95"
            >
              <Navigation className="w-5 h-5" />
              Ver Rotas
            </a>
            <a
              href="tel:5591985161991"
              aria-label="Ligar para HCB Ar Condicionado"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-100 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-full font-['Rajdhani'] text-[16px] font-bold text-slate-900 dark:text-[#F5F8FF] transition-all duration-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-[#0066CC]/50 active:scale-95"
            >
              <Phone className="w-5 h-5 text-[#0066CC]" />
              Ligar Agora
            </a>
          </div>

          {/* Location */}
          <a
            href="https://maps.google.com/?q=-1.2931392,-47.9302892"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-slate-600 dark:text-[#8A9BB5] hover:text-[#0066CC] dark:hover:text-[#60C0FF] transition-colors group"
          >
            <MapPin className="w-5 h-5 text-[#0066CC] group-hover:scale-110 transition-transform" />
            <span className="font-['Rajdhani'] text-base md:text-lg">
              Tv. Primeiro de Maio, 1.719 — Centro, Castanhal - PA, CEP 68742-390
            </span>
          </a>

          {/* Map Integration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-16 w-full h-[350px] md:h-[500px] rounded-2xl md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-white dark:border-white/5 ring-1 ring-slate-200 dark:ring-white/10"
          >
            <MapComponent />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
