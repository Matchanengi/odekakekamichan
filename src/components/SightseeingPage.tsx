'use client';

import { useEffect, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from './supabaseClient';

interface Spot {
  spot_id: number;
  name: string;
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

type NameSortOrder = 'asc' | 'desc';
type DistanceSortOrder = 'near' | 'far';

export function SightseeingPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [nameSortOrder, setNameSortOrder] = useState<NameSortOrder>('asc');
  const [distanceSortOrder, setDistanceSortOrder] =
    useState<DistanceSortOrder>('near');
  const [activeSort, setActiveSort] = useState<'name' | 'distance'>('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpots = async () => {
      setLoading(true);
      setError(null);

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
          contact_info
        `);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const formatted: Spot[] =
        data?.map((item: any) => ({
          spot_id: item.spot_id,
          name: item.name,
          hurigana: item.hurigana ?? '',
          distance: item.distance ?? null,
          description: item.description ?? '',
          images: Array.isArray(item.img_pass)
            ? item.img_pass
            : item.img_pass
            ? [item.img_pass]
            : [],
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

  // 🔽 並び替え処理
  const sortedSpots = [...spots].sort((a, b) => {
    if (activeSort === 'name') {
      return nameSortOrder === 'asc'
        ? a.hurigana.localeCompare(b.hurigana, 'ja')
        : b.hurigana.localeCompare(a.hurigana, 'ja');
    }

    // distance が null の場合は最後に回す
    const distA = a.distance ?? Number.MAX_SAFE_INTEGER;
    const distB = b.distance ?? Number.MAX_SAFE_INTEGER;

    return distanceSortOrder === 'near'
      ? distA - distB
      : distB - distA;
  });

  const toggleNameSort = () => {
    setActiveSort('name');
    setNameSortOrder(nameSortOrder === 'asc' ? 'desc' : 'asc');
  };

  const toggleDistanceSort = () => {
    setActiveSort('distance');
    setDistanceSortOrder(distanceSortOrder === 'near' ? 'far' : 'near');
  };

  if (loading) {
    return <p className="text-center py-10">読み込み中...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 py-10">エラー：{error}</p>;
  }

  return (
    <div className="bg-cyan-400 rounded-3xl p-4 sm:p-8 mx-4 my-6">
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-4 text-blue-600">
          観光地一覧
        </h2>

        {/* 並び替えボタン */}
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
            距離順（{distanceSortOrder === 'near' ? '近い' : '遠い'}）
          </button>
        </div>

        <div className="space-y-8">
          {sortedSpots.map((spot, index) => (
            <div
              key={spot.spot_id}
              className="border-2 border-gray-300 rounded-lg overflow-hidden"
            >
              <div className="flex items-center">
                <div className="bg-cyan-400 text-white px-8 py-4 text-2xl">
                  No.{index + 1}
                </div>
                <div className="flex-1 px-6 py-4 text-xl border-l-2 border-gray-300">
                  {spot.name}
                </div>
              </div>

              <div className="p-6 bg-white">
                <p className="text-blue-600 mb-6 leading-relaxed whitespace-pre-line">
                  {spot.description}
                </p>

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
                      <div className="bg-cyan-400 text-white px-6 py-4 text-center sm:border-r border-cyan-400">
                        {label}
                      </div>
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
