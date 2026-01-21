import { useEffect, useState } from 'react';
import { supabase } from "./supabaseClient";

export function DashboardPage() {
  // --- 状態管理 (State) ---
  const [totalReservations, setTotalReservations] = useState<number>(0); // 今日の有効な予約総数
  const [loading, setLoading] = useState(true);                        // 読み込み中フラグ

  useEffect(() => {
    /**
     * 今日の予約件数を取得する非同期関数
     */
    async function fetchData() {
      try {
        setLoading(true);

        // --- 日付の準備 ---
        // 実行時の日付を "YYYY-MM-DD" 形式で取得
        const today = new Date().toISOString().split('T')[0];
        
        // --- データ取得ロジック ---
        // 1. 「予約」テーブルからメインデータを取得
        // 2. 「便」テーブルを inner join して、運行日が今日（today）のものだけにフィルタリング
        // 3. status が 'cancelled'（キャンセル）ではない「有効な予約」のみをカウント
        // 4. select 内の { count: 'exact', head: true } は、実際のデータは取得せず件数のみを高速にカウントする設定
        const { count, error } = await supabase
          .from('予約')
          .select('*, 便!inner(operation_date)', { count: 'exact', head: true })
          .eq('便.operation_date', today)
          .neq('status', 'cancelled');

        // エラーハンドリング（SQLやネットワークエラー時の詳細出力）
        if (error) {
          console.error("SQLエラー詳細:", error.message);
          console.error("ヒント:", error.hint);
          throw error;
        }

        // カウント結果をステートに保存（nullの場合は0をセット）
        setTotalReservations(count || 0);

      } catch (error) {
        console.error("データ取得エラー:", error);
      } finally {
        // 成功・失敗に関わらずローディングを終了
        setLoading(false);
      }
    }

    fetchData();
  }, []); // 初回レンダリング時のみ実行

  // --- UI表示: ローディング中 ---
  if (loading) return <div className="p-8 text-center text-xl">読み込み中...</div>;
  
  // --- UI表示: メインコンテンツ ---
  return (
    <div>
      <h2 className="mb-8 text-2xl sm:text-3xl font-bold">本日の利用状況</h2>
      
      <div className="flex flex-col sm:flex-row gap-6 mt-12">
        <div className="flex-1">
          {/* 太線(border-4)と角丸(rounded-2xl)を活かしたカードデザイン */}
          <div className="border-4 border-black rounded-2xl overflow-hidden">
            {/* ヘッダー部分（グリーンの背景に白文字） */}
            <div className="bg-green-700 text-white py-4 sm:py-6 px-4 sm:px-8 text-center text-xl sm:text-2xl font-bold">
              今日の予約件数
            </div>
            {/* コンテンツ部分（大きな数字で件数を表示） */}
            <div className="bg-white py-8 sm:py-16 text-center">
              <span className="text-4xl sm:text-6xl font-black">{totalReservations}件</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}