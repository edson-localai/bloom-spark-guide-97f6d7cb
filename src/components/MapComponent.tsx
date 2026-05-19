const MapComponent = () => {
  const address = "Tv. Primeiro de Maio, 1719 - Centro, Castanhal - PA, 68742-390";
  
  // Use the free public embed which works without API keys and is very reliable for basic location maps
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <div className="w-full h-full relative bg-slate-100 dark:bg-slate-900">
      <iframe
        title="Localização HCB Ar Condicionado Automotivo"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        src={embedUrl}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-2xl grayscale-[0.5] dark:invert-[0.9] dark:hue-rotate-180 opacity-90 hover:opacity-100 transition-opacity duration-500"
      ></iframe>
    </div>
  );
};

export default MapComponent;
