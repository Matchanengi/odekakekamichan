import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { ReservationDetailModal } from "./ReservationDetailModal";
import { ReservationEditModal } from "./ReservationEditModal";

// ページ遷移先の型定義
type MainPage = "top" | "reservations" | "new-reservation" | "notifications" | "member";

interface ReservationManagementPageProps {
  onNavigate: (page: MainPage) => void; // ページ切り替え用関数
}

export function ReservationManagementPage({ onNavigate }: ReservationManagementPageProps) {
  // --- 状態管理 (State) ---
  const [loading, setLoading] = useState(true); // 読み込み中フラグ
  const [allReservations, setAllReservations] = useState<any[]>([]); // DBから取得した全データ（加工済み）
  const [displayReservations, setDisplayReservations] = useState<any[]>([]); // 画面に表示する（フィルタ後の）データ
  
  const today = new Date().toLocaleDateString('sv-SE'); // 今日の日付 (YYYY-MM-DD)
  const [startDate, setStartDate] = useState(today); // 検索開始日
  const [endDate, setEndDate] = useState(today); // 検索終了日
  const [status, setStatus] = useState("all"); // フィルタステータス（確定/キャンセル/すべて）
  
  // モーダル制御用
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [editReservation, setEditReservation] = useState<any | null>(null);

  /**
   * データの取得と加工を行うメイン関数
   */
  async function fetchReservations() {
    try {
      setLoading(true);
      
      // 1. 複数のテーブルから必要なマスターデータを並列で取得（高速化のため Promise.all を使用）
      const [res, trips, users, routesData, stopTimes] = await Promise.all([
        supabase.from('予約').select('*').order('reservation_id', { ascending: false }),
        supabase.from('便').select('trip_id, operation_date, route_id, departure_time'),
        supabase.from('ユーザ').select('id, name'),
        supabase.from('バス路線').select('route_id, route_name'),
        supabase.from('路線停留所').select('route_id, stop_id, stop_time, stop_time_2, stop_time_3, stop_time_4')
      ]);

      if (res.error) throw res.error;

      // 2. データの結合 (JOIN) と詳細な時間計算
      const joinedData = (res.data || []).map((reservation: any) => {
        // IDを元に対応するマスターデータを紐付け
        const trip = trips.data?.find(t => String(t.trip_id) === String(reservation.trip_id));
        const user = users.data?.find(u => String(u.id) === String(reservation.user_id));
        const routeInfo = routesData.data?.find(r => String(r.route_id) === String(trip?.route_id));
        
        // --- 乗車時刻(actual_time)の算出ロジック ---
        // 便の出発時間帯に応じて、停留所ごとの通過時刻（1便〜4便用）を使い分ける
        let actualTime = "00:00";
        if (trip?.departure_time && trip?.route_id) {
          const st = stopTimes.data?.find(s => 
            String(s.route_id) === String(trip.route_id) && 
            String(s.stop_id) === String(reservation.boarding_id)
          );

          if (st) {
            const [hour, minute] = trip.departure_time.split(":").map(Number);
            const totalMin = hour * 60 + minute;

            // 時間帯の判定ロジック
            if (totalMin >= 360 && totalMin < 660) actualTime = st.stop_time;        // 朝
            else if (totalMin >= 660 && totalMin < 840) actualTime = st.stop_time_2; // 昼前
            else if (totalMin >= 840 && totalMin < 1062) actualTime = st.stop_time_3;// 昼後
            else actualTime = st.stop_time_4;                                       // 夕方
          } else {
            actualTime = trip.departure_time; // 停留所データがない場合は便の時間を採用
          }
        }

        // 加工したデータを一つのオブジェクトにまとめる
        return {
          ...reservation,
          id: reservation.reservation_id,
          便: trip || { operation_date: "9999/12/31", departure_time: "00:00" },
          利用者: { name: user ? user.name : `不明 (ID: ${reservation.user_id})` },
          routeName: routeInfo ? routeInfo.route_name : "不明",
          displayCount: reservation.reserved_count || 0,
          actual_time: actualTime || "00:00" // ソートと表示に使用
        };
      });

      // 3. 精密ソート: 「運行日付」順にした後、同じ日なら「乗車時刻」順に並べる
      const sortedData = joinedData.sort((a, b) => {
        const dateCompare = (a.便?.operation_date || "").localeCompare(b.便?.operation_date || "");
        if (dateCompare === 0) {
          return (a.actual_time || "00:00").localeCompare(b.actual_time || "00:00");
        }
        return dateCompare;
      });

      setAllReservations(sortedData);

      // 4. 初回表示：今日の日付の予約のみを抽出してセット
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

  // コンポーネント起動時に一度だけ実行
  useEffect(() => {
    fetchReservations();
  }, []);

  /**
   * 検索実行ボタン：日付範囲とステータスでフィルタリング
   */
  const handleSearch = () => {
    let filtered = allReservations;
    if (startDate || endDate) {
      filtered = filtered.filter(res => {
        const opDate = res.便?.operation_date?.replace(/\//g, '-');
        if (!opDate) return false;
        return (!startDate || opDate >= startDate) && (!endDate || opDate <= endDate);
      });
    }

    // ステータスフィルタ
    if (status === "all") {
      filtered = filtered.filter(res => res.status === "active" || res.status === "cancelled");
    } else {
      filtered = filtered.filter(res => res.status === status);
    }

    setDisplayReservations(filtered);
  };

  /**
   * リセットボタン：条件をクリアして「今日」のデータに戻す
   */
  const handleReset = () => {
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
          
          {/* 左サイドバー：メニューボタン */}
          <aside className="w-full md:w-64 md:pr-8 mb-4 md:mb-0">
            <div className="space-y-4 flex flex-row md:flex-col gap-2 md:gap-0">
              <button onClick={() => onNavigate("reservations")} className="w-full bg-white text-black py-4 md:py-6 rounded-2xl border-4 border-green-700 text-center font-bold">
                予約管理
              </button>
              <button onClick={() => onNavigate("new-reservation")} className="w-full bg-green-700 text-white py-4 md:py-6 rounded-2xl border-4 border-white text-center font-bold">
                新規予約登録
              </button>
            </div>
          </aside>

          {/* メインエリア：検索フォームとテーブル */}
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl mb-4 font-bold">予約管理</h2>

            {/* 検索・絞り込みフォーム */}
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
                  <button onClick={handleSearch} className="bg-green-700 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-800 transition-colors">検索実行</button>
                  <button onClick={handleReset} className="border-2 border-black px-8 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors">リセット</button>
                </div>
              </div>
            </div>

            {/* 一覧テーブルエリア */}
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
                          <button onClick={() => { setSelectedReservation(reservation); setIsModalOpen(true); }} className="text-blue-600 underline font-bold hover:text-blue-800">詳細</button>
                          {reservation.status === "active" && (
                            <button onClick={() => setEditReservation(reservation)} className="text-red-600 underline font-bold hover:text-red-800">編集</button>
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

      {/* --- 各種モーダル --- */}
      {/* 詳細確認モーダル */}
      <ReservationDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        reservation={selectedReservation} 
        onUpdate={fetchReservations} 
      />
      
      {/* 編集モーダル：更新完了時にリストを再取得するコールバック(onUpdate)を設定 */}
      {editReservation && (
        <ReservationEditModal
          isOpen={!!editReservation}
          onClose={() => setEditReservation(null)}
          reservation={editReservation}
          onUpdate={() => {
            fetchReservations(); // データを最新に更新
            setEditReservation(null); // モーダルを閉じる
          }}
        />
      )}
    </div>
  );
}