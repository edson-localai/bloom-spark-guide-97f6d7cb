import { Snowflake, Truck, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import techPattern from '../assets/tech-pattern.jpg';

const StatsBar = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating data fetch
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { icon: Snowflake, value: 'Linha Leve', label: 'Completa de Peças' },
    { icon: Truck, value: 'Linha Pesada', label: 'Caminhões & Ônibus' },
    { icon: Shield, value: '8 Meses', label: 'Garantia Máxima' },
    { icon: Zap, value: 'Entrega', label: 'Rápida para Oficinas' },
  ];

  return (
    <section className="relative z-20 -mt-10 sm:-mt-16 px-[max(24px,5vw)]">
      <div className="max-w-7xl mx-auto relative overflow-hidden bg-[#16191F]/90 backdrop-blur-xl border border-[#0066CC]/20 rounded-2xl sm:rounded-[32px] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src={techPattern} 
            alt="Technical pattern" 
            className="w-full h-full object-cover mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#16191F] via-transparent to-[#16191F]" />
        </div>

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 items-center">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-4 animate-pulse">
                <div className="w-10 h-10 bg-white/5 rounded-full" />
                <div className="h-8 w-24 bg-white/5 rounded" />
                <div className="h-3 w-32 bg-white/5 rounded" />
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-4 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-[#0066CC]" />
                </div>
                <div className="font-['Bebas_Neue'] text-2xl sm:text-3xl text-[#F5F8FF] leading-none mb-1 tracking-wider group-hover:text-[#60C0FF] transition-colors">
                  {stat.value}
                </div>
                <div className="font-['Rajdhani'] text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#8A9BB5] uppercase">
                  {stat.label}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
