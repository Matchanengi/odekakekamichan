import { useState, useEffect } from "react";
import { Calendar, AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

type MainPage = "top" | "reservations" | "new-reservation" | "notifications" | "member";

interface NewReservationPageProps {
  onNavigate: (page: MainPage) => void;
}

export function NewReservationPage({ onNavigate }: NewReservationPageProps) {
  // --- ステート管理 ---
  const [routes, setRoutes] = useState<any[]>([]);
  const [allStops, setAllStops] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [boardingStopTimes, setBoardingStopTimes] = useState<any>(null);
  const [dropoffStopTimes, setDropoffStopTimes] = useState<any>(null);

  //const [rideDate, setRideDate] = useState(new Date().toISOString().split('T')[0]);
  const [rideDate, setRideDate] = useState(() => {
    const dt = new Date();
    // 日本時間にオフセットを調整して yyyy-mm-dd を抽出
    const offset = dt.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dt.getTime() - offset).toISOString().split('T')[0];
    return localISOTime;
  });
  const [selectedRouteId, setSelectedRouteId] = useState<number | "">("");
  const [selectedTripId, setSelectedTripId] = useState<number | "">("");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [boardingStopId, setBoardingStopId] = useState("");
  const [dropoffStopId, setDropoffStopId] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  //  console.log("現在のrideDateの状態:", rideDate);

  const totalCount = adults + children;
  const selectedTrip = trips.find(t => t.trip_id === selectedTripId);
  const availableSeats = selectedTrip ? selectedTrip.capacity - selectedTrip.reserved_count : 0;
  const isOverCapacity = selectedTripId && totalCount > availableSeats;

  // 修正後（より安全な判定）
  const isFormValid = 
    selectedTripId !== "" && 
    selectedTripId !== null &&
    totalCount > 0 && 
    !isOverCapacity &&
    representativeName.trim() !== "" && 
    phoneNumber.trim() !== "" &&
    boardingStopId !== "" &&
    dropoffStopId !== "";

  // --- データ取得系 ---
  useEffect(() => {
    async function fetchMasterData() {
      const { data: routeData } = await supabase.from("バス路線").select("*");
      const { data: stopData } = await supabase.from("停留所").select("*");
      if (routeData) setRoutes(routeData);
      if (stopData) setAllStops(stopData);
    }
    fetchMasterData();
  }, []);

  useEffect(() => {
    async function fetchStopDetails() {
      if (!selectedRouteId || !boardingStopId || !dropoffStopId) {
        setBoardingStopTimes(null);
        setDropoffStopTimes(null);
        return;
      }
      const { data: bData } = await supabase.from("路線停留所").select("*").eq("route_id", selectedRouteId).eq("stop_id", boardingStopId);
      const { data: dData } = await supabase.from("路線停留所").select("*").eq("route_id", selectedRouteId).eq("stop_id", dropoffStopId);
      setBoardingStopTimes(bData && bData.length > 0 ? bData[0] : null);
      setDropoffStopTimes(dData && dData.length > 0 ? dData[0] : null);
    }
    fetchStopDetails();
  }, [selectedRouteId, boardingStopId, dropoffStopId]);

  useEffect(() => {
    async function fetchTrips() {
      // もしここで setSelectedTripId("") 以外に
      // setRideDate(...) を呼んでいたら削除してください
      if (!selectedRouteId || !rideDate || !boardingStopId || !dropoffStopId) {
        setTrips([]);
        setSelectedTripId(""); 
        return;
    }
      const { data } = await supabase.from("便").select("*").eq("route_id", selectedRouteId).eq("operation_date", rideDate).order('trip_id', { ascending: true });
      if (data) setTrips(data);
    }
    fetchTrips();
  }, [selectedRouteId, rideDate, boardingStopId, dropoffStopId]);

  // 日付、路線、停留所が変わったら、一度選択した便を解除する
  useEffect(() => {
    setSelectedTripId("");
  }, [rideDate, selectedRouteId, boardingStopId, dropoffStopId]);

  // --- ヘルパー関数 ---
  const getSpecificTimeByOrder = (stopData: any, index: number) => {
    if (!stopData) return "--:--";
    const timeColumns = ["stop_time", "stop_time_2", "stop_time_3", "stop_time_4"];
    const time = stopData[timeColumns[index]];
    return time ? time.slice(0, 5) : "--:--";
  };

  const filteredStops = allStops.filter((stop) => {
    const routeIds = Object.keys(stop).filter(key => key.startsWith('route_id_')).map(key => Number(stop[key])).filter(id => id !== 0 && !isNaN(id));
    return routeIds.includes(Number(selectedRouteId));
  });

  // --- ★ 代替案：handleRegister 登録処理 ---
  const handleRegister = async () => {
    // 追加：バリデーションに失敗、または便IDが空なら処理を中断
    if (!isFormValid || !selectedTripId) {
      alert("便を選択してください。");
      return;
    }

    try {
      // 1. 認証チェック
      let { data: { session } } = await supabase.auth.getSession();
      let currentUser: User | null | undefined = session?.user;
      

      if (!currentUser) {
        const { data: auth, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;
        currentUser = auth.user;
      }
      if (!currentUser) throw new Error("認証に失敗しました");

      // 2. 「ユーザ」テーブルへ登録（auth_id カラムを使用）
      // id は自動採番(bigint)のまま、auth_id カラムに UUID を保存して一意性を保ちます
      const { data: userData, error: userError } = await supabase
        .from("ユーザ")
        .upsert({
          auth_id: currentUser.id, // ← ここに UUID を入れる
          name: representativeName,
          telephone_number: phoneNumber
        }, { onConflict: 'auth_id' }) // auth_id が重複したら更新
        .select('id') // 自動採番された bigint の id を取得
        .single();

      if (userError) throw userError;

      // 3. 「予約」テーブルへ登録
      // 予約テーブル側の user_id カラムが bigint の場合は、userData.id (数値) を入れます
      const { error: resError } = await supabase
        .from("予約")
        .insert([{
          user_id: userData.id, // ユーザテーブルの bigint の id を使う
          trip_id: selectedTripId,
          boarding_id: Number(boardingStopId),
          alighting_id: Number(dropoffStopId),
          adult_count: adults,
          child_count: children,
          reserved_count: totalCount,
          status: "active",
          reserved_at: new Date().toISOString(),
          notes: notes
        }]);

      if (resError) throw resError;

      alert("予約を完了しました");
      onNavigate("reservations");

    } catch (error: any) {
      console.error("エラー詳細:", error);
      alert("エラー: " + (error.message || "登録に失敗しました"));
    }
  };

  return (
    <div className="bg-green-700 rounded-3xl p-3 sm:p-8">
      <div className="bg-white rounded-3xl p-3 sm:p-8">
        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-64 md:pr-8 mb-4 md:mb-0">
            <div className="space-y-4 flex flex-row md:flex-col gap-2 md:gap-0">
              <button onClick={() => onNavigate("reservations")} className="w-full bg-green-700 text-white py-4 md:py-6 rounded-2xl border-4 border-white text-center">
                予約管理
              </button>
              <button onClick={() => onNavigate("new-reservation")} className="w-full bg-white text-black py-4 md:py-6 rounded-2xl border-4 border-green-700 text-center">
                新規予約登録
              </button>
            </div>
          </aside>

          <main className="flex-1 space-y-6 h-[80vh] overflow-y-auto px-2">
            <h2 className="text-3xl font-black border-b-4 border-green-50 pb-2 flex items-center gap-2">
              新規予約登録
            </h2>

            {/* 入力フォーム */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 ml-1">乗車日</span>
                    <input 
                      type="date" 
                      value={rideDate} // ここが重要
                      onChange={(e) => setRideDate(e.target.value)} 
                      className="w-full mt-1 border-2 border-black rounded-xl p-3 bg-white" 
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 ml-1">路線名</span>
                    <select value={selectedRouteId} onChange={(e) => setSelectedRouteId(Number(e.target.value))} className="w-full mt-1 border-2 border-black rounded-xl p-3 bg-white">
                      <option value="">選択してください</option>
                      {routes.map(r => <option key={r.route_id} value={r.route_id}>{r.route_name}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 ml-1">乗車場所</span>
                    <select value={boardingStopId} onChange={(e) => setBoardingStopId(e.target.value)} className="w-full mt-1 border-2 border-black rounded-xl p-3 bg-white">
                      <option value="">選択してください</option>
                      {filteredStops.map(s => <option key={s.stop_id} value={s.stop_id}>{s.stop_name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 ml-1">降車場所</span>
                    <select value={dropoffStopId} onChange={(e) => setDropoffStopId(e.target.value)} className="w-full mt-1 border-2 border-black rounded-xl p-3 bg-white">
                      <option value="">選択してください</option>
                      {filteredStops.map(s => <option key={s.stop_id} value={s.stop_id}>{s.stop_name}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <section className="bg-green-50 p-6 rounded-3xl border-2 border-green-100 flex flex-wrap gap-8 items-center">
              <div className="flex items-center gap-3 font-bold text-green-800">
                <span>おとな</span>
                <input type="number" value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="w-20 border-2 border-black rounded-xl p-2 text-center" min="0" />
              </div>
              <div className="flex items-center gap-3 font-bold text-green-800">
                <span>こども</span>
                <input type="number" value={children} onChange={(e) => setChildren(Number(e.target.value))} className="w-20 border-2 border-black rounded-xl p-2 text-center" min="0" />
              </div>
            </section>

            {/* 便選択セクション */}
<section className="space-y-4">
  <h3 className="font-bold text-gray-700 flex items-center gap-2">
    <Clock size={18} />乗車便の選択
  </h3>
  {(!selectedRouteId || !boardingStopId || !dropoffStopId) ? (
    <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center text-gray-400 text-sm">
      路線と停留所を選択してください
    </div>
  ) : (
    <div className="space-y-3">
      {(() => {
        // 1. 各便の出発・到着時刻を計算し、有効フラグを付ける
        const tripsWithValidity = trips.map((trip, index) => {
          const bTime = getSpecificTimeByOrder(boardingStopTimes, index);
          const dTime = getSpecificTimeByOrder(dropoffStopTimes, index);

          // 時刻を数値（分）に変換する関数
          const timeToMin = (t: string) => {
            if (!t || t === "--:--" || !t.includes(":")) return -1;
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
          };

          const bMin = timeToMin(bTime);
          const dMin = timeToMin(dTime);

          // 判定：時刻が存在し、かつ到着が出発より後であること
          const isValid = bMin !== -1 && dMin !== -1 && dMin > bMin;

          return { ...trip, bTime, dTime, isValid };
        });

        // 2. 有効な便（isValid === true）だけに絞り込む
        const validTrips = tripsWithValidity.filter(t => t.isValid);

        // 3. 表示対象がない場合のメッセージ
        if (validTrips.length === 0 && trips.length > 0) {
          return (
            <div className="p-8 bg-orange-50 border-2 border-dashed border-orange-200 rounded-3xl text-center text-orange-600 text-sm">
              ご指定の区間（{rideDate}）で利用可能な便はありません。<br/>
              ※進行方向が逆、または時刻設定がない可能性があります。
            </div>
          );
        }

        // 4. 有効な便をリスト表示
        return validTrips.map((trip) => {
          const isFull = trip.reserved_count >= trip.capacity;
          return (
            <label 
              key={trip.trip_id} 
              className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                selectedTripId === trip.trip_id ? "border-green-600 bg-green-50" : "border-gray-100 bg-white"
              }`}
            >
              <input 
                type="radio" 
                name="trip" 
                checked={selectedTripId === trip.trip_id} 
                disabled={isFull || totalCount === 0} 
                onChange={() => setSelectedTripId(trip.trip_id)} 
                className="w-6 h-6 accent-green-600" 
              />
              <div className="flex-1 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold">乗車</span>
                    <span className="text-xl font-black text-gray-800">{trip.bTime}</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 mt-4" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-bold">降車</span>
                    <span className="text-xl font-black text-gray-800">{trip.dTime}</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                }`}>
                  {isFull ? "満席" : `空き ${trip.capacity - trip.reserved_count} 席`}
                </span>
              </div>
            </label>
          );
        });
      })()}
    </div>
  )}
</section>

            <section className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="代表者名 *" value={representativeName} onChange={(e) => setRepresentativeName(e.target.value)} className="w-full border-2 border-black rounded-xl p-3 outline-none" />
                <input type="tel" placeholder="電話番号 *" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ""))} className="w-full border-2 border-black rounded-xl p-3 outline-none" />
              </div>
              <textarea placeholder="メモ" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border-2 border-black rounded-xl p-3 h-20 resize-none outline-none" />
            </section>

            <div className="flex flex-col items-center py-6">
              <button 
                onClick={handleRegister} 
                disabled={!isFormValid}
                className={`w-full max-w-sm py-4 rounded-2xl font-black text-xl shadow-lg transition-all ${isFormValid ? "bg-green-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                予約を確定する
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}