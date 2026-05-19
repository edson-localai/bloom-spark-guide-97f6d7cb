import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useCallback, useState } from 'react';
import { Skeleton } from './ui/skeleton';

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
        styles: [
          {
            "elementType": "geometry",
            "stylers": [{ "color": "#212121" }]
          },
          {
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#757575" }]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#212121" }]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{ "color": "#757575" }]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{ "color": "#181818" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#2c2c2c" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#000000" }]
          }
        ]
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
