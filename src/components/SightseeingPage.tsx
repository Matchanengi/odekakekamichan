'use client';

import { useEffect, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { supabase } from './supabaseClient';

interface Spot {
  spot_id: number;
  name: string;
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

type SortOrder = 'asc' | 'desc';

export function SightseeingPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
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

  const sortedSpots = [...spots].sort((a, b) =>
    sortOrder === 'asc'
      ? a.name.localeCompare(b.name, 'ja')
      : b.name.localeCompare(a.name, 'ja')
  );

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
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

        <div className="flex justify-end mb-6">
          <button
            onClick={toggleSortOrder}
            className="bg-cyan-400 text-white px-6 py-3 rounded-lg hover:bg-cyan-500 transition-colors flex items-center gap-2"
          >
            <ArrowUpDown size={20} />
            観光地名順（{sortOrder === 'asc' ? '昇順' : '降順'}）
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

                {/* 画像（詳細テーブルと同じ横幅） */}
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

                {/* 詳細テーブル */}
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
