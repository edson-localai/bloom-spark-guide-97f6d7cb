const MapComponent = () => {
  // Endereço completo para o Google Maps
  const address = "HCB Ar Condicionado Automotivo - Tv. Primeiro de Maio, 1719 - Centro, Castanhal - PA, 68742-390";
  
  // A URL de embed do Google Maps permite passar o nome da empresa e o endereço.
  // Ao incluir o nome da empresa, o Google Maps geralmente exibe o balão informativo (Info Window) 
  // com o nome e a descrição do local que constam no Google Business Profile.
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=17`;

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
      
      {/* Overlay informativo personalizado para reforçar a marca no topo do mapa */}
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-[#0066CC]/30 shadow-lg pointer-events-none hidden sm:block">
        <h4 className="font-['Rajdhani'] font-bold text-slate-900 dark:text-[#F5F8FF] text-sm uppercase">HCB Ar Condicionado</h4>
        <p className="font-['Inter'] text-[10px] text-slate-500 dark:text-[#8A9BB5]">Peças e Serviços em Castanhal</p>
      </div>
    </div>
  );
};

export default MapComponent;
