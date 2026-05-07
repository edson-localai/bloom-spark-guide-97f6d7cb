import { Settings, Thermometer, Wind, Gauge, Filter, Cable } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  tag: string;
}

const ProductCard = ({ icon: Icon, title, description, tag }: ProductCardProps) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }}
    className="bg-hcb-card border border-hcb-border rounded-[16px] p-8 transition-all duration-300 hover:border-hcb-blue/50 hover:bg-[#1A1F28] hover:shadow-[0_8px_32px_rgba(0,102,204,0.2)] hover:-translate-y-1 group"
  >
    <div className="w-[52px] h-[52px] rounded-[12px] bg-hcb-blue/10 flex items-center justify-center mb-5 group-hover:bg-hcb-blue/20 transition-colors">
      <Icon className="w-6 h-6 text-hcb-blue" />
    </div>
    
    <div className="inline-block px-3 py-1 rounded-full bg-hcb-blue/10 border border-hcb-blue/10 mb-3">
      <span className="font-['Rajdhani'] text-[11px] font-bold tracking-[0.12em] text-hcb-blue uppercase">
        {tag}
      </span>
    </div>
    
    <h3 className="font-['Rajdhani'] text-[22px] font-bold text-hcb-white mb-2 uppercase">
      {title}
    </h3>
    
    <p className="font-['Inter'] text-[15px] font-light text-hcb-gray leading-[1.6]">
      {description}
    </p>
  </motion.div>
);

const ProductsSection = () => {
  const products = [
    {
      icon: Settings,
      title: "Compressores",
      description: "O coração do sistema. Compressores Denso para linha leve e pesada com alta durabilidade.",
      tag: "Linha Leve + Pesada"
    },
    {
      icon: Thermometer,
      title: "Condensadores",
      description: "Dissipação eficiente do calor. Condensadores para todas as aplicações veiculares.",
      tag: "Alta Performance"
    },
    {
      icon: Wind,
      title: "Evaporadores",
      description: "Máxima eficiência de resfriamento. Linha completa para veículos leves e pesados.",
      tag: "Resfriamento"
    },
    {
      icon: Gauge,
      title: "Válvulas de Expansão",
      description: "Controle preciso do fluxo de refrigerante para garantir o melhor desempenho.",
      tag: "Controle Preciso"
    },
    {
      icon: Filter,
      title: "Filtros e Secadores",
      description: "Proteja seu sistema. Filtros e secadores que garantem a pureza do gás refrigerante.",
      tag: "Proteção"
    },
    {
      icon: Cable,
      title: "Mangueiras e Conexões",
      description: "Vedação total. Mangueiras flexíveis e conexões para todos os modelos.",
      tag: "Vedação"
    }
  ];

  return (
    <section id="produtos" className="bg-hcb-black pt-24 pb-24 px-[max(24px,5vw)]">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-hcb-blue/10 border border-hcb-blue/30 mb-4">
          <span className="font-['Rajdhani'] text-xs font-semibold tracking-[0.12em] text-hcb-blue-light uppercase">
            Catálogo
          </span>
        </div>
        <h2 className="font-['Bebas_Neue'] text-[clamp(48px,6vw,80px)] text-hcb-white leading-tight uppercase mb-4">
          Nossas Peças
        </h2>
        <p className="font-['Inter'] text-lg text-hcb-gray max-w-2xl mx-auto">
          Tudo que seu sistema de ar-condicionado precisa, em um só lugar.
        </p>
        <div className="hcb-divider w-[160px] mx-auto mt-8" />
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
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {products.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </motion.div>
    </section>
  );
};

export default ProductsSection;
