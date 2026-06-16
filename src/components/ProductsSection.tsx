import { Settings, Thermometer, Wind, Gauge, Filter, Cable } from "lucide-react";
import { motion } from "framer-motion";
import productsBg from "@/assets/products-bg.jpg";

interface ProductCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  tag: string;
}

const ProductCard = ({ icon: Icon, title, description, tag }: ProductCardProps) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, scale: 0.95, y: 20 },
      visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    }}
    className="bg-white/60 dark:bg-[#16191F]/40 backdrop-blur-sm border border-slate-200 dark:border-[#1E2330] rounded-[24px] p-8 transition-all duration-500 hover:border-[#0066CC]/60 hover:bg-white dark:hover:bg-[#1A1F28]/60 hover:shadow-xl dark:hover:shadow-[0_20px_40px_rgba(0,102,204,0.15)] group relative overflow-hidden"
  >
    {/* Background Glow */}
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#0066CC]/10 rounded-full blur-2xl group-hover:bg-[#0066CC]/20 transition-colors duration-500" />

    <div className="relative z-10">
      <div className="w-[56px] h-[56px] rounded-[16px] bg-[#0066CC]/10 flex items-center justify-center mb-6 group-hover:bg-[#0066CC]/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
        <Icon className="w-7 h-7 text-[#0066CC]" />
      </div>

      <div className="inline-block px-3 py-1 rounded-full bg-[#0066CC]/10 border border-[#0066CC]/20 mb-4">
        <span className="font-['Rajdhani'] text-[11px] font-bold tracking-[0.12em] text-[#0052A3] dark:text-[#60C0FF] uppercase">
          {tag}
        </span>
      </div>

      <h3 className="font-['Rajdhani'] text-[24px] font-bold text-slate-900 dark:text-[#F5F8FF] mb-3 uppercase tracking-tight group-hover:text-[#0066CC] dark:group-hover:text-[#60C0FF] transition-colors">
        {title}
      </h3>

      <p className="font-['Inter'] text-[15px] font-light text-slate-700 dark:text-[#B8C8DC] leading-[1.6]">
        {description}
      </p>
    </div>
  </motion.div>
);

const ProductsSection = () => {
  const products = [
    {
      icon: Settings,
      title: "Compressores",
      description:
        "O coração do sistema. Compressores de alta performance para linha leve e pesada com alta durabilidade.",
      tag: "Linha Leve + Pesada",
    },
    {
      icon: Thermometer,
      title: "Condensadores",
      description:
        "Dissipação eficiente do calor. Condensadores para todas as aplicações veiculares.",
      tag: "Alta Performance",
    },
    {
      icon: Wind,
      title: "Evaporadores",
      description:
        "Máxima eficiência de resfriamento. Linha completa para veículos leves e pesados.",
      tag: "Resfriamento",
    },
    {
      icon: Gauge,
      title: "Válvulas de Expansão",
      description: "Controle preciso do fluxo de refrigerante para garantir o melhor desempenho.",
      tag: "Controle Preciso",
    },
    {
      icon: Filter,
      title: "Filtros e Secadores",
      description:
        "Proteja seu sistema. Filtros e secadores que garantem a pureza do gás refrigerante.",
      tag: "Proteção",
    },
    {
      icon: Cable,
      title: "Mangueiras e Conexões",
      description: "Vedação total. Mangueiras flexíveis e conexões para todos os modelos.",
      tag: "Vedação",
    },
  ];

  return (
    <section
      id="produtos"
      className="relative bg-slate-50 dark:bg-[#0A0A0A] py-20 sm:py-32 px-[max(24px,5vw)] overflow-hidden transition-colors duration-500"
    >
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={productsBg}
          alt="Peças de ar condicionado automotivo HCB"
          aria-hidden="true"
          loading="lazy"
          width={1600}
          height={900}
          decoding="async"
          className="absolute top-0 right-0 w-full md:w-2/3 h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/90 to-slate-50/60 dark:from-[#0A0A0A] dark:via-[#0A0A0A]/90 dark:to-[#0A0A0A]/60" />
      </div>

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-[#0066CC]/10 border border-[#0066CC]/30 mb-4">
          <span className="font-['Rajdhani'] text-xs font-semibold tracking-[0.12em] text-[#0052A3] dark:text-[#60C0FF] uppercase">
            Catálogo
          </span>
        </div>
        <h2 className="font-['Bebas_Neue'] text-[clamp(48px,6vw,80px)] text-slate-900 dark:text-[#F5F8FF] leading-tight uppercase mb-4">
          Nossas Peças
        </h2>
        <p className="font-['Inter'] text-lg text-slate-600 dark:text-[#8A9BB5] max-w-2xl mx-auto">
          Tudo que seu sistema de ar-condicionado precisa, em um só lugar.
        </p>
        <div className="hcb-divider w-[160px] mx-auto mt-8" />
      </div>

      {/* Grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
        className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {products.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </motion.div>
    </section>
  );
};

export default ProductsSection;
