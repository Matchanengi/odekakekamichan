import { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const center = {
  lat: 33.6036,
  lng: 133.6867,
};

export function MapPage() {
  const [markers, setMarkers] = useState<
    { lat: number; lng: number }[]
  >([]);

  return (
    <div className="min-h-screen bg-white p-4">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '500px' }}
          center={center}
          zoom={13}
          options={{
            clickableIcons: false, // ← これ！！
          }}
          onClick={(e) => {
            if (!e.latLng) return;

            setMarkers(prev => [
              ...prev,
              {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              },
            ]);
          }}
        >
          {markers.map((m, index) => (
            <Marker
              key={index}
              position={m}
              onClick={() => {
                setMarkers(prev =>
                  prev.filter((_, i) => i !== index)
                );
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}


