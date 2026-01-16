import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient"; // パスはご自身の環境に合わせてください
import { ReservationDetailModal } from "./ReservationDetailModal";
import { ReservationEditModal } from "./ReservationEditModal";

type MainPage = "top" | "reservations" | "new-reservation" | "notifications" | "member";

interface ReservationManagementPageProps {
  onNavigate: (page: MainPage) => void;
}

export function ReservationManagementPage({ onNavigate }: ReservationManagementPageProps) {
  // --- 状態管理 ---
  
  const [loading, setLoading] = useState(true);
  const [allReservations, setAllReservations] = useState<any[]>([]); // 元データ
  const [displayReservations, setDisplayReservations] = useState<any[]>([]); // 表示用データ
  
    // YYYY-MM-DD 形式で今日の日付を取得
  const today = new Date().toLocaleDateString('sv-SE');

  const [startDate, setStartDate] = useState(today); // 初期値を今日に
  const [endDate, setEndDate] = useState(today);     // 初期値を今日に
  const [route, setRoute] = useState("すべての路線");
  const [status, setStatus] = useState("すべて");
  
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [editReservation, setEditReservation] = useState<any | null>(null);

  // --- データ取得関数 ---
async function fetchReservations() {
  try {
    setLoading(true);

    const [res, trips, users, routes] = await Promise.all([
      supabase.from('予約').select('*').order('reservation_id', { ascending: false }),
      supabase.from('便').select('trip_id, operation_date, route_id'),
      supabase.from('ユーザ').select('id, name'),
      supabase.from('バス路線').select('route_id, route_name')
    ]);

    if (res.error) throw res.error;

    const joinedData = (res.data || []).map((reservation: any) => {
      const trip = trips.data?.find(t => String(t.trip_id) === String(reservation.trip_id));
      const user = users.data?.find(u => String(u.id) === String(reservation.user_id));
      const routeInfo = routes.data?.find(r => String(r.route_id) === String(trip?.route_id));

      return {
        ...reservation,
        id: reservation.reservation_id,
        // reserved_count を使用
        displayCount: reservation.reserved_count || 0,
        便: trip || { operation_date: "不明", route_id: "-" },
        利用者: { name: user?.name || `ID: ${reservation.user_id}` },
        routeName: routeInfo ? routeInfo.route_name : "不明"
      };
    });

    setAllReservations(joinedData);

    // 紐付け後の joinedData を日付順にソートするコード
    const sortedData = joinedData.sort((a, b) => {
      const dateA = a.便?.operation_date || "";
      const dateB = b.便?.operation_date || "";
      return dateA.localeCompare(dateB); // 文字列として昇順比較
    });

    setAllReservations(sortedData);

    // 初期表示：今日 & (active or cancel)
    const today = new Date().toLocaleDateString('sv-SE');
    const initialDisplay = joinedData.filter(res => {
      const opDate = res.便?.operation_date?.replace(/\//g, '-');
      return opDate === today && (res.status === "active" || res.status === "cancel");
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

  // --- 検索・絞り込みロジック ---
const handleSearch = () => {
  let filtered = allReservations;

  // 1. 日付範囲
  if (startDate || endDate) {
    filtered = filtered.filter(res => {
      const opDate = res.便?.operation_date?.replace(/\//g, '-');
      if (!opDate) return false;
      return (!startDate || opDate >= startDate) && (!endDate || opDate <= endDate);
    });
  }

  // 2. ステータス (active / cancel / all)
  if (status === "all") {
    filtered = filtered.filter(res => res.status === "active" || res.status === "cancel");
  } else {
    filtered = filtered.filter(res => res.status === status);
  }

  // 3. 路線名
  if (route !== "すべての路線") {
    filtered = filtered.filter(res => res.routeName === route);
  }

  setDisplayReservations(filtered);
};

    const handleReset = () => {
      // 1. 今日の日付を取得 (YYYY-MM-DD形式)
      const today = new Date().toLocaleDateString('sv-SE');

      // 2. 入力項目の状態（State）を初期値に戻す
      setStartDate(today);
      setEndDate(today);
      setStatus("all");
      setRoute("すべての路線");

      // 3. 表示データを「今日」かつ「確定・キャンセル」で絞り込む
      const initialDisplay = allReservations.filter(res => {
        const opDate = res.便?.operation_date?.replace(/\//g, '-');
        const isToday = opDate === today;
        const isTargetStatus = res.status === "active" || res.status === "cancel";
        return isToday && isTargetStatus;
      });

      setDisplayReservations(initialDisplay);
    };  

  return (
    <div className="bg-green-700 rounded-3xl p-3 sm:p-8">
      <div className="bg-white rounded-3xl p-3 sm:p-8">
        <div className="flex flex-col md:flex-row">
          {/* Left Sidebar */}
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

          {/* Main Content */}
          <div className="flex-1 max-h-[600px] overflow-y-auto">
            <h2 className="text-2xl sm:text-3xl mb-4 sm:mb-6 font-bold">予約管理</h2>

            {/* Search Section */}
            <div className="mb-6 sm:mb-8 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
              <h3 className="text-lg mb-3">・検索絞り込み</h3>
              <div className="space-y-4">
                {/* Date Range Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                  <input
                    type="date" // text から date に変更
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-4 border-black rounded-lg px-3 sm:px-4 py-2 w-full sm:w-64 text-sm sm:text-base cursor-pointer"
                  />
                  <span className="text-center sm:text-left font-bold">～</span>
                  <input
                    type="date" // text から date に変更
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-4 border-black rounded-lg px-3 sm:px-4 py-2 w-full sm:w-64 text-sm sm:text-base cursor-pointer"
                  />
                </div>

                {/* Status & Search Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <span className="bg-green-700 text-white px-4 py-2 rounded-lg w-full sm:w-32 text-center">状態</span>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    className="border-4 border-black rounded-lg px-3 py-2 flex-1"
                  >
                    {/* 見た目は日本語、プログラムに渡す値は英語にする */}
                    <option value="all">すべて（確定・キャンセル）</option>
                    <option value="active">確定</option>
                    <option value="cancel">キャンセル</option>
                  </select>
                  <button onClick={handleSearch} className="bg-green-700 text-white px-8 py-2 rounded-lg hover:opacity-90 transition-opacity">検索実行</button>
                  <button onClick={handleReset} // ★ここを handleReset に変更
                    className="bg-white border-2 border-black px-6 sm:px-8 py-2 rounded-lg flex-1 sm:flex-none text-sm sm:text-base font-bold hover:bg-gray-100">
                    リセット</button>
                </div>
              </div>
            </div>

            {/* Reservations List */}
            {loading ? (
              <div className="text-center py-10">読み込み中...</div>
            ) : (
              <div className="border-4 border-black rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-green-700 text-white">
                      <tr>
                        <th className="py-4 px-4 border-r-4 border-black">ステータス</th>
                        <th className="py-4 px-4 border-r-4 border-black">乗車日</th>
                        <th className="py-4 px-4 border-r-4 border-black">路線</th>
                        <th className="py-4 px-4 border-r-4 border-black">予約者</th>
                        <th className="py-4 px-4 border-r-4 border-black">人数</th>
                        <th className="py-4 px-4">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {displayReservations.map((reservation) => (
                         <tr key={reservation.id} className="border-t-4 border-black hover:bg-gray-50">
                          {/* ステータス列（前回の修正通り） */}
                          <td className={`py-4 px-4 text-center border-r-4 border-black font-bold ${
                            reservation.status === "active" ? "text-green-600" : "text-red-600"
                          }`}>
                            {reservation.status === "active" ? "確定" : "キャンセル"}
                          </td>

                          {/* 運行日 */}
                          <td className="py-4 px-4 text-center border-r-4 border-black">
                            {reservation.便?.operation_date || "不明"}
                          </td>

                          {/* 路線名 */}
                          <td className="py-4 px-4 text-center border-r-4 border-black font-bold">
                            {reservation.routeName}
                          </td>

                          {/* 利用者名 */}
                          <td className="py-4 px-4 text-center border-r-4 border-black">
                            {reservation.利用者?.name}様
                          </td>

                          {/* 人数（reserved_count） */}
                          <td className="py-4 px-4 text-center border-r-4 border-black text-cyan-600 font-bold">
                            {reservation.displayCount}名
                          </td>

                          {/* 操作ボタン */}
                          <td className="py-4 px-4 text-center">
                            <button onClick={() => setSelectedReservation(reservation)} className="text-blue-500 mr-4 font-bold">詳細</button>
                            <button onClick={() => setEditReservation(reservation)} className="text-red-600 font-bold">編集</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* モダル類 */}
      {selectedReservation && (
        <ReservationDetailModal
          isOpen={!!selectedReservation}
          onClose={() => setSelectedReservation(null)}
          reservation={selectedReservation}
        />
      )}
      {editReservation && (
        <ReservationEditModal
          isOpen={!!editReservation}
          onClose={() => setEditReservation(null)}
          reservation={editReservation}
        />
      )}
    </div>
  );
}