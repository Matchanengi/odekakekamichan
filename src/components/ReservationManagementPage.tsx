import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { ReservationDetailModal } from "./ReservationDetailModal";
import { ReservationEditModal } from "./ReservationEditModal";

type MainPage = "top" | "reservations" | "new-reservation" | "notifications" | "member";

interface ReservationManagementPageProps {
  onNavigate: (page: MainPage) => void;
}

export function ReservationManagementPage({ onNavigate }: ReservationManagementPageProps) {
  const [loading, setLoading] = useState(true);
  const [allReservations, setAllReservations] = useState<any[]>([]); 
  const [displayReservations, setDisplayReservations] = useState<any[]>([]);
  
  const today = new Date().toLocaleDateString('sv-SE');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [status, setStatus] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [editReservation, setEditReservation] = useState<any | null>(null);

  async function fetchReservations() {
    try {
      setLoading(true);
      
      // 必要なマスターデータをすべて取得
      const [res, trips, users, routesData, stopTimes] = await Promise.all([
        supabase.from('予約').select('*').order('reservation_id', { ascending: false }),
        supabase.from('便').select('trip_id, operation_date, route_id, departure_time'),
        supabase.from('ユーザ').select('id, name'),
        supabase.from('バス路線').select('route_id, route_name'),
        supabase.from('路線停留所').select('route_id, stop_id, stop_time, stop_time_2, stop_time_3, stop_time_4')
      ]);

      if (res.error) throw res.error;

      // データ結合と時間計算
      const joinedData = (res.data || []).map((reservation: any) => {
        const trip = trips.data?.find(t => String(t.trip_id) === String(reservation.trip_id));
        const user = users.data?.find(u => String(u.id) === String(reservation.user_id));
        const routeInfo = routesData.data?.find(r => String(r.route_id) === String(trip?.route_id));
        
        // --- 乗車時刻(actual_time)の算出ロジック ---
        let actualTime = "00:00";
        if (trip?.departure_time && trip?.route_id) {
          const st = stopTimes.data?.find(s => 
            String(s.route_id) === String(trip.route_id) && 
            String(s.stop_id) === String(reservation.boarding_id)
          );

          if (st) {
            const hour = parseInt(trip.departure_time.split(":")[0], 10);
            const minute = parseInt(trip.departure_time.split(":")[1], 10);
            const totalMin = hour * 60 + minute;

            if (totalMin >= 360 && totalMin < 660) actualTime = st.stop_time;
            else if (totalMin >= 660 && totalMin < 840) actualTime = st.stop_time_2;
            else if (totalMin >= 840 && totalMin < 1062) actualTime = st.stop_time_3;
            else actualTime = st.stop_time_4;
          } else {
            actualTime = trip.departure_time; // 停留所時刻がない場合は便の出発時間
          }
        }

        return {
          ...reservation,
          id: reservation.reservation_id,
          便: trip || { operation_date: "9999/12/31", departure_time: "00:00" },
          利用者: { name: user ? user.name : `不明 (ID: ${reservation.user_id})` },
          routeName: routeInfo ? routeInfo.route_name : "不明",
          displayCount: reservation.reserved_count || 0,
          actual_time: actualTime || "00:00" // ソート用
        };
      });

      // 精密ソート: 日付(昇順) -> 時刻(昇順)
      const sortedData = joinedData.sort((a, b) => {
        const dateA = a.便?.operation_date || "";
        const dateB = b.便?.operation_date || "";
        const dateCompare = dateA.localeCompare(dateB);

        if (dateCompare === 0) {
          return (a.actual_time || "00:00").localeCompare(b.actual_time || "00:00");
        }
        return dateCompare;
      });

      setAllReservations(sortedData);

      // 初回表示（今日の日付でフィルタ）
      const todayStr = new Date().toLocaleDateString('sv-SE');
      const initialDisplay = sortedData.filter(res => {
        const opDate = res.便?.operation_date?.replace(/\//g, '-');
        return opDate === todayStr && (res.status === "active" || res.status === "cancelled");
      });
      setDisplayReservations(initialDisplay);

    } catch (error) {
      console.error("データ取得失敗:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSearch = () => {
    let filtered = allReservations;
    if (startDate || endDate) {
      filtered = filtered.filter(res => {
        const opDate = res.便?.operation_date?.replace(/\//g, '-');
        if (!opDate) return false;
        return (!startDate || opDate >= startDate) && (!endDate || opDate <= endDate);
      });
    }

    if (status === "all") {
      filtered = filtered.filter(res => res.status === "active" || res.status === "cancelled");
    } else {
      filtered = filtered.filter(res => res.status === status);
    }

    setDisplayReservations(filtered);
  };

  const handleReset = () => {
    const today = new Date().toLocaleDateString('sv-SE');
    setStartDate(today);
    setEndDate(today);
    setStatus("all");
    const initial = allReservations.filter(res => {
        const opDate = res.便?.operation_date?.replace(/\//g, '-');
        return opDate === today && (res.status === "active" || res.status === "cancelled");
    });
    setDisplayReservations(initial);
  };

  return (
    <div className="bg-green-700 rounded-3xl p-3 sm:p-8">
      <div className="bg-white rounded-3xl p-3 sm:p-8">
        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-64 md:pr-8 mb-4 md:mb-0">
            <div className="space-y-4 flex flex-row md:flex-col gap-2 md:gap-0">
              <button onClick={() => onNavigate("reservations")} className="w-full bg-white text-black py-4 md:py-6 rounded-2xl border-4 border-green-700 text-center">
                予約管理
              </button>
              <button onClick={() => onNavigate("new-reservation")} className="w-full bg-green-700 text-white py-4 md:py-6 rounded-2xl border-4 border-white text-center">
                新規予約登録
              </button>
            </div>
          </aside>

          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl mb-4 font-bold">予約管理</h2>

            {/* 検索セクション */}
            <div className="mb-6 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-2 border-black rounded-lg px-4 py-2 w-full sm:w-auto font-bold"/>
                  <span className="font-bold">～</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-2 border-black rounded-lg px-4 py-2 w-full sm:w-auto font-bold"/>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="border-2 border-black rounded-lg px-3 py-2 flex-1 font-bold">
                    <option value="all">すべて（確定・キャンセル）</option>
                    <option value="active">確定</option>
                    <option value="cancelled">キャンセル</option>
                  </select>
                  <button onClick={handleSearch} className="bg-green-700 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-800">検索実行</button>
                  <button onClick={handleReset} className="border-2 border-black px-8 py-2 rounded-lg font-bold hover:bg-gray-100">リセット</button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 font-bold">読み込み中...</div>
            ) : (
              <div className="border-4 border-black rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse">
                  <thead className="bg-green-700 text-white">
                    <tr className="border-b-2 border-black">
                      <th className="py-4 px-4 border-r-2 border-black">ステータス</th>
                      <th className="py-4 px-4 border-r-2 border-black">乗車時刻</th>
                      <th className="py-4 px-4 border-r-2 border-black">路線</th>
                      <th className="py-4 px-4 border-r-2 border-black">予約者</th>
                      <th className="py-4 px-4 border-r-2 border-black">人数</th>
                      <th className="py-4 px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {displayReservations.map((reservation) => (
                      <tr key={reservation.id} className={`border-t-2 border-black hover:bg-gray-50 text-center ${reservation.status === 'cancelled' ? 'bg-gray-100' : ''}`}>
                        <td className={`py-4 px-4 font-bold border-r-2 border-black ${reservation.status === "active" ? "text-green-600" : "text-red-600"}`}>
                          {reservation.status === "active" ? "確定" : "キャンセル済み"}
                        </td>
                        <td className="py-4 px-4 border-r-2 border-black">
                           <div className="font-bold">{reservation.便?.operation_date}</div>
                           <div className="text-sm text-green-700 font-bold">{reservation.actual_time}</div>
                        </td>
                        <td className="py-4 px-4 font-bold border-r-2 border-black">{reservation.routeName}</td>
                        <td className="py-4 px-4 border-r-2 border-black">{reservation.利用者?.name}様</td>
                        <td className="py-4 px-4 font-bold text-cyan-600 border-r-2 border-black">{reservation.displayCount}名</td>
                        <td className="py-4 px-4 space-x-3">
                          <button onClick={() => { setSelectedReservation(reservation); setIsModalOpen(true); }} className="text-blue-600 underline font-bold">詳細</button>
                          {reservation.status === "active" && (
                            <button onClick={() => setEditReservation(reservation)} className="text-red-600 underline font-bold">編集</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReservationDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} reservation={selectedReservation} onUpdate={fetchReservations} />
      {/* モダル類 */}
      {editReservation && (
        <ReservationEditModal
          isOpen={!!editReservation}
          onClose={() => setEditReservation(null)}
          reservation={editReservation}
          // ★ここを追加：更新が完了した時にデータを再取得する
          onUpdate={() => {
            fetchReservations(); // データを最新に更新
            setEditReservation(null); // モーダルを閉じる
          }}
        />
      )}
    </div>
  );
}