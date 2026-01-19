import { useState, useEffect, useMemo } from "react";
import { X, Search, ArrowRightLeft, MessageSquare, AlertCircle, User, Phone } from "lucide-react";
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
  stop_times: (string | null)[]; // [stop_time, stop_time_2, stop_time_3, stop_time_4]
}

export function ReservationEditModal({ isOpen, onClose, onUpdate, reservation }: ReservationEditModalProps) {
  // --- States ---
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [boardingLocation, setBoardingLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [historyMemo, setHistoryMemo] = useState("");

  const [availableTrips, setAvailableTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [stops, setStops] = useState<StopData[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- 1. 初期値の同期 ---
  useEffect(() => {
    if (isOpen && reservation) {
      setAdults(reservation.adult_count ?? 0);
      setChildren(reservation.child_count ?? 0);
      setHistoryMemo(reservation.notes || "");
      setBoardingLocation(reservation.boarding_id?.toString() || "");
      setDropoffLocation(reservation.alighting_id?.toString() || "");
      setSelectedTripId(reservation.trip_id?.toString() || "");
      
      if (reservation.user_id) fetchUserInfo(reservation.user_id);
    }
  }, [isOpen, reservation]);

  // --- 2. データの取得 (便情報と停留所リスト) ---
  useEffect(() => {
    if (!isOpen || !reservation) return;

    let ignore = false;
    const targetDate = reservation.便?.operation_date || reservation.operation_date;
    const routeId = reservation.route_id || reservation.便?.route_id;

    async function loadData() {
      if (!targetDate || !routeId) return;
      try {
        setErrorMsg(null);
        
        // 便データの取得
        const { data: tripData, error: tripError } = await supabase
          .from("便")
          .select(`
            trip_id, route_id, operation_date, departure_time,
            bus_route:route_id ( route_name )
          `)
          .eq("operation_date", targetDate)
          .eq("route_id", routeId)
          .order('departure_time', { ascending: true });

        if (tripError) throw tripError;

        // 停留所データの取得（その路線の全停車駅と時刻カラムを取得）
        const { data: stopData, error: stopError } = await supabase
          .from("路線停留所")
          .select(`
            route_stop_id, route_id, stop_id, stop_time, stop_time_2, stop_time_3, stop_time_4, direction,
            停留所:stop_id ( stop_id, stop_name )
          `)
          .eq("route_id", routeId)
          .order('route_stop_id', { ascending: true });

        if (stopError) throw stopError;

        if (!ignore) {
          const formattedStops = (stopData || []).map((rs: any) => ({
            stop_id: rs.stop_id,
            stop_name: rs.停留所?.stop_name,
            route_stop_id: rs.route_stop_id,
            direction: rs.direction,
            stop_times: [rs.stop_time, rs.stop_time_2, rs.stop_time_3, rs.stop_time_4]
          }));
          
          setAvailableTrips(tripData || []);
          setStops(formattedStops);
        }
      } catch (e: any) {
        if (!ignore) setErrorMsg("データの取得に失敗しました。");
      }
    }
    loadData();
    return () => { ignore = true; };
  }, [isOpen, reservation]);

  // --- 3. ロジック関数 ---

  // 現在選択されている便オブジェクト
  const currentTrip = useMemo(() => 
    availableTrips.find(t => t.trip_id.toString() === selectedTripId),
  [selectedTripId, availableTrips]);

  // その便が 1~4 どの時刻カラム(stop_time系)を使用しているか判定
  const getTripTimeIndex = (trip: any): number => {
    if (!trip || stops.length === 0) return -1;
    const tripTimeShort = trip.departure_time?.substring(0, 5);
    for (const stop of stops) {
      const idx = stop.stop_times.findIndex(t => t && t.substring(0, 5) === tripTimeShort);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  // 便の選択肢ラベル（上り/下り判定含む）
  const getTripLabel = (trip: any) => {
    const timeIdx = getTripTimeIndex(trip);
    let directionLabel = "";
    if (timeIdx !== -1) {
      const stopWithDir = stops.find(s => s.stop_times[timeIdx] !== null);
      if (stopWithDir) {
        directionLabel = stopWithDir.direction === 0 ? "【下り】" : "【上り】";
      }
    }
    return `${trip.departure_time?.substring(0, 5)}発 (${trip.bus_route?.route_name || '路線不明'}) ${directionLabel}`;
  };

  // 運行ルートの妥当性チェック
  const isValidRoute = useMemo(() => {
    if (!boardingLocation || !dropoffLocation || !currentTrip) return true;
    const timeIndex = getTripTimeIndex(currentTrip);
    if (timeIndex === -1) return false;

    const bStop = stops.find(s => s.stop_id.toString() === boardingLocation);
    const dStop = stops.find(s => s.stop_id.toString() === dropoffLocation);

    if (!bStop || !dStop) return false;
    
    // 選択された便がその停留所に止まる（時刻が入っている）か
    const canBoard = !!bStop.stop_times[timeIndex];
    const canAlight = !!dStop.stop_times[timeIndex];

    return canBoard && canAlight;
  }, [boardingLocation, dropoffLocation, currentTrip, stops]);

  // --- 4. ハンドラー ---
  const fetchUserInfo = async (userId: string) => {
    const { data } = await supabase.from("ユーザ").select("*").eq("id", userId).single();
    if (data) setUserInfo(data);
  };

  const handleSave = async () => {
    setErrorMsg(null);
    if (!selectedTripId || !boardingLocation || !dropoffLocation) {
      setErrorMsg("すべての項目を選択してください。");
      return;
    }
    if (!isValidRoute) {
      setErrorMsg("選択された便は、指定された区間（乗車または降車）に停車しません。");
      return;
    }
    if (adults + children === 0) {
      setErrorMsg("予約人数を1名以上に設定してください。");
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("予約")
        .update({
          trip_id: parseInt(selectedTripId),
          boarding_id: parseInt(boardingLocation),
          alighting_id: parseInt(dropoffLocation),
          adult_count: adults,
          child_count: children,
          reserved_count: adults + children,
          notes: historyMemo,
        })
        .eq("reservation_id", reservation.reservation_id);

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
          
          {userInfo && (
            <div className="bg-blue-50 p-3 rounded-lg mb-6 flex flex-wrap gap-4 items-center text-blue-800 border border-blue-100 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{userInfo.name} 様</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>{userInfo.telephone_number}</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border-2 border-red-200 flex items-center gap-2 text-sm">
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-6">
            <section>
              <h3 className="flex items-center gap-2 mb-3 text-green-800 text-sm"><Search size={18} /> 1. 運行便を選択</h3>
              <div className="p-3 rounded-xl bg-gray-50 border-dashed border-2 border-gray-300">
                <select 
                  value={selectedTripId} 
                  onChange={(e) => setSelectedTripId(e.target.value)} 
                  className="w-full border-2 border-black rounded-lg p-3 bg-white text-base outline-none font-bold"
                >
                  <option value="">-- 便を選択してください --</option>
                  {availableTrips.map((trip) => (
                    <option key={trip.trip_id} value={trip.trip_id}>
                      {getTripLabel(trip)}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 mb-3 text-blue-800 text-sm"><ArrowRightLeft size={18} /> 2. 乗降場所を選択</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">乗車場所</label>
                  <select 
                    value={boardingLocation} 
                    onChange={(e) => setBoardingLocation(e.target.value)} 
                    className={`w-full border-2 rounded-lg p-2 bg-white text-sm ${!isValidRoute && boardingLocation ? 'border-red-500 bg-red-50' : 'border-black'}`}
                  >
                    <option value="">選択してください</option>
                    {stops.map((s, index) => (
                    <option key={`boarding-${s.stop_id}-${index}`} value={s.stop_id}>
                      {s.stop_name}
                    </option>
                  ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">降車場所</label>
                  <select 
                    value={dropoffLocation} 
                    onChange={(e) => setDropoffLocation(e.target.value)} 
                    className={`w-full border-2 rounded-lg p-2 bg-white text-sm ${!isValidRoute && dropoffLocation ? 'border-red-500 bg-red-50' : 'border-black'}`}
                  >
                    <option value="">選択してください</option>
                    {stops.map((s) => (
                      <option key={`d-${s.stop_id}`} value={s.stop_id}>{s.stop_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {!isValidRoute && (
                <p className="text-red-600 text-[11px] mt-2">※ 選択中の便はこの停留所に停車しません</p>
              )}
            </section>

            <section className="border-t pt-4">
              <h3 className="mb-3 text-gray-700 text-sm">3. 人数設定</h3>
              <div className="flex flex-wrap gap-6 items-center bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm">おとな</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAdults(Math.max(0, adults-1))} className="w-10 h-10 bg-white border-2 border-black rounded-lg">-</button>
                    <span className="w-8 text-center text-xl">{adults}</span>
                    <button onClick={() => setAdults(adults+1)} className="w-10 h-10 bg-white border-2 border-black rounded-lg">+</button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">こども</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setChildren(Math.max(0, children-1))} className="w-10 h-10 bg-white border-2 border-black rounded-lg">-</button>
                    <span className="w-8 text-center text-xl">{children}</span>
                    <button onClick={() => setChildren(children+1)} className="w-10 h-10 bg-white border-2 border-black rounded-lg">+</button>
                  </div>
                </div>
                <div className="ml-auto font-bold text-green-800 text-xl">合計 {adults + children} 名</div>
              </div>
            </section>

            <section className="border-t pt-4">
               <h3 className="flex items-center gap-2 mb-3 text-gray-700 text-sm"><MessageSquare size={18} /> 4. 備考</h3>
               <textarea 
                 value={historyMemo} 
                 onChange={(e) => setHistoryMemo(e.target.value)} 
                 className="w-full border-2 border-black rounded-xl p-3 h-24 text-sm bg-white outline-none" 
                 placeholder="備考を入力してください" 
               />
            </section>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !isValidRoute || !selectedTripId}
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