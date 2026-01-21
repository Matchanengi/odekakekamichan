import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { supabase } from './supabaseClient';

/**
 * 観光地（スポット）のデータ型定義
 */
type Spot = {
  spot_id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type MapPageProps = {
  spots: Spot[]; // 親から渡される観光地データ
};

/**
 * --- 地図の定数設定 ---
 * コンポーネントの外で定義することで、再レンダリング時の無駄な計算を防ぎます。
 */
const CENTER = { lat: 33.6036, lng: 133.6867 }; // 高知県香美市付近
const CONTAINER_STYLE = { width: '100%', height: '500px' };

// 前回のコードで不足していた定義です。空の配列として定義します。
const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = [];

export function MapPage({ spots }: MapPageProps) {
  // --- ステート（状態）管理 ---
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [zoom, setZoom] = useState(13);
  const [customMarkers, setCustomMarkers] = useState<{ lat: number; lng: number }[]>([]);

  /**
   * 1. Google Maps API のロード設定（日本語化対応）
   */
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    language: 'ja', // ★地図を日本語に設定
    region: 'JP',   // ★日本地域に設定
    libraries: LIBRARIES,
  });

  /**
   * 2. 地図クリック時の処理
   */
  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // 画面上に即座にピンを表示
    setCustomMarkers((prev) => [...prev, { lat, lng }]);

    // Supabaseに保存
    const { error } = await supabase
      .from('user_pins')
      .insert([{ latitude: lat, longitude: lng }]);

    if (error) {
      console.error('Supabase保存エラー:', error.message);
    }
  }, []);

  /**
   * 3. マップのオプション（ボタンの非表示設定など）
   */
  const mapOptions = useMemo(() => ({
    clickableIcons: false,  // 既存施設のアイコンをクリック不可にする
    zoomControl: false,      // 標準のズームボタンを隠す
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
  }), []);

  // --- 表示の分岐 ---

  if (loadError) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        <strong>地図の読み込みエラー：</strong><br />
        Google Cloud Console で「Maps JavaScript API」が有効になっているか確認してください。
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="p-8 text-center text-gray-500">Googleマップを日本語で読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <GoogleMap
          mapContainerStyle={CONTAINER_STYLE}
          center={CENTER}
          zoom={zoom}
          onClick={handleMapClick}
          options={mapOptions}
        >
          {/* 既存スポットのピン */}
          {spots.map((spot) => (
            <MarkerF
              key={`spot-${spot.spot_id}`}
              position={{ lat: spot.latitude, lng: spot.longitude }}
              onClick={() => setSelectedSpot(spot)}
            />
          ))}

          {/* ユーザーが追加した自作ピン（青色などのカスタムURLも可） */}
          {customMarkers.map((marker, index) => (
            <MarkerF
              key={`custom-${index}`}
              position={marker}
              onClick={() => setCustomMarkers(prev => prev.filter((_, i) => i !== index))}
            />
          ))}

          {/* 情報ウィンドウ */}
          {selectedSpot && (
            <InfoWindowF
              position={{ lat: selectedSpot.latitude, lng: selectedSpot.longitude }}
              onCloseClick={() => setSelectedSpot(null)}
            >
              <div className="p-1">
                <p className="font-bold text-gray-800">{selectedSpot.name}</p>
                <p className="text-xs text-blue-600">観光スポット</p>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>

      {/* 自作のズームコントローラー（日本語UI） */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex items-center bg-gray-100 p-1 rounded-xl shadow-inner">
          <button 
            className="w-12 h-12 flex items-center justify-center text-2xl font-bold text-gray-500 hover:text-blue-600"
            onClick={() => setZoom(z => Math.max(z - 1, 5))}
          >
            －
          </button>
          <div className="bg-white px-6 py-2 rounded-lg shadow-sm">
            <span className="text-sm text-gray-400 mr-2 uppercase">Zoom</span>
            <span className="text-xl font-bold font-mono text-blue-600">{zoom}</span>
          </div>
          <button 
            className="w-12 h-12 flex items-center justify-center text-2xl font-bold text-gray-500 hover:text-blue-600"
            onClick={() => setZoom(z => Math.min(z + 1, 20))}
          >
            ＋
          </button>
        </div>
        <p className="text-xs text-gray-400">
          地図をタップしてピンを追加できます。ピンをタップすると削除します。
        </p>
      </div>
    </div>
  );
}