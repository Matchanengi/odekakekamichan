import { useState, useEffect } from "react";
import { Calendar, AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { supabase } from "./supabaseClient";

type MainPage = "top" | "reservations" | "new-reservation" | "notifications" | "member";

interface NewReservationPageProps {
  onNavigate: (page: MainPage) => void;
}

export function NewReservationPage({ onNavigate }: NewReservationPageProps) {
  const [routes, setRoutes] = useState<any[]>([]);
  const [allStops, setAllStops] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [boardingStopTimes, setBoardingStopTimes] = useState<any>(null);
  const [dropoffStopTimes, setDropoffStopTimes] = useState<any>(null);

  const [rideDate, setRideDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | "">("");
  const [selectedTripId, setSelectedTripId] = useState<number | "">("");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [boardingStopId, setBoardingStopId] = useState("");
  const [dropoffStopId, setDropoffStopId] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");

  const totalCount = adults + children;
  const selectedTrip = trips.find(t => t.trip_id === selectedTripId);
  const availableSeats = selectedTrip ? selectedTrip.capacity - selectedTrip.reserved_count : 0;
  const isOverCapacity = selectedTripId && totalCount > availableSeats;

  const isFormValid = 
    selectedTripId && 
    totalCount > 0 && 
    !isOverCapacity &&
    representativeName.trim() !== "" && 
    phoneNumber.trim() !== "" &&
    boardingStopId !== "" &&
    dropoffStopId !== "";

  useEffect(() => {
    async function fetchMasterData() {
      const { data: routeData } = await supabase.from("バス路線").select("*");
      const { data: stopData } = await supabase.from("停留所").select("*");
      if (routeData) setRoutes(routeData);
      if (stopData) setAllStops(stopData);
    }
    fetchMasterData();
  }, []);

  // --- 修正ポイント: .single() を使わず配列で取得 ---
  useEffect(() => {
    async function fetchStopDetails() {
      if (!selectedRouteId || !boardingStopId || !dropoffStopId) {
        setBoardingStopTimes(null);
        setDropoffStopTimes(null);
        return;
      }

      // 乗車停留所のデータ取得
      const { data: bData } = await supabase
        .from("路線停留所")
        .select("*")
        .eq("route_id", selectedRouteId)
        .eq("stop_id", boardingStopId); // single() は使わない
      
      // 降車停留所のデータ取得
      const { data: dData } = await supabase
        .from("路線停留所")
        .select("*")
        .eq("route_id", selectedRouteId)
        .eq("stop_id", dropoffStopId); // single() は使わない

      // 複数ヒットしても、最初の1件をステートに入れる
      setBoardingStopTimes(bData && bData.length > 0 ? bData[0] : null);
      setDropoffStopTimes(dData && dData.length > 0 ? dData[0] : null);
    }
    fetchStopDetails();
  }, [selectedRouteId, boardingStopId, dropoffStopId]);

  useEffect(() => {
    async function fetchTrips() {
      if (!selectedRouteId || !rideDate || !boardingStopId || !dropoffStopId) {
        setTrips([]);
        setSelectedTripId("");
        return;
      }
      const { data } = await supabase
        .from("便")
        .select("*")
        .eq("route_id", selectedRouteId)
        .eq("operation_date", rideDate)
        .order('trip_id', { ascending: true });
      if (data) setTrips(data);
    }
    fetchTrips();
  }, [selectedRouteId, rideDate, boardingStopId, dropoffStopId]);

  const getSpecificTimeByOrder = (stopData: any, index: number) => {
    if (!stopData) return "--:--";
    const timeColumns = ["stop_time", "stop_time_2", "stop_time_3", "stop_time_4"];
    const time = stopData[timeColumns[index]];
    return time ? time.slice(0, 5) : "--:--";
  };

const filteredStops = allStops.filter((stop) => {
  // stop オブジェクトの中から "route_id_" で始まるキーの値だけを取り出す
  const routeIds = Object.keys(stop)
    .filter(key => key.startsWith('route_id_'))
    .map(key => Number(stop[key]))
    .filter(id => id !== 0 && !isNaN(id)); // 0や空を除外

  return routeIds.includes(Number(selectedRouteId));
});

  const handleRegister = async () => {
    if (!isFormValid) return;
    const { error } = await supabase.from("予約").insert([{
      trip_id: selectedTripId,
      boarding_id: Number(boardingStopId),
      alighting_id: Number(dropoffStopId),
      adult_count: adults,
      child_count: children,
      reserved_count: totalCount,
      reserved_at: new Date().toISOString(),
      status: "confirmed",
      representative_name: representativeName,
      phone_number: phoneNumber,
      notes: notes
    }]);

    if (error) alert("エラー: " + error.message);
    else {
      alert("予約を完了しました");
      onNavigate("reservations");
    }
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

          <main className="flex-1 space-y-6 h-[80vh] overflow-y-auto px-2">
            <h2 className="text-3xl font-black border-b-4 border-green-50 pb-2 flex items-center gap-2">
              新規予約登録
            </h2>

            {/* grid-cols-2 の中で「2列分」使うように指定します */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* col-span-full を追加して、画面横幅いっぱいに広げます */}
              <div className="md:col-span-2 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                
                {/* 中身を横並びにする設定 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 ml-1">乗車日</span>
                    <input type="date" value={rideDate} onChange={(e) => setRideDate(e.target.value)} className="w-full mt-1 border-2 border-black rounded-xl p-3 bg-white" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* md:col-span-2 を追加して、親のグリッド内で横幅いっぱいに広げます */}
            <div className="md:col-span-2 p-5 bg-gray-50 rounded-3xl border border-gray-100">
              
              {/* 内部を grid にし、PCサイズ(md)で 2列に分割します */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 乗車場所 */}
                <label className="block">
                  <span className="text-xs font-bold text-gray-500 ml-1">乗車場所</span>
                  <select 
                    value={boardingStopId} 
                    onChange={(e) => setBoardingStopId(e.target.value)} 
                    className="w-full mt-1 border-2 border-black rounded-xl p-3 bg-white"
                  >
                    <option value="">選択してください</option>
                    {filteredStops.map(s => <option key={s.stop_id} value={s.stop_id}>{s.stop_name}</option>)}
                  </select>
                </label>

                {/* 降車場所 */}
                <label className="block">
                  <span className="text-xs font-bold text-gray-500 ml-1">降車場所</span>
                  <select 
                    value={dropoffStopId} 
                    onChange={(e) => setDropoffStopId(e.target.value)} 
                    className="w-full mt-1 border-2 border-black rounded-xl p-3 bg-white"
                  >
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

            <section className="space-y-4">
  <h3 className="font-bold text-gray-700 flex items-center gap-2"><Clock size={18} />乗車便の選択</h3>
  {(!selectedRouteId || !boardingStopId || !dropoffStopId) ? (
    <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center text-gray-400 text-sm">路線と停留所を選択してください</div>
  ) : (
    <div className="space-y-3">
      {trips
        // ★ ここでフィルターを追加：両方の時刻が有効な便だけを残す
        .filter((_, index) => {
          const bTime = getSpecificTimeByOrder(boardingStopTimes, index);
          const dTime = getSpecificTimeByOrder(dropoffStopTimes, index);
          return bTime !== "--:--" && dTime !== "--:--";
        })
        .map((trip) => {
          // すでにフィルターされているので、ここでは必ず時刻がある前提で取得できる
          // ただし trips 全体の index が必要なので、元の trips からの index を再計算するか、
          // map の中で再度 index を特定する必要があります。
          
          // より確実な方法は、先に trips に時刻を付与した配列を作ることです（下記参照）
          const originalIndex = trips.findIndex(t => t.trip_id === trip.trip_id);
          const bTime = getSpecificTimeByOrder(boardingStopTimes, originalIndex);
          const dTime = getSpecificTimeByOrder(dropoffStopTimes, originalIndex);
          const isFull = trip.reserved_count >= trip.capacity;

          return (
            <label key={trip.trip_id} className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedTripId === trip.trip_id ? "border-green-600 bg-green-50" : "border-gray-100 bg-white"}`}>
              <input type="radio" name="trip" checked={selectedTripId === trip.trip_id} disabled={isFull || totalCount === 0} onChange={() => setSelectedTripId(trip.trip_id)} className="w-6 h-6 accent-green-600" />
              <div className="flex-1 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-black text-gray-800">{bTime}</span>
                  <ArrowRight size={16} className="text-gray-300" />
                  <span className="text-xl font-black text-gray-800">{dTime}</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                  {isFull ? "満席" : `空き ${trip.capacity - trip.reserved_count} 席`}
                </span>
              </div>
            </label>
          );
        })}
      
      {/* フィルターした結果、表示できる便が0件だった場合の表示 */}
      {trips.length > 0 && trips.filter((_, i) => getSpecificTimeByOrder(boardingStopTimes, i) !== "--:--" && getSpecificTimeByOrder(dropoffStopTimes, i) !== "--:--").length === 0 && (
        <p className="text-center text-gray-400 py-4 text-sm italic">ご指定の区間で運行している便はありません</p>
      )}
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