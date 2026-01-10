import { useState } from "react";
import { ImageWithFallback } from './figma/ImageWithFallback';
import routeMapImage from "../../png/0c7dbf9de4fe44c2e056ffc2a1bda5ea6e175f23.png";

interface RouteMapPageProps {
  onBack?: () => void;
}

export function RouteMapPage({ onBack }: RouteMapPageProps) {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleReset = () => {
    setZoom(100);
  };

  return (
    <div className="bg-cyan-400 rounded-3xl p-4 sm:p-8 mx-4 my-6">
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-4 text-blue-600">路線図</h2>
        
        <p className="text-blue-600 mb-6">香美市観光協会が公表しているバス路線図です</p>

        {/* Route Map Image Container */}
        <div className="bg-gray-100 rounded-2xl p-4 mb-6 overflow-auto">
          <div 
            className="transition-transform duration-300 origin-top-left"
            style={{ 
              transform: `scale(${zoom / 100})`,
              width: `${100 / (zoom / 100)}%`
            }}
          >
            <ImageWithFallback
              src={routeMapImage}
              alt="香美市公共交通系統図"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={handleReset}
            className="text-2xl px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[120px]"
          >
            {zoom}%
          </button>
          <button
            onClick={handleZoomIn}
            className="bg-green-600 text-white px-12 py-4 rounded-lg hover:bg-green-700 transition-colors text-xl"
          >
            拡大
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-green-600 text-white px-12 py-4 rounded-lg hover:bg-green-700 transition-colors text-xl"
          >
            縮小
          </button>
        </div>

        {/* Back Button (optional) */}
        {onBack && (
          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-12 py-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
