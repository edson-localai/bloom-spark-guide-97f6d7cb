import { motion } from 'framer-motion';
import { ChevronRight, MessageCircle, Snowflake } from 'lucide-react';

const HeroSection = () => {
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 72;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="relative min-h-screen pt-[72px] bg-hcb-black overflow-hidden flex items-center">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_10%_40%,rgba(0,102,204,0.12)_0%,transparent_60%)]" />
        <div className="absolute top-0 right-0 w-[60%] h-full bg-[radial-gradient(ellipse_at_90%_60%,rgba(0,102,204,0.08)_0%,transparent_50%)]" />
        
        {/* Grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(30,35,48,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(30,35,48,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} 
        />

        {/* Diagonal lines decoration */}
        <svg className="absolute top-0 right-0 w-[300px] h-[300px] opacity-20" viewBox="0 0 300 300">
          <line x1="100" y1="0" x2="300" y2="200" stroke="#0066CC" strokeWidth="1" />
          <line x1="140" y1="0" x2="300" y2="160" stroke="#0066CC" strokeWidth="1" />
          <line x1="60" y1="0" x2="300" y2="240" stroke="#0066CC" strokeWidth="1" />
        </svg>
      </div>

      <div className="container mx-auto px-[max(24px,5vw)] grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center relative z-10 py-20">
        {/* Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-hcb-blue/10 border border-hcb-blue/30 mb-6">
            <Snowflake className="w-[14px] h-[14px] text-hcb-blue" />
            <span className="font-['Rajdhani'] text-xs font-semibold tracking-[0.12em] text-hcb-blue-light uppercase">
              Especialistas em Refrigeração Automotiva
            </span>
          </div>

          {/* H1 */}
          <h1 className="font-['Bebas_Neue'] text-[clamp(60px,9vw,110px)] leading-[0.95] text-hcb-white mb-6 uppercase tracking-wider">
            Frio de <span className="bg-gradient-to-r from-hcb-blue-light via-hcb-blue to-hcb-white bg-clip-text text-transparent">Verdade</span><br />
            Para seu Veículo
          </h1>

          {/* Subtitle */}
          <p className="font-['Inter'] text-lg font-light text-hcb-gray leading-[1.7] max-w-[520px] mb-10">
            Peças de ar-condicionado automotivo linha leve, pesada e fora de estrada. 
            Revendedor oficial Denso. Atendemos varejo e oficinas com agilidade e qualidade.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-14">
            <button 
              onClick={() => handleScrollTo('produtos')}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-hcb-blue to-hcb-blue-mid rounded-[8px] font-['Rajdhani'] text-base font-bold text-white transition-all duration-300 hover:-translate-y-[2px] hover:brightness-115 hover:shadow-[0_0_30px_rgba(0,102,204,0.4)]"
            >
              Ver Peças Disponíveis
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <a 
              href="https://wa.me/5591985161991"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-transparent border border-hcb-blue/40 rounded-[8px] font-['Rajdhani'] text-base font-semibold text-hcb-blue-light transition-all duration-300 hover:bg-hcb-blue/10 hover:border-hcb-blue"
            >
              <MessageCircle className="w-5 h-5" />
              Falar com Especialista
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
            <div className="pr-10 border-r border-hcb-border last:border-0 last:pr-0">
              <div className="font-['Bebas_Neue'] text-[28px] text-hcb-white leading-none mb-1">Linha Leve</div>
              <div className="font-['Rajdhani'] text-xs font-bold tracking-[0.1em] text-hcb-gray uppercase">Passeio & SUVs</div>
            </div>
            <div className="pr-10 border-r border-hcb-border last:border-0 last:pr-0">
              <div className="font-['Bebas_Neue'] text-[28px] text-hcb-white leading-none mb-1">Linha Pesada</div>
              <div className="font-['Rajdhani'] text-xs font-bold tracking-[0.1em] text-hcb-gray uppercase">Caminhões & Ônibus</div>
            </div>
            <div className="">
              <div className="font-['Bebas_Neue'] text-[28px] text-hcb-white leading-none mb-1">Denso®</div>
              <div className="font-['Rajdhani'] text-xs font-bold tracking-[0.1em] text-hcb-gray uppercase">Revendedor Oficial</div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Visual Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative flex justify-center items-center"
        >
          {/* Main Circle */}
          <div 
            className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-[radial-gradient(circle_at_40%_35%,#16191F_0%,#0D1B2A_60%,#0A0A0A_100%)] border border-hcb-blue/20 flex items-center justify-center relative shadow-[0_0_80px_rgba(0,102,204,0.15),inset_0_0_60px_rgba(0,102,204,0.05)] animate-[floatHero_3s_ease-in-out_infinite_alternate]"
          >
             <span className="text-[100px] sm:text-[160px] opacity-[0.15] text-hcb-blue pointer-events-none">❄</span>
          </div>

          {/* Rotating Ring */}
          <div className="absolute w-[350px] h-[350px] sm:w-[460px] sm:h-[460px] border border-dashed border-hcb-blue/20 rounded-full animate-[rotateSlow_20s_linear_infinite]" />

          {/* Floating Cards */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-0 left-[-20px] sm:left-[-40px] bg-hcb-card border border-hcb-blue/20 rounded-[12px] px-5 py-3 flex items-center gap-2 shadow-xl z-20"
          >
            <span className="text-hcb-blue">✓</span>
            <span className="font-['Rajdhani'] text-sm text-hcb-white font-medium">Garantia de até 8 meses</span>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-10 right-[-30px] sm:right-[-50px] bg-hcb-card border border-hcb-blue/20 rounded-[12px] px-5 py-3 flex items-center gap-2 shadow-xl z-20"
          >
            <span className="text-hcb-blue">⚡</span>
            <span className="font-['Rajdhani'] text-sm text-hcb-white font-medium">Entrega Rápida para Oficinas</span>
          </motion.div>

          <motion.div 
            animate={{ x: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-40 left-[-40px] sm:left-[-60px] bg-hcb-card border border-hcb-blue/20 rounded-[12px] px-5 py-3 flex items-center gap-2 shadow-xl z-20"
          >
            <span className="text-hcb-blue">📍</span>
            <span className="font-['Rajdhani'] text-sm text-hcb-white font-medium">Castanhal, Pará — Centro</span>
          </motion.div>

          {/* Particles */}
          {[...Array(8)].map((_, i) => (
            <span 
              key={i}
              className="absolute text-hcb-blue-light/30 animate-[drift_4s_infinite]"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 8 + 10}px`,
                animationDuration: `${Math.random() * 3 + 4}s`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.4
              }}
            >
              ❄
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
