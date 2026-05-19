import { ExternalLink, MapPin } from 'lucide-react';
import storefrontImg from '@/assets/storefront.jpg';
import { MAPS_CONFIG } from '@/constants/maps';

const MapComponent = () => {
  const { API_KEY, ADDRESS } = MAPS_CONFIG;
  
  // URL para embed oficial usando API Key e para rotas
  const embedUrl = API_KEY 
    ? `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(ADDRESS)}`
    : `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed&z=17`;
    
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ADDRESS)}`;


  return (
    <div className="w-full h-full relative bg-slate-100 dark:bg-slate-900 group">
      <iframe
        title="Localização HCB Ar Condicionado Automotivo"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        src={embedUrl}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-2xl grayscale-[0.2] dark:invert-[0.9] dark:hue-rotate-180 opacity-95 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 shadow-inner"
      ></iframe>
      
      {/* Overlay informativo personalizado com imagem da fachada */}
      <div className="absolute top-4 left-4 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md p-0 rounded-2xl border border-slate-200 dark:border-[#0066CC]/30 shadow-2xl hidden sm:block max-w-[200px] overflow-hidden group/overlay">
        <div className="relative h-24 overflow-hidden">
          <img 
            src={storefrontImg} 
            alt="Fachada HCB Ar Condicionado" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover/overlay:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#60C0FF]" />
            <span className="text-[10px] text-white font-bold uppercase tracking-tight">Centro, Castanhal</span>
          </div>
        </div>
        <div className="p-3">
          <h4 className="font-['Rajdhani'] font-bold text-slate-900 dark:text-[#F5F8FF] text-sm uppercase leading-tight mb-1">HCB Ar Condicionado</h4>
          <p className="font-['Inter'] text-[10px] text-slate-500 dark:text-[#8A9BB5] mb-3">Especialistas em Refrigeração Automotiva</p>
          <a 
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[10px] font-bold rounded-xl transition-all uppercase tracking-wider"
          >
            <ExternalLink className="w-3 h-3" />
            Como chegar
          </a>
        </div>
      </div>

      {/* Botão flutuante para mobile com imagem mini */}
      <div className="absolute bottom-4 right-4 sm:hidden flex flex-col items-end gap-2">
        <div className="bg-white dark:bg-[#0A0A0A] p-1 rounded-full border border-[#0066CC]/30 shadow-lg">
          <img src={storefrontImg} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
        </div>
        <a 
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0066CC] text-white text-xs font-bold rounded-full shadow-2xl active:scale-95 transition-transform"
        >
          <ExternalLink className="w-4 h-4" />
          Como chegar
        </a>
      </div>
    </div>
  );
};

export default MapComponent;
