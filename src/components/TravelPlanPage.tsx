'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from './supabaseClient';

type Spot = {
  spot_id: number;
  name: string;
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

// 🔸 常に候補として追加したい観光地
const EXTRA_SPOT_NAMES = [
  '鏡野公園',
  '香美市立やなせたかし記念館 アンパンマンミュージアム',
];

export function TravelPlanPage() {
  const [destination, setDestination] = useState('');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 🔍 Supabase 検索
  const handleSearch = async () => {
    if (!destination.trim()) {
      setErrorMessage('目的地を入力してください');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setShowResults(false);

    try {
      // ① 入力された目的地で検索
      const { data: searchData, error: searchError } = await supabase
        .from('観光地')
        .select(`
          spot_id,
          name,
          description,
          business_hours,
          regular_holiday,
          parking,
          fee,
          contact_info,
          img_pass,
          address,
          distance
        `)
        .ilike('name', `%${destination}%`);

      if (searchError) throw searchError;

      // ② 固定で追加したい観光地を取得
      const { data: extraData, error: extraError } = await supabase
        .from('観光地')
        .select(`
          spot_id,
          name,
          description,
          business_hours,
          regular_holiday,
          parking,
          fee,
          contact_info,
          img_pass,
          address,
          distance
        `)
        .in('name', EXTRA_SPOT_NAMES);

      if (extraError) throw extraError;

      // ③ マージして重複排除
      const merged = [...(searchData ?? []), ...(extraData ?? [])];

      const uniqueSpots = Array.from(
        new Map(merged.map((spot) => [spot.spot_id, spot])).values()
      );

      setSpots(uniqueSpots);
      setShowResults(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message ?? '検索中にエラーが発生しました');
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDestination('');
    setSpots([]);
    setShowResults(false);
    setErrorMessage('');
  };

  return (
    <div className="bg-cyan-400 rounded-3xl p-3 sm:p-8 mx-2 sm:mx-4 my-4 sm:my-6">
      <div className="bg-white rounded-3xl p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl mb-2">旅行プラン検索</h2>
        <p className="text-sm sm:text-base mb-6">
          あなたにぴったりな旅行プランを作成します
        </p>

        {/* 🔍 検索入力 */}
        <div className="mb-6">
          <div className="mb-4">
            <div className="bg-cyan-400 text-white px-4 py-2 rounded-t-lg inline-block">
              目的地
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="吉井勇記念館"
              className="w-full border-2 border-black rounded-lg px-4 py-3"
            />
          </div>

          {!showResults ? (
            <button
              onClick={handleSearch}
              className="bg-green-500 text-white px-8 py-3 rounded-lg w-full sm:w-auto"
            >
              検索する
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="bg-green-500 text-white px-8 py-3 rounded-lg w-full sm:w-auto"
            >
              再検索
            </button>
          )}
        </div>

        {/* ⏳ ローディング */}
        {loading && <p className="text-center">検索中...</p>}

        {/* ❌ エラー */}
        {errorMessage && (
          <p className="text-center text-red-600 mb-4">
            {errorMessage}
          </p>
        )}

        {/* 📄 検索結果 */}
        {showResults && !loading && (
          <>
            <div className="flex justify-center mb-6">
              <ChevronDown className="text-cyan-400" size={48} />
            </div>

            {spots.length === 0 && (
              <p className="text-center">該当する観光地はありません</p>
            )}

            {spots.map((spot, index) => (
              <div key={spot.spot_id} className="mb-6">
                <div className="flex items-center mb-3">
                  <div className="bg-cyan-400 text-white px-4 py-2 rounded">
                    候補地{index + 1}
                  </div>
                  <div className="ml-3 text-lg">{spot.name}</div>
                </div>

                <div className="bg-white">
                  <p className="text-sm mb-4">
                    {spot.description ?? '説明はありません'}
                  </p>

                  {spot.img_pass && (
                    <div className="aspect-video overflow-hidden rounded-lg mb-4">
                      <ImageWithFallback
                        src={spot.img_pass}
                        alt={spot.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <ul className="text-sm space-y-1 mb-4">
                    <li>住所：{spot.address ?? '不明'}</li>
                    <li>営業時間：{spot.business_hours ?? '不明'}</li>
                    <li>定休日：{spot.regular_holiday ?? '不明'}</li>
                    <li>駐車場：{spot.parking ?? '不明'}</li>
                    <li>料金：{spot.fee ?? '不明'}</li>
                    <li>連絡先：{spot.contact_info ?? '不明'}</li>
                  </ul>
                </div>
              </div>
            ))}

            {/* 下部ボタン（MAPのみ） */}
            <div className="flex flex-col gap-3 mt-6">
              <button className="bg-green-500 text-white px-8 py-4 rounded-lg">
                MAPで経路を確認する
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
