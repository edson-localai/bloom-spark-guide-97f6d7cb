import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Menu, X } from 'lucide-react';
import hcbLogo from '@/assets/hcb-logo.png';
import Logo from './Logo';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Produtos', href: '#produtos' },
    { name: 'Diferenciais', href: '#diferenciais' },
    { name: 'Segmentos', href: '#segmentos' },
    { name: 'Garantia', href: '#garantia' },
    { name: 'Contato', href: '#contatosection' },
  ];

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      const offset = 72;
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[72px] px-[max(24px,5vw)] flex items-center justify-between border-b ${
        isScrolled 
          ? 'bg-[#0A0A0A]/85 backdrop-blur-[20px] border-[#0066CC]/15 shadow-lg' 
          : 'bg-transparent border-transparent'
      }`}
    >
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 group">
        <Logo size="md" />
        <div className="hidden sm:flex flex-col">
          <span className="font-['Bebas_Neue'] text-[26px] leading-none text-[#F5F8FF] tracking-wide">HCB</span>
          <span className="font-['Rajdhani'] text-[10px] font-semibold tracking-[0.15em] text-[#8A9BB5] uppercase">
            Ar Condicionado
          </span>
        </div>
      </a>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={(e) => handleScrollTo(e, link.href)}
            className="font-['Rajdhani'] text-[15px] font-semibold text-[#8A9BB5] hover:text-[#F5F8FF] transition-colors relative group"
          >
            {link.name}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#0066CC] transition-all duration-200 group-hover:w-full" />
          </a>
        ))}
      </nav>

      {/* CTA Button */}
      <div className="flex items-center gap-4">
        <a
          href="https://wa.me/5591985161991"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-5 py-[10px] bg-gradient-to-br from-[#0066CC] to-[#0080FF] rounded-[6px] font-['Rajdhani'] text-sm font-bold text-white transition-all duration-200 hover:brightness-115 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,102,204,0.4)]"
        >
          <MessageCircle className="w-4 h-4" />
          Falar no WhatsApp
        </a>

        {/* Hamburger */}
        <button 
          className="md:hidden text-[#F5F8FF] p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-[#111318] border-l-2 border-[#0066CC] md:hidden flex flex-col pt-24 px-8 gap-6"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="font-['Rajdhani'] text-2xl font-bold text-[#8A9BB5] hover:text-[#F5F8FF]"
              >
                {link.name}
              </a>
            ))}
            <a
              href="https://wa.me/5591985161991"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-br from-[#0066CC] to-[#0080FF] rounded-[6px] font-['Rajdhani'] text-lg font-bold text-white mt-4"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
