'use client';

import { useState } from 'react';
import { ChevronDown, Star, MapPin, Clock, Calendar, Car, Coins, Phone } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback'; // 画像読み込み失敗時のフォールバック機能付きコンポーネント
import { supabase } from './supabaseClient'; // Supabaseクライアントのインスタンス

/**
 * TravelPlanPageコンポーネントのプロップス定義
 */
type Props = {
  onShowItinerary: () => void; // 旅程表示（現在は使用箇所コメントアウト）
  setMapSpots: (spots: Spot[]) => void; // マップに表示する地点をセットする関数
  setCurrentUserPage: (page: 'map') => void; // 画面遷移を制御する関数
};

/**
 * 観光スポットの型定義（データベースの「観光地」テーブルに対応）
 */
type Spot = {
  spot_id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  business_hours: string | null;
  regular_holiday: string | null;
  parking: string | null;
  fee: string | null;
  contact_info: string | null;
  img_pass: string | null;
  address: string | null;
  distance: number | null;
};

/**
 * 検索結果に必ず含める「おすすめスポット」の名称リスト
 */
const EXTRA_SPOT_NAMES = [
  '鏡野公園',
  '香美市立やなせたかし記念館 アンパンマンミュージアム',
];

/**
 * 旅行プラン検索ページコンポーネント
 * * 役割：
 * 1. Supabaseから観光地データを検索・取得
 * 2. 検索結果とおすすめスポットを統合して表示
 * 3. 選択したスポットを地図画面へ引き継ぐ
 */
