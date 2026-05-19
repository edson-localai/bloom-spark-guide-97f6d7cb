import { Car, Truck, Tractor, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import segLight from '@/assets/segment-light.jpg';
import segHeavy from '@/assets/segment-heavy.jpg';
import segOffroad from '@/assets/segment-offroad.jpg';
import segmentsBg from '@/assets/segments-bg.jpg';

const SegmentCard = ({ 
  icon: Icon, 
  title, 
  items, 
  image,
  imageAlt,
  highlight = false 
}: { 
  icon: any, 
  title: string, 
  items: string[], 
  image: string,
  imageAlt: string,
  highlight?: boolean 
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }}
    className={`bg-[#16191F]/60 backdrop-blur-md rounded-[32px] border transition-all duration-500 group hover:shadow-2xl overflow-hidden ${
      highlight 
        ? 'border-[#0066CC]/40 shadow-[0_0_50px_rgba(0,102,204,0.2)] relative lg:scale-105 z-10' 
        : 'border-[#1E2330] hover:border-[#0066CC]/20'
    }`}
  >
    {/* Image */}
    <div className="relative h-48 overflow-hidden">
      <img 
        src={image} 
        alt={imageAlt}
        loading="lazy"
        width={1024}
        height={1024}
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#16191F] via-[#16191F]/40 to-transparent" />
      <div className="absolute bottom-4 left-4 w-14 h-14 rounded-2xl bg-[#0066CC]/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>

    <div className="p-10 pt-6">
      <h3 className="font-['Bebas_Neue'] text-[36px] text-[#F5F8FF] mb-6 uppercase tracking-wider group-hover:text-[#60C0FF] transition-colors">
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li 
            key={idx} 
            className={`flex items-center gap-3 py-2 ${idx < items.length - 1 ? 'border-b border-[#1E2330]/50' : ''}`}
          >
            <ChevronRight className="w-4 h-4 text-[#0066CC] group-hover:translate-x-1 transition-transform" />
            <span className="font-['Rajdhani'] text-lg text-[#B8C8DC] font-medium group-hover:text-white transition-colors">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

const SegmentsSection = () => {
  return (
    <section id="segmentos" className="relative bg-[#0A0A0A] py-20 sm:py-32 px-[max(24px,5vw)] overflow-hidden">
      {/* Background with Industrial Motion Lighting */}
      <div className="absolute inset-0 z-0 opacity-10">
        <img 
          src={segmentsBg} 
          alt="Peças para ar condicionado de linha pesada e leve" 
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0D1520]/80 to-[#0A0A0A]" />
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 frost-overlay opacity-30 pointer-events-none z-0" />
      
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
            image={segLight}
            imageAlt="Carro SUV moderno representando linha leve"
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
            image={segHeavy}
            imageAlt="Caminhão pesado representando linha pesada"
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
            image={segOffroad}
            imageAlt="Escavadeira em obra representando linha fora de estrada"
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
