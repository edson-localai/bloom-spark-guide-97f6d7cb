import { Car, Truck, Tractor, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SegmentCard = ({ 
  icon: Icon, 
  title, 
  items, 
  highlight = false 
}: { 
  icon: any, 
  title: string, 
  items: string[], 
  highlight?: boolean 
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }}
    className={`bg-[#16191F] rounded-[20px] p-10 border ${
      highlight 
        ? 'border-[#0066CC]/35 shadow-[0_0_40px_rgba(0,102,204,0.15)] relative' 
        : 'border-[#1E2330]'
    }`}
  >
    <Icon className="w-10 h-10 text-[#0066CC] mb-5" />
    <h3 className="font-['Bebas_Neue'] text-[32px] text-[#F5F8FF] mb-6 uppercase tracking-wider">
      {title}
    </h3>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li 
          key={idx} 
          className={`flex items-center gap-3 py-2 ${idx < items.length - 1 ? 'border-b border-[#1E2330]' : ''}`}
        >
          <ChevronRight className="w-3.5 h-3.5 text-[#0066CC]" />
          <span className="font-['Rajdhani'] text-base text-[#B8C8DC] font-medium">
            {item}
          </span>
        </li>
      ))}
    </ul>
  </motion.div>
);

const SegmentsSection = () => {
  return (
    <section id="segmentos" className="relative bg-gradient-to-b from-[#0A0A0A] via-[#0D1520] to-[#0A0A0A] pt-24 pb-24 px-[max(24px,5vw)] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 frost-overlay opacity-30 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-[#0066CC]/10 border border-[#0066CC]/30 mb-4">
            <span className="font-['Rajdhani'] text-xs font-semibold tracking-[0.12em] text-[#60C0FF] uppercase">
              Segmentos
            </span>
          </div>
          <h2 className="font-['Bebas_Neue'] text-[clamp(40px,5.5vw,72px)] text-[#F5F8FF] leading-tight uppercase mb-4">
            Atendemos todos os Segmentos
          </h2>
          <p className="font-['Inter'] text-lg text-[#8A9BB5] max-w-2xl mx-auto">
            Da picape ao caminhão fora de estrada. Se tem ar-condicionado, temos a peça.
          </p>
        </div>

        {/* Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <SegmentCard 
            icon={Car}
            title="Linha Leve"
            items={[
              "Automóveis de passeio",
              "SUVs e crossovers",
              "Pickups e utilitários",
              "Vans e minivans"
            ]}
          />
          <SegmentCard 
            icon={Truck}
            title="Linha Pesada"
            highlight={true}
            items={[
              "Caminhões e carretas",
              "Ônibus urbanos e rodoviários",
              "Micro-ônibus",
              "Tratores agrícolas"
            ]}
          />
          <SegmentCard 
            icon={Tractor}
            title="Fora de Estrada"
            items={[
              "Máquinas de construção",
              "Escavadeiras e guindastes",
              "Retroescavadeiras",
              "Veículos de mineração"
            ]}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default SegmentsSection;
