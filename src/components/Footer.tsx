import { MapPin, Phone, Camera } from 'lucide-react';
import hcbLogo from '@/assets/hcb-logo.png';
import Logo from './Logo';
import { SCROLL_OFFSET } from '@/constants/scroll';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <footer className="bg-hcb-black border-t border-hcb-border pt-16 pb-8 px-[max(24px,5vw)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          {/* Column 1 - Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <Logo size="md" />
              <div className="flex flex-col">
                <span className="font-['Bebas_Neue'] text-[26px] leading-none text-hcb-white tracking-wide group-hover:text-hcb-blue transition-colors">HCB</span>
                <span className="font-['Rajdhani'] text-[10px] font-semibold tracking-[0.1em] text-hcb-gray uppercase">
                  Ar Condicionado Automotivo
                </span>
              </div>
            </div>
            <p className="font-['Inter'] text-[15px] text-hcb-gray-light leading-relaxed max-w-sm">
              Especialistas em refrigeração automotiva em Castanhal, Pará. <br className="hidden sm:block" />
              Revendedor oficial Denso e parceiro das melhores oficinas da região.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://instagram.com/hcb.automotivo" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Siga a HCB no Instagram"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-hcb-gray hover:text-white hover:border-hcb-blue hover:bg-hcb-blue/10 hover:scale-110 transition-all duration-300"
              >
                <Camera size={22} />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-6">
            <h3 className="font-['Rajdhani'] text-[13px] font-bold tracking-[0.15em] text-hcb-gray uppercase">
              Navegação
            </h3>
            <ul className="grid grid-cols-1 gap-3">
              {[
                { name: 'Estatísticas', id: 'estatisticas' },
                { name: 'Diferenciais', id: 'diferenciais' },
                { name: 'Produtos', id: 'produtos' },
                { name: 'Segmentos', id: 'segmentos' },
                { name: 'Contato', id: 'contatosection' }
              ].map((link) => (
                <li key={link.id}>
                  <a 
                    href={`#${link.id}`}
                    onClick={(e) => handleScrollTo(e, link.id)}
                    className="font-['Rajdhani'] text-[15px] text-hcb-gray-light hover:text-hcb-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Contact */}
          <div className="space-y-6">
            <h3 className="font-['Rajdhani'] text-[13px] font-bold tracking-[0.15em] text-hcb-gray uppercase">
              Contato
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-hcb-blue shrink-0" />
                <span className="font-['Rajdhani'] text-[15px] text-hcb-gray-light">
                  Tv. Primeiro de Maio, 1.719 — Centro, Castanhal - PA
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-hcb-blue shrink-0" />
                <div className="flex flex-col font-['Rajdhani'] text-[15px] text-hcb-gray-light">
                  <span>(91) 98516-1991</span>
                  <span>(91) 2122-2481</span>
                </div>
              </li>
              <li className="flex gap-3">
                <Camera className="w-5 h-5 text-hcb-blue shrink-0" />
                <span className="font-['Rajdhani'] text-[15px] text-hcb-gray-light">
                  @hcb.automotivo
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-hcb-border text-center">
          <div className="hcb-divider w-full mb-8 opacity-30" />
          <p className="font-['Inter'] text-[13px] text-hcb-gray/60">
            © {currentYear} HCB Ar Condicionado Automotivo. Todos os direitos reservados. <br className="sm:hidden" />
            CNPJ 59.493.129/0001-21
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
