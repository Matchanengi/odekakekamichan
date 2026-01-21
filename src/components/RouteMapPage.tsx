// src/components/RouteMapPage.tsx

// import { useState } from "react";
// import { ImageWithFallback } from './figma/ImageWithFallback';

/**
 * 外部のPDFファイルをインポート
 * ビルドツール（ViteやWebpack）の設定により、PDFのパスとして扱われます
 */
import routeMapImage from "../../img/routemap.pdf";

/**
 * プロパティの型定義
 * @param onBack - 前の画面に戻るためのコールバック関数（任意）
 */
interface RouteMapPageProps {
  onBack?: () => void;
}

export function RouteMapPage({ onBack }: RouteMapPageProps) {
  /* 【今後の拡張用：ズーム機能のステート】
    現在はコメントアウトされていますが、PDFの表示倍率を管理するためのコードが準備されています。
  */
  // const [zoom, setZoom] = useState(100);

  // const handleZoomIn = () => {
  //   setZoom(prev => Math.min(prev + 25, 200)); // 最大200%まで拡大
  // };

  // const handleZoomOut = () => {
  //   setZoom(prev => Math.max(prev - 25, 50));  // 最小50%まで縮小
  // };

  // const handleReset = () => {
  //   setZoom(100); // 100%（等倍）にリセット
  // };

  return (
    /* 外枠：全体のデザインを統一するためのシアン背景コンテナ */
    <div className="bg-cyan-400 rounded-3xl p-4 sm:p-8 mx-4 my-6">
      
      {/* メインコンテンツエリア：白背景のカードスタイル */}
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-4 text-blue-600 font-bold">路線図</h2>
        
        <p className="text-blue-600 mb-6">香美市観光協会が公表しているバス路線図です</p>

        {/* PDFビューアコンテナ 
            overflow-auto を設定することで、中身がはみ出した場合にスクロール可能にしています
        */}
        <div className="bg-gray-100 rounded-2xl p-4 mb-6 overflow-auto">
          <div 
            /* ビューアの高さ設定 
               vh（ビューポート単位）を使い、画面の高さに対して適切な比率(60〜75%)で表示します 
            */
            className="w-full h-[60vh] sm:h-[75vh]"
            // style={{ 
            //   transform: `scale(${zoom / 100})`,
            //   width: `${100 / (zoom / 100)}%`
            // }}
          >
            {/* <embed> タグ 
                PDFファイルをブラウザ標準のビューアを使用して表示します。
                type="application/pdf" を指定することでブラウザにPDFであることを明示します。
            */}
            <embed
              src={routeMapImage}
              type="application/pdf"
              width="100%"
              height="100%"
              className="rounded-xl"
            />
          </div>
        </div>

        {/* 【今後の拡張用：ズームコントロールUI】
            拡大・縮小ボタンのレイアウト。現在は非表示設定。
        */}
        {/* <div className="flex items-center justify-center gap-6 mb-6">
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
        </div> */}

        {/* 戻るボタン 
            props として onBack が渡されている場合のみ表示されます
        */}
        {onBack && (
          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-12 py-4 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-md active:scale-95"
            >
              戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}