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
      const trip = trips.data.find(t => String(t.trip_id) === String(curr.trip_id));
      if (!trip) return acc;

      // 今日の日付に絞り込む
      const todayStr = new Date().toLocaleDateString('sv-SE'); 
      const opDate = String(trip.operation_date).replace(/\//g, '-');
      if (!opDate.includes(todayStr)) return acc;

      const routeMaster = routes.data?.find(r => String(r.id || r.route_id) === String(trip.route_id));
      const stopMaster = stops.data?.find(s => String(s.id || s.stop_id) === String(curr.boarding_id));

      const routeName = routeMaster?.route_name || "不明な路線";
      
      // --- 時刻から秒数をカットする処理 ---
      const rawTime = stopMaster?.stop_time || "時刻未設定";
      const boardingTime = rawTime.includes(':') ? rawTime.substring(0, 5) : rawTime;
      // --------------------------------
      
      const key = `${routeName}-${boardingTime}`;

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

    setDepartures(Object.values(grouped) as Departure[]);

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