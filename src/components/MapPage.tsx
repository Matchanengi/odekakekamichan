import { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
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
  spots: Spot[]; // 親から渡される表示用スポット一覧
};

/**
 * 地図の初期中心座標（高知県香美市付近）
 */
const center = {
  lat: 33.6036,
  lng: 133.6867,
};

export function MapPage({ spots }: MapPageProps) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // ユーザーが地図クリックで作成した「自作ピン」のリストを管理
  const [customMarkers, setCustomMarkers] = useState<
    { lat: number; lng: number }[]
  >([]);

  // 地図のズームレベルを管理するステート
  const [zoom, setZoom] = useState(13);

  /**
   * 地図クリック時の処理：
   * 1. クリック座標をローカルステート(customMarkers)に追加
   * 2. Supabaseの「user_pins」テーブルへ永続化保存
   */
  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // ローカルのピン一覧を即座に更新
    setCustomMarkers((prev) => [...prev, { lat, lng }]);

    // Supabaseサーバーへの保存リクエスト
    const { error } = await supabase
      .from('user_pins')
      .insert([{ latitude: lat, longitude: lng }]);

    if (error) {
      console.error('Supabase保存エラー', error);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 relative">
      {/* Google Mapsのライブラリ読み込み。環境変数からAPIキーを取得 */}
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '500px' }}
          center={center}
          zoom={zoom}
          onClick={handleMapClick}
          options={{
            clickableIcons: false,  // POI（地図上の施設アイコン）をクリック不可にする
            zoomControl: false,      // Google標準の+/-ボタンを非表示（自前コントロールを使用するため）
            fullscreenControl: false,
          }}
        >
          {/* 1. DBから取得した既存の「観光地ピン」の描画 */}
          {spots.map((spot) => (
            <Marker
              key={spot.spot_id}
              position={{ lat: spot.latitude, lng: spot.longitude }}
              onClick={() => setSelectedSpot(spot)} // クリックで詳細ウィンドウを開く
            />
          ))}

          {/* 2. ユーザーが追加した「自作ピン（青）」の描画 */}
          {customMarkers.map((marker, index) => (
            <Marker
              key={`custom-${index}`}
              position={marker}
              icon={{
                // 標準ピンとは異なる画像URLを指定
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
              onClick={() =>
                // ピンをクリックするとそのピンを削除する処理
                setCustomMarkers((prev) =>
                  prev.filter((_, i) => i !== index)
                )
              }
            />
          ))}

          {/* 3. 選択されたスポットの情報を表示する吹き出し(InfoWindow) */}
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

         {/* マップの外に配置した独自のズームコントロールUI */}
         <div className="flex items-center justify-center gap-4">
          <div className="text-2xl italic">{zoom}</div>
          <button onClick={() => setZoom(z => Math.min(z + 1, 20))}>拡大</button>
          <button onClick={() => setZoom(z => Math.max(z - 1, 5))}>縮小</button>
        </div>
      </LoadScript>
    </div>
  );
}