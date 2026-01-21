import { useState, useEffect } from 'react';
import { supabase } from "./supabaseClient";

/**
 * 表示用データの型定義
 */
interface Departure {
  id: string;      // ユニークキー（路線名-時刻）
  route: string;   // 表示する路線名
  time: string;    // 表示する乗車時刻
  reserved: number; // 予約人数（合計）
  capacity: number; // 車両の定員
}

export function DeparturesPage() {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartures() {
      try {
        setLoading(true);

        // --- 1. Supabaseから必要な4つのテーブルを並列で一括取得 ---
        const [res, trips, routes, stops] = await Promise.all([
          supabase.from('予約').select('*'),
          supabase.from('便').select('*'),
          supabase.from('バス路線').select('*'),
          supabase.from('路線停留所').select('*')
        ]);

        if (!res.data || !trips.data) return;

        // --- 2. 取得したデータを「路線×時刻」単位で集約（グルーピング） ---
        const grouped = res.data.reduce((acc: any, curr: any) => {
          
          // 【フィルタ】キャンセル状態の予約はカウントしない
          if (curr.status === 'cancelled') {
            return acc;
          }

          // 【紐付け】予約データに対応する「便（運行スケジュール）」を特定
          const trip = trips.data.find(t => String(t.trip_id) === String(curr.trip_id));
          if (!trip) return acc;

          // 【日付判定】今日運行される便のみに絞り込む（YYYY-MM-DD形式で比較）
          const todayStr = new Date().toLocaleDateString('sv-SE'); 
          const opDate = String(trip.operation_date).replace(/\//g, '-');
          if (!opDate.includes(todayStr)) return acc;

          // 【マスタ参照】路線名と停留所情報を取得
          const routeMaster = routes.data?.find(r => String(r.id || r.route_id) === String(trip.route_id));
          const stopMaster = stops.data?.find(s => 
            String(s.id || s.stop_id) === String(curr.boarding_id) &&
            String(s.route_id) === String(trip.route_id)
          );

          const routeName = routeMaster?.route_name || "不明な路線";
          let rawTime = "時刻未設定";

          // --- 3. 便の出発時刻に応じて、停留所マスタから適切な通過時刻を選択 ---
          if (stopMaster) {
            const baseTimeStr = trip.departure_time || stopMaster.stop_time || "00:00";
            const [h, m] = baseTimeStr.split(':').map(Number);
            const totalMinutes = h * 60 + m;

            // 便の基本出発時刻（分単位）に基づいて参照カラムを動的に切り替える
            if (totalMinutes >= 360 && totalMinutes < 660) {
              rawTime = stopMaster.stop_time;    // 朝
            } else if (totalMinutes >= 660 && totalMinutes < 840) {
              rawTime = stopMaster.stop_time_2;  // 昼前後
            } else if (totalMinutes >= 840 && totalMinutes <= 1061) {
              rawTime = stopMaster.stop_time_3;  // 夕方
            } else if (totalMinutes > 1061) {
              rawTime = stopMaster.stop_time_4;  // 夜間
            } else {
              rawTime = stopMaster.stop_time;
            }
          }

          // 時刻表記を HH:mm 形式にトリミング
          const boardingTime = rawTime && rawTime.includes(':') ? rawTime.substring(0, 5) : "時刻未設定";
          
          // 「路線名」と「時刻」を組み合わせて集計用のキーを作成
          const key = `${routeName}-${boardingTime}`;

          // グループが未作成なら初期化
          if (!acc[key]) {
            acc[key] = { 
              id: key, 
              route: routeName, 
              time: boardingTime, 
              reserved: 0, 
              capacity: trip.capacity ?? 10
            };
          }
          
          // --- 【集計】予約人数(reserved_count)を加算する ---
          const count = Number(curr.reserved_count || 0);
          acc[key].reserved += count;

          return acc;
        }, {});

        // --- 4. 現在時刻に近い便（出発2時間前から出発まで）のみを抽出 ---
        const now = new Date();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

        const filtered = Object.values(grouped).filter((item: any) => {
          if (item.time === "時刻未設定") return false;
          const [h, m] = item.time.split(':').map(Number);
          const busTotalMinutes = h * 60 + m;
          
          // 「現在時刻」が「バス出発の120分前以降」かつ「バス出発前」であること
          return currentTotalMinutes >= (busTotalMinutes - 120) && currentTotalMinutes <= busTotalMinutes;
        });

        setDepartures(filtered as Departure[]);

      } catch (error) {
        console.error("運行情報の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDepartures();
  }, []);

  //使用してない（将来的な拡張用として保持）
  // const handlePrintPassengerList = (departureId: string) => {
  //   console.log(`乗車客リストPDF出力準備中: ${departureId}`);
  //   alert("PDF出力機能は準備中です");
  // };

  // ローディング中の表示
  if (loading) return <div className="p-8 text-center">運行情報を確認中...</div>;

  return (
    <div>
      <h2 className="mb-6 text-xl sm:text-3xl font-bold">まもなく出発する便</h2>
      
      {/* 運行情報テーブルの外枠 */}
      <div className="border-4 border-black rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base sm:text-lg min-w-[600px]">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">路線名</th>
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">乗車時間</th>
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">予約 / 定員</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {departures.length > 0 ? (
                // データがある場合：行をループ表示
                departures.map((departure) => (
                  <tr key={departure.id} className="border-t-4 border-black">
                    <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                      {departure.route}
                    </td>
                    <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                      <span className="text-blue-600 font-medium">{departure.time}</span> 発
                    </td>
                    <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                      {/* 予約人数が定員以上の場合は赤文字で強調 */}
                      <span className={departure.reserved >= departure.capacity ? 'text-red-600 font-bold' : 'text-cyan-600'}>
                        {departure.reserved}
                      </span>
                      {' / '}{departure.capacity} 人
                    </td>
                  </tr>
                ))
              ) : (
                // 表示対象の便がない場合のメッセージ
                <tr className="border-t-4 border-black">
                  <td colSpan={3} className="py-8 text-center text-gray-500 font-medium">
                    現在、出発予定の便はありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}