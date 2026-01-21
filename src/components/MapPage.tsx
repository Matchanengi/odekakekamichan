import { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { supabase } from './supabaseClient';

type Spot = {
  spot_id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type MapPageProps = {
  spots: Spot[];
};

const center = {
  lat: 33.6036,
  lng: 133.6867,
};

export function MapPage({ spots }: MapPageProps) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // 自作ピン
  const [customMarkers, setCustomMarkers] = useState<
    { lat: number; lng: number }[]
  >([]);

  // ★ 拡大縮小用 zoom state
  const [zoom, setZoom] = useState(13);

  // マップクリック（自分でピンを打つ）
  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setCustomMarkers((prev) => [...prev, { lat, lng }]);

    const { error } = await supabase
      .from('user_pins')
      .insert([{ latitude: lat, longitude: lng }]);

    if (error) {
      console.error('Supabase保存エラー', error);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 relative">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '500px' }}
          center={center}
          zoom={zoom}
          onClick={handleMapClick}
          options={{
            clickableIcons: false,
            zoomControl: false,      // ★ Google標準のズームUIを消す
            fullscreenControl: false,
          }}
        >
          {/* 観光地ピン */}
          {spots.map((spot) => (
            <Marker
              key={spot.spot_id}
              position={{ lat: spot.latitude, lng: spot.longitude }}
              onClick={() => setSelectedSpot(spot)}
            />
          ))}

          {/* 自作ピン（青） */}
          {customMarkers.map((marker, index) => (
            <Marker
              key={`custom-${index}`}
              position={marker}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
              onClick={() =>
                setCustomMarkers((prev) =>
                  prev.filter((_, i) => i !== index)
                )
              }
            />
          ))}

          {/* InfoWindow */}
          {selectedSpot && (
            <InfoWindow
              position={{
                lat: selectedSpot.latitude,
                lng: selectedSpot.longitude,
              }}
              onCloseClick={() => setSelectedSpot(null)}
            >
              <div className="text-sm font-bold">
                {selectedSpot.name}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

         {/* Controls */}
         <div className="flex items-center justify-center gap-4">
          <div className="text-2xl italic">{zoom}</div>
          <button onClick={() => setZoom(z => Math.min(z + 1, 20))}>拡大</button>
          <button onClick={() => setZoom(z => Math.max(z - 1, 5))}>縮小</button>
        </div>
      </LoadScript>
    </div>
  );
}
