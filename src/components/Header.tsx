import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Menu, X } from 'lucide-react';
import hcbLogo from '@/assets/hcb-logo.png';
import Logo from './Logo';
import { SCROLL_OFFSET } from '@/constants/scroll';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    navLinks.forEach(link => {
      const id = link.href.replace('#', '');
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { name: 'Estatísticas', href: '#estatisticas' },
    { name: 'Diferenciais', href: '#diferenciais' },
    { name: 'Produtos', href: '#produtos' },
    { name: 'Segmentos', href: '#segmentos' },
    { name: 'Depoimentos', href: '#depoimentos' },
    { name: 'Contato', href: '#contatosection' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      const offset = SCROLL_OFFSET;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 h-[72px] px-[max(24px,5vw)] flex items-center justify-between border-b ${
        isScrolled 
          ? 'bg-[#0A0A0A]/90 backdrop-blur-[16px] border-[#0066CC]/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
          : 'bg-transparent border-transparent'
      }`}
    >
      {/* Skip to content for accessibility */}
      <a href="#hero" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#0066CC] text-white px-4 py-2 rounded-md z-[60]">
        Pular para o conteúdo
      </a>

      {/* Logo */}
      <a href="/" className="flex items-center group transition-transform duration-300 hover:scale-[1.02]" aria-label="HCB Ar Condicionado - Início">
        <Logo size="lg" />
      </a>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive = activeSection === link.href.replace('#', '');
          return (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className={`px-4 py-2 font-['Rajdhani'] text-[15px] font-semibold transition-all relative group ${
                isActive ? 'text-[#F5F8FF]' : 'text-[#8A9BB5] hover:text-[#F5F8FF]'
              }`}
            >
              <span className="relative z-10">{link.name}</span>
              <span className={`absolute inset-0 bg-[#0066CC]/5 rounded-lg transition-colors ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              <span className={`absolute -bottom-1 left-4 right-4 h-[2px] bg-[#0066CC] transition-transform duration-300 origin-center ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </a>
          );
        })}
      </nav>

      {/* CTA Button */}
      <div className="flex items-center gap-4">
        <a
          href="https://wa.me/5591985161991"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar conosco no WhatsApp"
          className="hidden sm:flex items-center gap-2 px-6 py-[10px] bg-gradient-to-br from-[#0066CC] to-[#0080FF] rounded-full font-['Rajdhani'] text-sm font-bold text-white transition-all duration-300 hover:brightness-115 hover:scale-105 hover:shadow-[0_10px_20px_rgba(0,102,204,0.3)] active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>

        {/* Hamburger */}
        <button 
          className="md:hidden text-[#F5F8FF] p-2 hover:bg-white/5 rounded-full transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center p-8 gap-8"
          >
            {navLinks.map((link, i) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className={`font-['Bebas_Neue'] text-4xl tracking-wider transition-colors ${
                    isActive ? 'text-[#0066CC]' : 'text-[#F5F8FF] hover:text-[#0066CC]'
                  }`}
                >
                  {link.name}
                </motion.a>
              );
            })}
            <motion.a
              href="https://wa.me/5591985161991"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-3 w-full max-w-xs px-5 py-4 bg-gradient-to-br from-[#0066CC] to-[#0080FF] rounded-xl font-['Rajdhani'] text-xl font-bold text-white mt-4 shadow-xl"
            >
              <MessageCircle className="w-6 h-6" />
              WhatsApp
            </motion.a>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-[#8A9BB5] hover:text-[#F5F8FF]"
              aria-label="Fechar menu"
            >
              <X size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
