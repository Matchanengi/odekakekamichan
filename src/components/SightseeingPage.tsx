'use client';

import { useEffect, useState } from 'react';
import { ArrowUpDown } from 'lucide-react'; // 上下矢印アイコン
import { ImageWithFallback } from './figma/ImageWithFallback'; // 画像読み込み失敗時のフォールバック付きコンポーネント
import { supabase } from './supabaseClient'; // Supabaseクライアントのインスタンス

/**
 * 観光地データのインターフェース定義
 */
interface Spot {
  spot_id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  hurigana: string;
  distance: number | null;
  description: string;
  images: string[];
  details: {
    hours: string;
    closedDays: string;
    parking: string;
    price: string;
    contact: string;
  };
}

// 並び替え状態のための型定義
type NameSortOrder = 'asc' | 'desc'; // 昇順・降順
type DistanceSortOrder = 'near' | 'far'; // 近い・遠い

export function SightseeingPage() {
  // --- ステート管理 ---
  const [spots, setSpots] = useState<Spot[]>([]); // 観光地データのリスト
  const [nameSortOrder, setNameSortOrder] = useState<NameSortOrder>('asc'); // 名前のソート方向
  const [distanceSortOrder, setDistanceSortOrder] = useState<DistanceSortOrder>('near'); // 距離のソート方向
  const [activeSort, setActiveSort] = useState<'name' | 'distance'>('name'); // 現在どちらのソートが有効か
  const [loading, setLoading] = useState(true); // ローディング状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ

  /**
   * コンポーネントマウント時に実行：Supabaseからデータを取得
   */
  useEffect(() => {
    const fetchSpots = async () => {
      setLoading(true);
      setError(null);

      // Supabaseの「観光地」テーブルから必要なカラムを取得
      const { data, error } = await supabase
        .from('観光地')
        .select(`
          spot_id,
          name,
          hurigana,
          distance,
          description,
          img_pass,
          business_hours,
          regular_holiday,
          parking,
          fee,
          contact_info,
          latitude,
          longitude
        `);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // データベースのフラットな構造を、フロントエンドで使いやすいSpot型に整形
      const formatted: Spot[] =
      data?.map((item: any) => ({
        spot_id: item.spot_id,
        name: item.name,
        hurigana: item.hurigana ?? '',
        distance: item.distance ?? null,
        description: item.description ?? '',
        // 画像パスが配列でない場合は配列に変換し、空なら空配列を設定
        images: Array.isArray(item.img_pass)
          ? item.img_pass
          : item.img_pass
          ? [item.img_pass]
          : [],
        latitude: item.latitude ?? 0,
        longitude: item.longitude ?? 0,
        details: {
          hours: item.business_hours ?? '不明',
          closedDays: item.regular_holiday ?? '不明',
          parking: item.parking ?? '不明',
          price: item.fee ?? '不明',
          contact: item.contact_info ?? '不明',
        },
      })) ?? [];

      setSpots(formatted);
      setLoading(false);
    };

    fetchSpots();
  }, []);

  /**
   * 🔽 並び替え処理（表示時に動的に計算）
   * 元のspots配列を壊さないようスプレッド構文 [...spots] でコピーしてからsort
   */
  const sortedSpots = [...spots].sort((a, b) => {
    // 1. 名前（ふりがな）順でのソート
    if (activeSort === 'name') {
      return nameSortOrder === 'asc'
        ? a.hurigana.localeCompare(b.hurigana, 'ja') // 日本語の辞書順
        : b.hurigana.localeCompare(a.hurigana, 'ja');
    }

    // 2. 山田駅からの距離順でのソート
    // distance が null（未設定）の場合は数値の最大値として扱い、最後に回す
    const distA = a.distance ?? Number.MAX_SAFE_INTEGER;
    const distB = b.distance ?? Number.MAX_SAFE_INTEGER;

    return distanceSortOrder === 'near'
      ? distA - distB // 昇順
      : distB - distA; // 降順
  });

  // 名前ソートボタンの切り替え
  const toggleNameSort = () => {
    setActiveSort('name');
    setNameSortOrder(nameSortOrder === 'asc' ? 'desc' : 'asc');
  };

  // 距離ソートボタンの切り替え
  const toggleDistanceSort = () => {
    setActiveSort('distance');
    setDistanceSortOrder(distanceSortOrder === 'near' ? 'far' : 'near');
  };

  // --- 条件付きレンダリング（ローディング・エラー） ---
  if (loading) {
    return <p className="text-center py-10">読み込み中...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 py-10">エラー：{error}</p>;
  }

  return (
    /* 外枠：角丸と水色背景 */
    <div className="bg-cyan-400 rounded-3xl p-4 sm:p-8 mx-4 my-6">
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-4 text-blue-600">
          観光地一覧
        </h2>

        {/* 並び替え操作エリア */}
        <div className="flex flex-wrap justify-end gap-4 mb-6">
          <button
            onClick={toggleNameSort}
            className="bg-cyan-400 text-white px-6 py-3 rounded-lg hover:bg-cyan-500 transition-colors flex items-center gap-2"
          >
            <ArrowUpDown size={20} />
            観光地名順（{nameSortOrder === 'asc' ? '昇順' : '降順'}）
          </button>

          <button
            onClick={toggleDistanceSort}
            className="bg-cyan-400 text-white px-6 py-3 rounded-lg hover:bg-cyan-500 transition-colors flex items-center gap-2"
          >
            <ArrowUpDown size={20} />
            山田駅からの距離順（{distanceSortOrder === 'near' ? '近い' : '遠い'}）
          </button>
        </div>

        {/* 観光地カードリスト */}
        <div className="space-y-8">
          {sortedSpots.map((spot, index) => (
            <div
              key={spot.spot_id}
              className="border-2 border-gray-300 rounded-lg overflow-hidden"
            >
              {/* カードヘッダー：No.表記と名前 */}
              <div className="flex items-center">
                <div className="bg-cyan-400 text-white px-8 py-4 text-2xl">
                  No.{index + 1}
                </div>
                <div className="flex-1 px-6 py-4 text-xl border-l-2 border-gray-300">
                  {spot.name}
                </div>
              </div>

              {/* カードボディ：詳細情報 */}
              <div className="p-6 bg-white">
                {/* 解説文：改行を保持(whitespace-pre-line) */}
                <p className="text-blue-600 mb-6 leading-relaxed whitespace-pre-line">
                  {spot.description}
                </p>

                {/* 画像ギャラリーエリア */}
                {spot.images.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {spot.images.map((img, i) => (
                      <div
                        key={i}
                        className="w-full aspect-video overflow-hidden rounded-lg"
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`${spot.name}-${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 詳細スペック表：グリッドレイアウトでラベルと値を表示 */}
                <div className="border-2 border-cyan-400 rounded-lg overflow-hidden">
                  {[
                    ['営業時間', spot.details.hours],
                    ['定休日', spot.details.closedDays],
                    ['駐車場', spot.details.parking],
                    ['料金', spot.details.price],
                    ['お問い合わせ', spot.details.contact],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-1 sm:grid-cols-3 border-b last:border-b-0 border-cyan-400"
                    >
                      {/* 左側ラベル（モバイルでは上） */}
                      <div className="bg-cyan-400 text-white px-6 py-4 text-center sm:border-r border-cyan-400">
                        {label}
                      </div>
                      {/* 右側データ（モバイルでは下） */}
                      <div className="col-span-2 px-6 py-4 bg-blue-50 whitespace-pre-line">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}