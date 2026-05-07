import { Snowflake, Truck, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const StatsBar = () => {
  const stats = [
    { icon: Snowflake, value: 'Linha Leve', label: 'Completa de Peças' },
    { icon: Truck, value: 'Linha Pesada', label: 'Caminhões & Ônibus' },
    { icon: Shield, value: '8 Meses', label: 'Garantia Máxima' },
    { icon: Zap, value: 'Entrega', label: 'Rápida para Oficinas' },
  ];

  return (
    <section className="relative z-20 -mt-10 sm:-mt-16 px-[max(24px,5vw)]">
      <div className="max-w-7xl mx-auto bg-[#16191F]/90 backdrop-blur-xl border border-[#0066CC]/20 rounded-2xl sm:rounded-[32px] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 items-center">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              <div className="mb-4 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                {stat.isLogo ? (
                  <Logo size="md" className="drop-shadow-[0_0_15px_rgba(0,102,204,0.3)]" />
                ) : (
                  <stat.icon className="w-8 h-8 text-[#0066CC]" />
                )}
              </div>
              <div className="font-['Bebas_Neue'] text-2xl sm:text-3xl text-[#F5F8FF] leading-none mb-1 tracking-wider group-hover:text-[#60C0FF] transition-colors">
                {stat.value}
              </div>
              <div className="font-['Rajdhani'] text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#8A9BB5] uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
