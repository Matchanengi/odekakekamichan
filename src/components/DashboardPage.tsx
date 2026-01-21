import { useEffect, useState } from 'react';
import { supabase } from "./supabaseClient";

export function DashboardPage() {
  const [totalReservations, setTotalReservations] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const today = new Date().toISOString().split('T')[0];
        
        // 1. 「予約」テーブルから取得
        // 2. 「便」テーブルを inner join して今日の日付で絞り込む
        // 3. .neq('status', 'cancelled') を追加してキャンセルを除外
        const { count, error } = await supabase
          .from('予約')
          .select('*, 便!inner(operation_date)', { count: 'exact', head: true })
          .eq('便.operation_date', today)
          .neq('status', 'cancelled'); // ← ここを追加

        if (error) {
          console.error("SQLエラー詳細:", error.message);
          console.error("ヒント:", error.hint);
          throw error;
        }

        setTotalReservations(count || 0);

      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-xl">読み込み中...</div>;
  
  return (
    <div>
      <h2 className="mb-8 text-2xl sm:text-3xl font-bold">本日の利用状況</h2>
      
      <div className="flex flex-col sm:flex-row gap-6 mt-12">
        <div className="flex-1">
          <div className="border-4 border-black rounded-2xl overflow-hidden">
            <div className="bg-green-700 text-white py-4 sm:py-6 px-4 sm:px-8 text-center text-xl sm:text-2xl font-bold">
              今日の予約件数
            </div>
            <div className="bg-white py-8 sm:py-16 text-center">
              <span className="text-4xl sm:text-6xl font-black">{totalReservations}件</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}