export const MAPS_CONFIG = {
  API_KEY:
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY ||
    "",
  TRACKING_ID: import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID || "hcbautomotivo",
  ADDRESS:
    "HCB Ar Condicionado Automotivo - Tv. Primeiro de Maio, 1719 - Centro, Castanhal - PA, 68742-390",
  // Aproximação das coordenadas baseada no endereço
  LOCATION: {
    lat: -1.2946,
    lng: -47.9231,
  },
};
