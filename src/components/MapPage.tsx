import { useState } from 'react';
//画像は適当
import mapImage from "../../png/0c7dbf9de4fe44c2e056ffc2a1bda5ea6e175f23.png";

export function MapPage() {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-blue-900 mb-4">MAP</h1>
          <div className="text-blue-900 space-y-1">
            <p>表示されている地図は香美市のも地図になります。</p>
            <p>観光地を決めるヒントや、経路探索などにお使いください</p>
          </div>
        </div>

        {/* Map Section */}
        <div className="overflow-hidden rounded-lg mb-6 bg-gray-100">
          <div 
            className="transition-transform origin-center"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <img
              src={mapImage}
              alt="香美市の地図"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <div className="text-2xl italic">{zoom}%</div>
          <button
            onClick={handleZoomIn}
            className="px-12 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            拡大
          </button>
          <button
            onClick={handleZoomOut}
            className="px-12 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            縮小
          </button>
        </div>
      </div>
    </div>
  );
}