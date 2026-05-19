import { ExternalLink } from 'lucide-react';

const MapComponent = () => {
  // Endereço completo para o Google Maps
  const address = "HCB Ar Condicionado Automotivo - Tv. Primeiro de Maio, 1719 - Centro, Castanhal - PA, 68742-390";
  
  // URL para embed e para rotas
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=17`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

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
      
      {/* Overlay informativo personalizado */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-[#0066CC]/30 shadow-lg hidden sm:block">
        <h4 className="font-['Rajdhani'] font-bold text-slate-900 dark:text-[#F5F8FF] text-sm uppercase">HCB Ar Condicionado</h4>
        <p className="font-['Inter'] text-[10px] text-slate-500 dark:text-[#8A9BB5] mb-2">Peças e Serviços em Castanhal</p>
        <a 
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[10px] font-bold rounded-lg transition-colors uppercase tracking-wider"
        >
          <ExternalLink className="w-3 h-3" />
          Como chegar
        </a>
      </div>

      {/* Botão flutuante para mobile */}
      <div className="absolute bottom-4 right-4 sm:hidden">
        <a 
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white text-xs font-bold rounded-full shadow-xl"
        >
          <ExternalLink className="w-4 h-4" />
          Como chegar
        </a>
      </div>
    </div>
  );
};

export default MapComponent;