export function TravelPlanPage({
  //onShowItinerary,
  setMapSpots,
  setCurrentUserPage,
}: Props) {
  // --- ステート管理 ---
  const [destination, setDestination] = useState(''); // ユーザーの入力値
  const [spots, setSpots] = useState<Spot[]>([]); // 検索結果のリスト
  const [showResults, setShowResults] = useState(false); // 結果エリアの表示フラグ
  const [loading, setLoading] = useState(false); // ローディング状態
  const [errorMessage, setErrorMessage] = useState(''); // エラーメッセージ

  /**
   * 検索処理：Supabaseからデータを取得
   */
  const handleSearch = async () => {
    if (!destination.trim()) {
      setErrorMessage('目的地を入力してください');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    setShowResults(false);

    try {
      // 1. ユーザーの入力に基づいた検索（部分一致）
      const { data: searchData, error: searchError } = await supabase
        .from('観光地')
        .select('*')
        .ilike('name', `%${destination}%`);
      if (searchError) throw searchError;

      // 2. 「おすすめスポット」のデータを別途取得
      const { data: extraData, error: extraError } = await supabase
        .from('観光地')
        .select('*')
        .in('name', EXTRA_SPOT_NAMES);
      if (extraError) throw extraError;

      // 3. 2つの結果を結合
      const merged = [...(searchData ?? []), ...(extraData ?? [])];
      
      // 4. 重複の排除（Mapオブジェクトを利用してID単位で一意にする）
      const uniqueSpots = Array.from(
        new Map(merged.map((spot) => [spot.spot_id, spot])).values()
      );

      setSpots(uniqueSpots);
      setShowResults(true);
    } catch (err: any) {
      setErrorMessage(err?.message ?? '検索中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ★修正ポイント：結果をリセットするが、入力値（destination）は残す
   */
  const handleCloseResults = () => {
    setSpots([]);
    setShowResults(false);
    setErrorMessage('');
  };

  return (
    <div className="bg-cyan-400 rounded-3xl p-3 sm:p-8 mx-2 sm:mx-4 my-4 sm:my-6 font-sans text-blue-900">
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">旅行プラン検索</h2>
        <p className="text-gray-600 mb-8 text-sm sm:text-base">あなたにぴったりな旅行プランを作成します</p>

        {/* --- 検索入力セクション --- */}
        <div className="max-w-3xl mb-10">
          <div className="mb-4">
            <div className="bg-cyan-400 text-white px-5 py-1.5 rounded-t-xl font-bold text-sm inline-block">目的地</div>
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="吉井勇記念館"
              className={`w-full border-2 rounded-xl px-4 py-3 outline-none transition-all text-black ${
                // エラー時は枠線を赤くする
                errorMessage ? 'border-red-500 bg-red-50' : 'border-blue-900 focus:ring-2 focus:ring-cyan-300'
              }`}
            />
            {errorMessage && <p className="text-red-500 text-sm font-bold mt-2 ml-1">{errorMessage}</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-10 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition-all active:scale-95 shadow-md disabled:bg-gray-400"
            >
              {loading ? '検索中...' : '検索する'}
            </button>

            {/* ★修正ポイント：結果表示中のみ「閉じる」ボタンを表示 */}
            {showResults && (
              <button
                onClick={handleCloseResults}
                className="px-10 py-3 rounded-xl font-bold text-white bg-gray-500 hover:bg-gray-600 transition-all active:scale-95 shadow-md"
              >
                結果を閉じる
              </button>
            )}
          </div>
        </div>

        {/* --- 検索結果エリア --- */}
        {showResults && !loading && (
          // Tailwindのアニメーションクラスでふわっと表示
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex justify-center mb-10">
              <ChevronDown className="text-cyan-400 animate-bounce" size={48} />
            </div>

            {spots.length === 0 ? (
              <p className="text-center text-gray-500 font-bold py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                該当する観光地は見つかりませんでした
              </p>
            ) : (
              <div className="space-y-12">
                {spots.map((spot, index) => {
                  // おすすめリストに含まれているか判定
                  const isRecommended = EXTRA_SPOT_NAMES.includes(spot.name);
                  return (
                    <div key={spot.spot_id} className="border-b border-gray-100 pb-10 last:border-none">
                      <div className="mb-4">
                        {isRecommended && (
                          <div className="mb-2">
                            <span className="bg-orange-500 text-white text-xs font-extrabold px-3 py-1 rounded-full inline-flex items-center shadow-sm">
                              <Star size={12} className="mr-1 fill-white" />
                              開発者のおすすめスポット
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="bg-cyan-400 text-white px-3 py-1 rounded-lg font-bold text-sm">
                            候補地 {index + 1}
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold">{spot.name}</h3>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-6">{spot.description ?? '説明はありません'}</p>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* 左：画像エリア（モバイルでは下にくるよう order を調整） */}
                        <div className="order-2 lg:order-1">
                          {spot.img_pass ? (
                            <div className="aspect-[16/10] overflow-hidden rounded-2xl shadow-lg border-4 border-white">
                              <ImageWithFallback
                                src={spot.img_pass}
                                alt={spot.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-[16/10] bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 text-sm">
                              NO IMAGE
                            </div>
                          )}
                        </div>

                        {/* 右：詳細情報リスト */}
                        <div className="order-1 lg:order-2">
                          <ul className="space-y-3 text-sm sm:text-base text-gray-700">
                            {/* 各項目をアイコンと共に表示。データがない場合は「不明」を表示 */}
                            <li className="flex gap-2 items-start"><MapPin size={18} className="text-cyan-500 shrink-0 mt-0.5" /><span><strong className="text-blue-900">住所：</strong>{spot.address ?? '不明'}</span></li>
                            <li className="flex gap-2 items-start"><Clock size={18} className="text-cyan-500 shrink-0 mt-0.5" /><span><strong className="text-blue-900">営業時間：</strong>{spot.business_hours ?? '不明'}</span></li>
                            <li className="flex gap-2 items-start"><Calendar size={18} className="text-cyan-500 shrink-0 mt-0.5" /><span><strong className="text-blue-900">定休日：</strong>{spot.regular_holiday ?? '不明'}</span></li>
                            <li className="flex gap-2 items-start"><Car size={18} className="text-cyan-500 shrink-0 mt-0.5" /><span><strong className="text-blue-900">駐車場：</strong>{spot.parking ?? '不明'}</span></li>
                            <li className="flex gap-2 items-start"><Coins size={18} className="text-cyan-500 shrink-0 mt-0.5" /><span><strong className="text-blue-900">料金：</strong>{spot.fee ?? '不明'}</span></li>
                            <li className="flex gap-2 items-start"><Phone size={18} className="text-cyan-500 shrink-0 mt-0.5" /><span><strong className="text-blue-900">連絡先：</strong>{spot.contact_info ?? '不明'}</span></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* --- フッターアクション：地図連携 --- */}
                <div className="flex justify-center pt-8">
                  <button
                    type="button"
                    onClick={() => {
                      // 緯度・経度が存在するスポットのみを地図に渡す
                      setMapSpots(
                        spots.filter(s => s.latitude && s.longitude)
                      );
                      // 地図画面へ切り替え
                      setCurrentUserPage('map');
                    }}
                    className="px-12 py-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl active:scale-95"
                  >
                    MAPで経路を確認する
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}