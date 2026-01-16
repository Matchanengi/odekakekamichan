import { useState, useEffect } from 'react';
import { supabase } from "./supabaseClient";

interface Departure {
  id: string;
  route: string;
  time: string;
  reserved: number;
  capacity: number;
}

export function DeparturesPage() {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
async function fetchDepartures() {
  try {
    setLoading(true);

    const [res, trips, routes, stops] = await Promise.all([
      supabase.from('予約').select('*'),
      supabase.from('便').select('*'),
      supabase.from('バス路線').select('*'),
      supabase.from('路線停留所').select('*')
    ]);

    if (!res.data || !trips.data) return;

    const grouped = res.data.reduce((acc: any, curr: any) => {
      // 1. 便の紐付け
      const trip = trips.data.find(t => String(t.trip_id) === String(curr.trip_id));
      if (!trip) return acc;

      // 2. 今日（2026-01-16）の日付に絞り込む
      const todayStr = new Date().toLocaleDateString('sv-SE'); 
      const opDate = String(trip.operation_date).replace(/\//g, '-');
      if (!opDate.includes(todayStr)) return acc;

      // 3. 路線と停留所マスタの特定
      const routeMaster = routes.data?.find(r => String(r.id || r.route_id) === String(trip.route_id));
      const stopMaster = stops.data?.find(s => 
        String(s.id || s.stop_id) === String(curr.boarding_id) &&
        String(s.route_id) === String(trip.route_id)
      );

      const routeName = routeMaster?.route_name || "不明な路線";
      let rawTime = "時刻未設定";

      // 4. 【重要】時間帯によって参照カラムを切り替える (17:41判定)
      if (stopMaster) {
        const baseTimeStr = trip.departure_time || stopMaster.stop_time || "00:00";
        const [h, m] = baseTimeStr.split(':').map(Number);
        const totalMinutes = h * 60 + m;

        if (totalMinutes >= 360 && totalMinutes < 660) {
          rawTime = stopMaster.stop_time;    // 6:00 〜 10:59
        } else if (totalMinutes >= 660 && totalMinutes < 840) {
          rawTime = stopMaster.stop_time_2;  // 11:00 〜 13:59
        } else if (totalMinutes >= 840 && totalMinutes <= 1061) {
          rawTime = stopMaster.stop_time_3;  // 14:00 〜 17:41
        } else if (totalMinutes > 1061) {
          rawTime = stopMaster.stop_time_4;  // 17:41より後
        } else {
          rawTime = stopMaster.stop_time;
        }
      }

      // 5. 秒数をカット (HH:mm 形式)
      const boardingTime = rawTime && rawTime.includes(':') ? rawTime.substring(0, 5) : "時刻未設定";
      
      const key = `${routeName}-${boardingTime}`;

      // 6. 集計
      if (!acc[key]) {
        acc[key] = { 
          id: key, 
          route: routeName, 
          time: boardingTime, 
          reserved: 0, 
          capacity: trip.capacity ?? 10
        };
      }
      acc[key].reserved += 1;
      return acc;
    }, {});

    // --- ここから追加 ---
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const filtered = Object.values(grouped).filter((item: any) => {
      if (item.time === "時刻未設定") return false;
      const [h, m] = item.time.split(':').map(Number);
      const busTotalMinutes = h * 60 + m;
      
      // 2時間前から出発までのみ表示
      return currentTotalMinutes >= (busTotalMinutes - 120) && currentTotalMinutes <= busTotalMinutes;
    });

    setDepartures(filtered as Departure[]);
    // --- ここまで追加 ---

  } catch (error) {
    console.error("運行情報の取得に失敗しました:", error);
  } finally {
    setLoading(false);
  }
}
    fetchDepartures();
  }, []);

  const handlePrintPassengerList = (departureId: string) => {
    console.log(`乗車客リストPDF出力準備中: ${departureId}`);
    alert("PDF出力機能は準備中です");
  };

  if (loading) return <div className="p-8 text-center">運行情報を確認中...</div>;

  return (
    <div>
      <h2 className="mb-6 text-xl sm:text-3xl">まもなく出発する便</h2>
      
      <div className="border-4 border-black rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base sm:text-lg min-w-[600px]">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">路線名</th>
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">乗車時間</th>
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">予約/定員</th>
                <th className="py-3 sm:py-4 px-3 sm:px-6">乗客リスト</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {departures.length > 0 ? (
                departures.map((departure) => (
                  <tr key={departure.id} className="border-t-4 border-black">
                    <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                      {departure.route}
                    </td>
                    <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                      <span className="text-blue-400">{departure.time}</span> 発
                    </td>
                    <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                      <span className={departure.reserved >= departure.capacity ? 'text-red-600 font-bold' : 'text-cyan-600'}>
                        {departure.reserved}
                      </span>
                      {' / '}{departure.capacity} 人
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                      <button
                        className="text-red-600 hover:text-red-800 cursor-pointer underline font-bold"
                        onClick={() => handlePrintPassengerList(departure.id)}
                      >
                        印刷
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t-4 border-black">
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    本日の出発予定便はありません。
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