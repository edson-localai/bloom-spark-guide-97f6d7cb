import { Snowflake, Truck, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const StatsBar = () => {
  const stats = [
    { icon: Snowflake, value: 'Linha Leve', label: 'Completa de Peças' },
    { icon: Truck, value: 'Linha Pesada', label: 'Caminhões & Ônibus' },
    { icon: Shield, value: '8 Meses', label: 'Garantia Máxima' },
    { icon: Zap, value: 'Entrega', label: 'Rápida para Oficinas' },
    { icon: null as any, value: 'HCB', label: 'Ar Condicionado Automotivo', isLogo: true },
  ];

  return (
    <div className="bg-[#111318] border-y border-[#1E2330] py-8 px-[max(24px,5vw)] overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-around items-center gap-6 lg:gap-0">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center px-4 relative flex-1 min-w-[160px]"
          >
            <stat.icon className="w-7 h-7 text-[#0066CC] mb-1" />
            <div className="font-['Bebas_Neue'] text-[28px] text-[#F5F8FF] leading-tight my-1 uppercase">
              {stat.value}
            </div>
            <div className="font-['Rajdhani'] text-[13px] font-medium text-[#8A9BB5] tracking-tight uppercase">
              {stat.label}
            </div>

            {/* Separator - Hidden on last item and on mobile */}
            {index < stats.length - 1 && (
              <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-12 w-[1px] bg-[#1E2330]" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatsBar;
