import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    name: "Jamile Dantas",
    rating: 5,
    text: "Super indico a HCB, atendimento de qualidade, ambiente espetacular, todas as peças originais, preços que cabem no seu bolso. Pode confiar que é a melhor loja de peças de ar condicionado, sem falar no preço.",
    date: "1 mês atrás",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "Robson Alves Dos Santos",
    rating: 5,
    text: "Super recomendo; o atendimento é excepcional, o ambiente é elegante e os funcionários são muito gentis. Me senti muito bem durante essa experiência; comprar nessa empresa é uma experiência única.",
    date: "2 meses atrás",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "Refricar refrigeração",
    rating: 5,
    text: "Bom atendimento, peças de qualidade, preço competitivo e facilidade no pagamento. Quando procuro peças para minha oficina, sempre encontro aqui, por isso recomendo!",
    date: "3 meses atrás",
    image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&q=80&w=150"
  },
  {
    name: "giselle silva",
    rating: 5,
    text: "Preços justos oferecidos ao cliente, atendimento personalizado e rapidez na entrega conforme o combinado.",
    date: "4 meses atrás",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section id="depoimentos" className="py-20 sm:py-32 relative overflow-hidden bg-[#0A0A0A] px-[max(24px,5vw)]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0066CC]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          >
            O que nossos clientes dizem
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Feedback real de quem confia na HCB Ar Condicionado para suas necessidades automotivas.
          </motion.p>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-12">
          <div className="overflow-hidden min-h-[350px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="group p-8 sm:p-12 rounded-[32px] bg-white/5 border border-white/10 hover:border-[#0066CC]/50 transition-all duration-500 relative overflow-hidden backdrop-blur-md w-full"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Quote size={80} className="text-white" />
                </div>
                
                <div className="flex gap-1.5 mb-8">
                  {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                    <Star key={i} size={20} className="fill-[#FFB800] text-[#FFB800]" />
                  ))}
                </div>

                <p className="text-[#F5F8FF] text-xl sm:text-2xl font-light italic leading-relaxed mb-10 relative z-10">
                  "{reviews[currentIndex].text}"
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-4">
                    {reviews[currentIndex].image ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0066CC]/30 group-hover:border-[#0066CC] transition-colors">
                        <img 
                          src={reviews[currentIndex].image} 
                          alt={reviews[currentIndex].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0066CC] to-[#004499] flex items-center justify-center text-white font-bold text-xl border-2 border-transparent">
                        {reviews[currentIndex].name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-['Rajdhani'] text-xl font-bold text-white group-hover:text-[#60C0FF] transition-colors">
                        {reviews[currentIndex].name}
                      </h4>
                      <span className="font-['Inter'] text-sm text-[#8A9BB5] uppercase tracking-wider">{reviews[currentIndex].date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-[-20px] sm:left-[-10px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#16191F]/80 border border-white/10 text-white hover:bg-[#0066CC] hover:scale-110 transition-all z-20 flex items-center justify-center backdrop-blur-sm"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-[-20px] sm:right-[-10px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#16191F]/80 border border-white/10 text-white hover:bg-[#0066CC] hover:scale-110 transition-all z-20 flex items-center justify-center backdrop-blur-sm"
            aria-label="Próximo depoimento"
          >
            <ChevronRight size={24} />
          </button>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-3 mt-12">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setIsAutoPlaying(false);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentIndex ? 'bg-[#0066CC] w-12' : 'bg-white/20 w-4 hover:bg-white/40'
                }`}
                aria-label={`Ir para depoimento ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <a 
            href="https://www.google.com/maps/place/HCB+Ar+Condicionado+Automotivo/@-1.2931392,-47.9302892,17z/data=!4m8!3m7!1s0x92a5afc586b718ad:0x8d3687053f26a8e0!8m2!3d-1.2931392!4d-47.9302892!9m1!1b1!16s%2Fg%2F11x1bpc06r"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#0066CC] hover:text-white transition-colors font-medium"
          >
            Ver todas as avaliações no Google
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
