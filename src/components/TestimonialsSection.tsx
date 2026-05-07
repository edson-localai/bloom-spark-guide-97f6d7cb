import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    name: "Jamile Dantas",
    rating: 5,
    text: "Super indico a HCB, atendimento de qualidade, ambiente espetacular, todas as peças originais, preços que cabem no seu bolso. Pode confiar que é a melhor loja de peças de ar condicionado, sem falar no preço.",
    date: "1 mês atrás"
  },
  {
    name: "Robson Alves Dos Santos",
    rating: 5,
    text: "Super recomendo; o atendimento é excepcional, o ambiente é elegante e os funcionários são muito gentis. Me senti muito bem durante essa experiência; comprar nessa empresa é uma experiência única.",
    date: "2 meses atrás"
  },
  {
    name: "Refricar refrigeração",
    rating: 5,
    text: "Bom atendimento, peças de qualidade, preço competitivo e facilidade no pagamento. Quando procuro peças para minha oficina, sempre encontro aqui, por isso recomendo!",
    date: "3 meses atrás"
  },
  {
    name: "giselle silva",
    rating: 5,
    text: "Preços justos oferecidos ao cliente, atendimento personalizado e rapidez na entrega conforme o combinado.",
    date: "4 meses atrás"
  }
];

const TestimonialsSection = () => {
  return (
    <section id="depoimentos" className="py-20 sm:py-32 relative overflow-hidden bg-[#0A0A0A] px-[max(24px,5vw)]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0066CC]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#0066CC]/50 transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote size={48} className="text-white" />
              </div>
              
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-[#FFB800] text-[#FFB800]" />
                ))}
              </div>

              <p className="text-gray-300 mb-6 italic leading-relaxed">
                "{review.text}"
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white group-hover:text-[#0066CC] transition-colors">
                    {review.name}
                  </h4>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066CC] to-[#004499] flex items-center justify-center text-white font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
              </div>
            </motion.div>
          ))}
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
