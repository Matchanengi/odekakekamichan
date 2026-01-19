import { useState, useEffect, useMemo } from "react";
import { X, Search, ArrowRightLeft, MessageSquare, AlertCircle } from "lucide-react";
import { supabase } from "./supabaseClient";

interface ReservationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  reservation: any;
}

interface UserInfo {
  id: string;
  name: string;
  telephone_number: string;
  email: string;
}

interface StopData {
  stop_id: number;
  stop_name: string;
  route_stop_id: number;
  direction: number | null;
  stop_times: (string | null)[];
}

export function ReservationEditModal({ isOpen, onClose, onUpdate, reservation }: ReservationEditModalProps) {
  // --- States ---
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [boardingLocation, setBoardingLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [historyMemo, setHistoryMemo] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<number>(0);
  const [allTripsOnDate, setAllTripsOnDate] = useState<any[]>([]);
  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [stops, setStops] = useState<StopData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- 1. 初期化・データ取得 ---
  useEffect(() => {
    if (!isOpen || !reservation) {
      setIsDataLoaded(false);
      return;
    }

    let ignore = false;
    const targetDate = reservation.operation_date || reservation.便?.operation_date;
    const routeId = reservation.route_id || reservation.便?.route_id;

    async function loadData() {
      try {
        // データの並列取得
        const [tripRes, stopRes, userRes] = await Promise.all([
          supabase.from("便").select(`trip_id, route_id, operation_date, departure_time, bus_route:route_id ( route_name )`).eq("operation_date", targetDate).eq("route_id", routeId).order('departure_time', { ascending: true }),
          supabase.from("路線停留所").select(`route_stop_id, route_id, stop_id, stop_time, stop_time_2, stop_time_3, stop_time_4, direction, 停留所:stop_id ( stop_id, stop_name )`).eq("route_id", routeId).order('route_stop_id', { ascending: true }),
          reservation.user_id ? supabase.from("ユーザ").select("*").eq("id", reservation.user_id).single() : Promise.resolve({ data: null })
        ]);

        if (ignore) return;

        if (stopRes.data) {
          const formattedStops = stopRes.data.map((rs: any) => ({
            stop_id: rs.stop_id,
            stop_name: rs.停留所?.stop_name,
            route_stop_id: rs.route_stop_id,
            direction: rs.direction,
            stop_times: [rs.stop_time, rs.stop_time_2, rs.stop_time_3, rs.stop_time_4]
          }));

          setStops(formattedStops);
          setAllTripsOnDate(tripRes.data || []);
          if (userRes.data) setUserInfo(userRes.data);

          // --- DBから取得した値をそのまま反映（推測ロジックを廃止） ---
          // reservation.direction が追加されていることが前提
          setSelectedDirection(reservation.direction ?? 0);
          setBoardingLocation(reservation.boarding_id?.toString() || "");
          setDropoffLocation(reservation.alighting_id?.toString() || "");
          setSelectedTripId(reservation.trip_id?.toString() || "");
          setAdults(reservation.adult_count ?? 0);
          setChildren(reservation.child_count ?? 0);
          setHistoryMemo(reservation.notes || "");

          setIsDataLoaded(true);
        }
      } catch (e) {
        setErrorMsg("データの読み込みに失敗しました。");
      }
    }

    loadData();
    return () => { ignore = true; };
  }, [isOpen, reservation]);

  // --- 2. フィルタリングロジック ---
  
  // 選択中の方向に合わせた停留所リスト
  const filteredStops = useMemo(() => {
    return stops.filter(s => s.direction === selectedDirection);
  }, [stops, selectedDirection]);

  // 選択条件に合う便リストの抽出
  useEffect(() => {
    if (!isDataLoaded || stops.length === 0) return;

    const bStop = filteredStops.find(s => s.stop_id.toString() === boardingLocation);
    const dStop = filteredStops.find(s => s.stop_id.toString() === dropoffLocation);

    const filtered = allTripsOnDate.filter(trip => {
      // 便の時刻がどの時間枠(1~4)に該当するか探す
      const tripTimeShort = trip.departure_time?.substring(0, 5);
      const timeIdx = stops.find(s => s.stop_times.some(t => t?.substring(0, 5) === tripTimeShort))
                      ?.stop_times.findIndex(t => t?.substring(0, 5) === tripTimeShort) ?? -1;

      if (timeIdx === -1) return false;
      
      // 方向の整合性チェック
      const directionMatch = stops.some(s => s.direction === selectedDirection && s.stop_times[timeIdx] !== null);
      if (!directionMatch) return false;

      // 乗車・降車の順序チェック
      if (bStop && dStop) {
        const hasBothTimes = bStop.stop_times[timeIdx] !== null && dStop.stop_times[timeIdx] !== null;
        const isCorrectOrder = bStop.route_stop_id < dStop.route_stop_id;
        return hasBothTimes && isCorrectOrder;
      }
      return true;
    });

    setAvailableTrips(filtered);
  }, [boardingLocation, dropoffLocation, selectedDirection, filteredStops, allTripsOnDate, stops, isDataLoaded]);

  // バリデーション
  const validationError = useMemo(() => {
    if (!isDataLoaded || !boardingLocation || !dropoffLocation) return null;
    if (boardingLocation === dropoffLocation) return "乗降場所に同じ場所は指定できません。";
    
    const b = filteredStops.find(s => s.stop_id.toString() === boardingLocation);
    const d = filteredStops.find(s => s.stop_id.toString() === dropoffLocation);
    
    if (b && d && b.route_stop_id >= d.route_stop_id) {
      return "進行方向が正しくありません。上り/下りの選択を確認してください。";
    }
    return null;
  }, [boardingLocation, dropoffLocation, filteredStops, isDataLoaded]);

  // --- 3. 保存ハンドラー ---
  const handleSave = async () => {
    if (validationError || !selectedTripId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("予約").update({
        trip_id: parseInt(selectedTripId),
        boarding_id: parseInt(boardingLocation),
        alighting_id: parseInt(dropoffLocation),
        direction: selectedDirection, // 追加したカラムへの保存
        adult_count: adults,
        child_count: children,
        reserved_count: adults + children,
        notes: historyMemo,
      }).eq("reservation_id", reservation.reservation_id);

      if (error) throw error;
      alert("予約内容を更新しました。");
      onUpdate();
      onClose();
    } catch (e) {
      setErrorMsg("保存中にエラーが発生しました。");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-bold text-black">
      <div className="bg-green-700 rounded-3xl p-4 sm:p-6 w-full max-w-[900px] shadow-2xl overflow-hidden">
        <div className="bg-white rounded-2xl p-6 relative max-h-[85vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
            <X size={28} />
          </button>

          <h2 className="text-xl mb-4 border-b pb-2 text-green-800">予約内容の編集</h2>
          
          {isDataLoaded && (errorMsg || validationError) && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border-2 border-red-200 flex items-center gap-2 text-sm">
              <AlertCircle size={20} /><span>{errorMsg || validationError}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* 1. 方向選択 */}
            <section>
              <h3 className="text-sm mb-3 text-gray-700">1. 運行方向を選択</h3>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => { setSelectedDirection(0); setBoardingLocation(""); setDropoffLocation(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${selectedDirection === 0 ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}
                >上り</button>
                <button 
                  onClick={() => { setSelectedDirection(1); setBoardingLocation(""); setDropoffLocation(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${selectedDirection === 1 ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}
                >下り</button>
              </div>
            </section>

            {/* 2. 乗降場所 */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-blue-800 text-sm"><ArrowRightLeft size={18} /> 2. 乗降場所を選択</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">乗車場所</label>
                  <select value={boardingLocation} onChange={(e) => setBoardingLocation(e.target.value)} className="w-full border-2 border-black rounded-lg p-2 bg-white text-sm">
                    <option value="">選択してください</option>
                    {filteredStops.map((s) => (
                      <option key={`b-${s.route_stop_id}`} value={s.stop_id}>{s.stop_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">降車場所</label>
                  <select value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} className="w-full border-2 border-black rounded-lg p-2 bg-white text-sm">
                    <option value="">選択してください</option>
                    {filteredStops.map((s) => (
                      <option key={`d-${s.route_stop_id}`} value={s.stop_id}>{s.stop_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 3. 便選択 */}
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-green-800 text-sm"><Search size={18} /> 3. 運行便（時間）を選択</h3>
              <div className="p-3 rounded-xl bg-gray-50 border-dashed border-2 border-gray-300">
                <select 
                  value={selectedTripId} 
                  onChange={(e) => setSelectedTripId(e.target.value)} 
                  className="w-full border-2 border-black rounded-lg p-3 bg-white text-base font-bold outline-none"
                  disabled={!isDataLoaded || availableTrips.length === 0}
                >
                  <option value="">{availableTrips.length === 0 ? "該当する便がありません" : "-- 便を選択 --"}</option>
                  {availableTrips.map((trip) => (
                    <option key={trip.trip_id} value={trip.trip_id}>
                      {trip.departure_time?.substring(0, 5)}発 ({trip.bus_route?.route_name})
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* 4. 人数 */}
            <section className="border-t pt-4">
              <h3 className="mb-3 text-gray-700 text-sm">4. 人数設定</h3>
              <div className="flex flex-wrap gap-6 items-center bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm">おとな</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setAdults(Math.max(0, adults-1))} className="w-10 h-10 bg-white border-2 border-black rounded-lg">-</button>
                    <span className="w-8 text-center text-xl">{adults}</span>
                    <button type="button" onClick={() => setAdults(adults+1)} className="w-10 h-10 bg-white border-2 border-black rounded-lg">+</button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">こども</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setChildren(Math.max(0, children-1))} className="w-10 h-10 bg-white border-2 border-black rounded-lg">-</button>
                    <span className="w-8 text-center text-xl">{children}</span>
                    <button type="button" onClick={() => setChildren(children+1)} className="w-10 h-10 bg-white border-2 border-black rounded-lg">+</button>
                  </div>
                </div>
                <div className="ml-auto font-bold text-green-800 text-xl">合計 {adults + children} 名</div>
              </div>
            </section>

            {/* 5. 備考 */}
            <section className="border-t pt-4">
              <h3 className="flex items-center gap-2 mb-3 text-gray-700 text-sm"><MessageSquare size={18} /> 備考・特記事項</h3>
              <textarea
                value={historyMemo}
                onChange={(e) => setHistoryMemo(e.target.value)}
                placeholder="連絡事項などがあれば入力してください"
                className="w-full border-2 border-black rounded-lg p-3 h-24 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </section>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={!isDataLoaded || isSaving || !!validationError || !selectedTripId}
              className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold text-xl hover:bg-green-800 disabled:bg-gray-300 shadow-lg transition-all"
            >
              {isSaving ? "保存中..." : "変更を確定する"}
            </button>
            <button onClick={onClose} className="w-full py-2 text-gray-500 text-sm">キャンセル</button>
          </div>
        </div>
      </div>
    </div>
  );
}