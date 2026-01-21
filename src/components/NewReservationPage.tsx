import { useState, useEffect, useMemo } from "react";
import { Clock, ArrowRight} from "lucide-react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

/** ページの遷移先を定義する型 */
type MainPage = "top" | "reservations" | "new-reservation" | "notifications" | "member";

interface NewReservationPageProps {
  onNavigate: (page: MainPage) => void;
}

export function NewReservationPage({ onNavigate }: NewReservationPageProps) {
  // --- 1. マスタ・データ一覧の状態管理 ---
  const [routes, setRoutes] = useState<any[]>([]);       // 登録されている全路線
  const [routeStops, setRouteStops] = useState<any[]>([]); // 選択された路線の停留所リスト（方向・時刻情報含む）
  const [trips, setTrips] = useState<any[]>([]);          // 運行される「便」の情報

  // --- 2. フォーム入力値の状態管理 ---
  /** 乗車日：初期値は現在時刻のローカル日付（YYYY-MM-DD） */
  const [rideDate, setRideDate] = useState(() => {
    const dt = new Date();
    const offset = dt.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dt.getTime() - offset).toISOString().split('T')[0];
    return localISOTime;
  });

  const [selectedRouteId, setSelectedRouteId] = useState<number | "">(""); // 選択中の路線ID
  const [selectedDirection, setSelectedDirection] = useState<number>(0);  // 運行方向 (0:上り, 1:下り)
  const [selectedTripId, setSelectedTripId] = useState<number | "">("");   // 選択された便ID
  
  const [boardingStopId, setBoardingStopId] = useState(""); // 乗車停留所ID
  const [dropoffStopId, setDropoffStopId] = useState("");  // 降車停留所ID
  
  const [adults, setAdults] = useState<number>(1);         // 大人の人数
  const [children, setChildren] = useState<number>(0);     // 子供の人数
  
  const [representativeName, setRepresentativeName] = useState(""); // 代表者名
  const [phoneNumber, setPhoneNumber] = useState("");               // 電話番号
  const [notes, setNotes] = useState("");                           // メモ

  // --- 3. 派生データ（計算・バリデーション） ---
  const totalCount = adults + children; // 合計人数
  const selectedTrip = trips.find(t => t.trip_id === selectedTripId); // 選択中の便オブジェクト
  const availableSeats = selectedTrip ? selectedTrip.capacity - selectedTrip.reserved_count : 0; // 空席数
  const isOverCapacity = selectedTripId && totalCount > availableSeats; // 定員オーバー判定

  /** 選択された「方向」に一致する停留所だけを抽出 */
  const availableStops = useMemo(() => {
    return routeStops.filter(rs => rs.direction === selectedDirection);
  }, [routeStops, selectedDirection]);

  /** 選択中の乗車場所のデータ詳細（順序IDや時刻列を特定するために使用） */
  const boardingNode = useMemo(() => 
    availableStops.find(s => s.stop_id === Number(boardingStopId)), 
  [availableStops, boardingStopId]);

  /** 選択中の降車場所のデータ詳細 */
  const dropoffNode = useMemo(() => 
    availableStops.find(s => s.stop_id === Number(dropoffStopId)), 
  [availableStops, dropoffStopId]);

  /** 乗車順序チェック：進行方向に対して、乗車地が降車地より前にあるかを確認 */
  const isOrderValid = useMemo(() => {
    if (!boardingNode || !dropoffNode) return true;
    return boardingNode.route_stop_id < dropoffNode.route_stop_id;
  }, [boardingNode, dropoffNode]);

  /** フォーム全体の有効性判定：すべての必須条件を満たしているか */
  const isFormValid = 
    selectedTripId !== "" && 
    selectedTripId !== null &&
    totalCount > 0 && 
    !isOverCapacity &&
    representativeName.trim() !== "" && 
    phoneNumber.trim() !== "" &&
    boardingStopId !== "" &&
    dropoffStopId !== "" &&
    isOrderValid;

  // --- 4. データベース取得処理 (useEffect) ---

  // 初回ロード：路線マスタを取得
  useEffect(() => {
    async function fetchMasterData() {
      const { data: routeData } = await supabase.from("バス路線").select("*");
      if (routeData) setRoutes(routeData);
    }
    fetchMasterData();
  }, []);

  // 路線選択時：その路線に属する全停留所と、その通過順序・時刻設定を取得
  useEffect(() => {
    async function fetchRouteStops() {
      if (!selectedRouteId) {
        setRouteStops([]);
        return;
      }
      const { data } = await supabase
        .from("路線停留所")
        .select(`
          *,
          停留所:stop_id ( stop_name )
        `)
        .eq("route_id", selectedRouteId)
        .order('route_stop_id', { ascending: true });

      if (data) {
        // リレーション先の停留所名を平坦化して保持
        const formatted = data.map((item: any) => ({
          ...item,
          stop_name: item.停留所?.stop_name
        }));
        setRouteStops(formatted);
      }
    }
    fetchRouteStops();
    
    // 路線が変わったら選択状態を安全にリセット
    setBoardingStopId("");
    setDropoffStopId("");
    setSelectedDirection(0); 
  }, [selectedRouteId]);

  // 方向（上り・下り）変更時：場所と便の選択をリセット
  useEffect(() => {
    setBoardingStopId("");
    setDropoffStopId("");
    setSelectedTripId("");
  }, [selectedDirection]);

  // 条件確定時：その日に運行される「便（Trips）」の情報を取得
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


  // --- 5. ヘルパー関数 ---
  /** * 停留所データの特定の時刻列（stop_time ～ stop_time_4）から
   * 便のインデックスに応じた時刻を抽出する 
   */
  const getSpecificTimeByOrder = (stopData: any, index: number) => {
    if (!stopData) return "--:--";
    const timeColumns = ["stop_time", "stop_time_2", "stop_time_3", "stop_time_4"];
    if (index >= timeColumns.length) return "--:--";
    const time = stopData[timeColumns[index]];
    return time ? time.slice(0, 5) : "--:--";
  };

  // --- 6. 登録処理 (INSERT) ---
  const handleRegister = async () => {
    if (!isFormValid || !selectedTripId) {
      alert("入力内容を確認してください。");
      return;
    }

    try {
      // (1) 匿名認証：ログインしていない場合は匿名アカウントを作成
      let { data: { session } } = await supabase.auth.getSession();
      let currentUser: User | null | undefined = session?.user;

      if (!currentUser) {
        const { data: auth, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;
        currentUser = auth.user;
      }
      if (!currentUser) throw new Error("認証に失敗しました");

      // (2) ユーザ情報の登録/更新 (auth_idをキーにしてUpsert)
      const { data: userData, error: userError } = await supabase
        .from("ユーザ")
        .upsert({
          auth_id: currentUser.id,
          name: representativeName,
          telephone_number: phoneNumber
        }, { onConflict: 'auth_id' })
        .select('id')
        .single();

      if (userError) throw userError;

      // (3) 予約情報の新規登録
      const { error: resError } = await supabase
        .from("予約")
        .insert([{
          user_id: userData.id,
          trip_id: selectedTripId,
          boarding_id: Number(boardingStopId),
          alighting_id: Number(dropoffStopId),
          direction: selectedDirection,
          adult_count: adults,
          child_count: children,
          reserved_count: totalCount,
          status: "active",
          reserved_at: new Date().toISOString(),
          notes: notes
        }]);

      if (resError) throw resError;

      alert("予約を完了しました");
      onNavigate("reservations"); // 完了後、予約一覧へ遷移

    } catch (error: any) {
      console.error("エラー詳細:", error);
      alert("エラー: " + (error.message || "登録に失敗しました"));
    }
  };

  return (
    <div className="bg-green-700 rounded-3xl p-3 sm:p-8">
      <div className="bg-white rounded-3xl p-3 sm:p-8">
        <div className="flex flex-col md:flex-row">
          
          {/* サイドナビゲーション */}
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

          {/* メイン入力エリア */}
          <main className="flex-1 space-y-6 h-[80vh] overflow-y-auto px-2">
            <h2 className="text-3xl font-black border-b-4 border-green-50 pb-2 flex items-center gap-2">
              新規予約登録
            </h2>

            {/* 基本情報設定セクション */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 ml-1">乗車日</span>
                    <input 
                      type="date" 
                      value={rideDate} 
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

                {/* 上り・下りの切り替えスイッチ */}
                {selectedRouteId && (
                  <div>
                    <span className="text-xs font-bold text-gray-500 ml-1 block mb-1">運行方向</span>
                    <div className="flex bg-gray-200 p-1 rounded-xl">
                      <button 
                        onClick={() => setSelectedDirection(0)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                          selectedDirection === 0 ? 'bg-white text-green-700 shadow-md' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                         上り
                      </button>
                      <button 
                        onClick={() => setSelectedDirection(1)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                          selectedDirection === 1 ? 'bg-white text-green-700 shadow-md' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                         下り
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 乗降場所選択セクション */}
              <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 ml-1">乗車場所</span>
                    <select 
                      value={boardingStopId} 
                      onChange={(e) => setBoardingStopId(e.target.value)} 
                      className="w-full mt-1 border-2 border-black rounded-xl p-3 bg-white"
                      disabled={!selectedRouteId}
                    >
                      <option value="">選択してください</option>
                      {availableStops.map(s => <option key={s.stop_id} value={s.stop_id}>{s.stop_name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 ml-1">降車場所</span>
                    <select 
                      value={dropoffStopId} 
                      onChange={(e) => setDropoffStopId(e.target.value)} 
                      className="w-full mt-1 border-2 border-black rounded-xl p-3 bg-white"
                      disabled={!selectedRouteId}
                    >
                      <option value="">選択してください</option>
                      {availableStops.map(s => <option key={s.stop_id} value={s.stop_id}>{s.stop_name}</option>)}
                    </select>
                  </label>
                </div>
                {/* 逆走防止アラート */}
                {!isOrderValid && boardingStopId && dropoffStopId && (
                   <p className="text-red-500 text-sm font-bold mt-2 ml-1">※ 進行方向に対して逆の停留所が選択されています。</p>
                )}
              </div>
            </div>

            {/* 人数選択セクション */}
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

            {/* 便選択セクション（条件によって表示が動的に変化） */}
            <section className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Clock size={18} />乗車便の選択
              </h3>
              
              {/* 条件未設定時 */}
              {(!selectedRouteId || !boardingStopId || !dropoffStopId) ? (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center text-gray-400 text-sm">
                  路線・方向・停留所を選択してください
                </div>
              ) : !isOrderValid ? (
                 /* 順序エラー時 */
                 <div className="p-8 bg-red-50 border-2 border-dashed border-red-200 rounded-3xl text-center text-red-500 text-sm">
                   乗降場所の順序が正しくありません。<br/>方向設定を確認するか、場所を選び直してください。
                 </div>
              ) : (
                /* 有効な便のリスト表示 */
                <div className="space-y-3">
                  {(() => {
                    // 1. 各便の「現在選択された乗降地」における時刻を計算し、有効な便か判定
                    const tripsWithValidity = trips.map((trip, index) => {
                      const bTime = getSpecificTimeByOrder(boardingNode, index);
                      const dTime = getSpecificTimeByOrder(dropoffNode, index);

                      const timeToMin = (t: string) => {
                        if (!t || t === "--:--" || !t.includes(":")) return -1;
                        const [h, m] = t.split(":").map(Number);
                        return h * 60 + m;
                      };

                      const bMin = timeToMin(bTime);
                      const dMin = timeToMin(dTime);

                      // 判定：時刻が存在し、かつ到着（dMin）が出発（bMin）より後の便のみ有効
                      const isValid = bMin !== -1 && dMin !== -1 && dMin > bMin;

                      return { ...trip, bTime, dTime, isValid };
                    });

                    // 2. 有効な便のみ抽出
                    const validTrips = tripsWithValidity.filter(t => t.isValid);

                    // 3. 表示対象がない（運行がない）場合
                    if (validTrips.length === 0 && trips.length > 0) {
                      return (
                        <div className="p-8 bg-orange-50 border-2 border-dashed border-orange-200 rounded-3xl text-center text-orange-600 text-sm">
                          ご指定の区間で利用可能な便はありません。
                        </div>
                      );
                    }

                    // 4. 有効な便をラジオボタンで一覧表示
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

            {/* 顧客情報入力セクション */}
            <section className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="代表者名 *" value={representativeName} onChange={(e) => setRepresentativeName(e.target.value)} className="w-full border-2 border-black rounded-xl p-3 outline-none" />
                <input type="tel" placeholder="電話番号 *" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ""))} className="w-full border-2 border-black rounded-xl p-3 outline-none" />
              </div>
              <textarea placeholder="メモ" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border-2 border-black rounded-xl p-3 h-20 resize-none outline-none" />
            </section>

            {/* 登録実行ボタン */}
            <div className="flex flex-col items-center py-6">
              <button 
                onClick={handleRegister} 
                disabled={!isFormValid} // バリデーションを通らない限りクリック不可
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