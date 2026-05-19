import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useCallback, useState, useMemo } from 'react';
import { Skeleton } from './ui/skeleton';
import { useTheme } from 'next-themes';


const center = {
  lat: -1.2931392,
  lng: -47.9302892
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px'
};

const MapComponent = () => {
  const { theme } = useTheme();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY || ""
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const mapStyles = useMemo(() => {
    if (theme === 'dark') {
      return [
        { "elementType": "geometry", "stylers": [{ "color": "#1f2937" }] },
        { "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca3af" }] },
        { "elementType": "labels.text.stroke", "stylers": [{ "color": "#111827" }] },
        { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#4b5563" }] },
        { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#111827" }] },
        { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#374151" }] },
        { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] }
      ];
    }
    return []; // Standard Google Maps styles for light mode
  }, [theme]);


  if (!isLoaded) return <Skeleton className="w-full h-full rounded-2xl bg-slate-200 dark:bg-white/5" />;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={17}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: mapStyles
      }}
    >
      <MarkerF
        position={center}
        title="HCB Ar Condicionado Automotivo"
      />
    </GoogleMap>
  );
};


export default MapComponent;
