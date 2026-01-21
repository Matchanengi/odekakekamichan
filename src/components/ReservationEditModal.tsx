import { useState, useEffect, useMemo } from "react";
import { X, Search, ArrowRightLeft, MessageSquare, AlertCircle } from "lucide-react"; // アイコンライブラリ
import { supabase } from "./supabaseClient";

/**
 * プロパティの型定義
 */
interface ReservationEditModalProps {
  isOpen: boolean;      // モーダルの開閉状態
  onClose: () => void;  // 閉じるボタン押下時の関数
  onUpdate: () => void; // データ更新成功時に親コンポーネントを再読み込みする関数
  reservation: any;     // 編集対象となる元の予約データ
}

/**
 * ユーザー情報の型
 */
interface UserInfo {
  id: string;
  name: string;
  telephone_number: string;
  email: string;
}

/**
 * 停留所データの型
 */
interface StopData {
  stop_id: number;
  stop_name: string;
  route_stop_id: number;     // 順序判定用のID
  direction: number | null;  // 0:上り, 1:下り
  stop_times: (string | null)[]; // 1便〜4便それぞれの通過予定時刻
}

export function ReservationEditModal({ isOpen, onClose, onUpdate, reservation }: ReservationEditModalProps) {
  // --- ステート管理 (States) ---
  const [, setUserInfo] = useState<UserInfo | null>(null); // ※現在はセットのみで利用箇所はなし
  const [adults, setAdults] = useState(0);                 // 大人人数
  const [children, setChildren] = useState(0);             // 子供人数
  const [boardingLocation, setBoardingLocation] = useState(""); // 乗車場所ID
  const [dropoffLocation, setDropoffLocation] = useState("");  // 降車場所ID
  const [historyMemo, setHistoryMemo] = useState("");          // 備考欄
  const [selectedDirection, setSelectedDirection] = useState<number>(0); // 運行方向（0:上り/1:下り）
  const [allTripsOnDate, setAllTripsOnDate] = useState<any[]>([]); // 該当日付の全便リスト
  const [availableTrips, setAvailableTrips] = useState<any[]>([]); // 条件に合致し、選択可能な便リスト
  const [selectedTripId, setSelectedTripId] = useState<string>(""); // 選択された便ID
  const [stops, setStops] = useState<StopData[]>([]);             // 全停留所リスト
  const [isSaving, setIsSaving] = useState(false);                 // 保存中フラグ
  const [errorMsg, setErrorMsg] = useState<string | null>(null);   // エラーメッセージ
  const [isDataLoaded, setIsDataLoaded] = useState(false);         // 初期データ読み込み完了フラグ

  // --- 1. 初期化・マスターデータ取得 (useEffect) ---
  // モーダルが開いた時、または対象の予約データが変わった時に実行
  useEffect(() => {
    if (!isOpen || !reservation) {
      setIsDataLoaded(false);
      return;
    }

    let ignore = false; // クリーンアップ用のフラグ（競合防止）
    const targetDate = reservation.operation_date || reservation.便?.operation_date;
    const routeId = reservation.route_id || reservation.便?.route_id;

    async function loadData() {
      try {
        // 関連データを並列で取得して効率化
        const [tripRes, stopRes, userRes] = await Promise.all([
          // 1. 同日の同じ路線の便を取得
          supabase.from("便").select(`trip_id, route_id, operation_date, departure_time, bus_route:route_id ( route_name )`).eq("operation_date", targetDate).eq("route_id", routeId).order('departure_time', { ascending: true }),
          // 2. その路線の全ての停留所と通過時刻を取得
          supabase.from("路線停留所").select(`route_stop_id, route_id, stop_id, stop_time, stop_time_2, stop_time_3, stop_time_4, direction, 停留所:stop_id ( stop_id, stop_name )`).eq("route_id", routeId).order('route_stop_id', { ascending: true }),
          // 3. 予約者の詳細情報を取得
          reservation.user_id ? supabase.from("ユーザ").select("*").eq("id", reservation.user_id).single() : Promise.resolve({ data: null })
        ]);

        if (ignore) return;

        if (stopRes.data) {
          // DBのデータをフロントエンド用の StopData 型に整形
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

          // --- DBから取得した元の予約値をフォームに反映 ---
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
    return () => { ignore = true; }; // アンマウント時に処理を中断
  }, [isOpen, reservation]);

  // --- 2. フィルタリングとバリデーション (useMemo / useEffect) ---
  
  // 選択中の運行方向（上り/下り）に属する停留所だけを抽出
  const filteredStops = useMemo(() => {
    return stops.filter(s => s.direction === selectedDirection);
  }, [stops, selectedDirection]);

  // 乗降場所や方向の変更に合わせて、選択可能な「便（時間帯）」をリアルタイムに計算
  useEffect(() => {
    if (!isDataLoaded || stops.length === 0) return;

    const bStop = filteredStops.find(s => s.stop_id.toString() === boardingLocation);
    const dStop = filteredStops.find(s => s.stop_id.toString() === dropoffLocation);

    const filtered = allTripsOnDate.filter(trip => {
      // 便の出発時刻が「何番目の時間枠（1便〜4便）」に該当するかを特定
      const tripTimeShort = trip.departure_time?.substring(0, 5);
      const timeIdx = stops.find(s => s.stop_times.some(t => t?.substring(0, 5) === tripTimeShort))
                      ?.stop_times.findIndex(t => t?.substring(0, 5) === tripTimeShort) ?? -1;

      if (timeIdx === -1) return false;
      
      // その時間枠に、選択した方向の運行設定があるかチェック
      const directionMatch = stops.some(s => s.direction === selectedDirection && s.stop_times[timeIdx] !== null);
      if (!directionMatch) return false;

      // 乗車場所と降車場所が両方選択されている場合、順序（乗車が先、降車が後）が正しいかチェック
      if (bStop && dStop) {
        const hasBothTimes = bStop.stop_times[timeIdx] !== null && dStop.stop_times[timeIdx] !== null;
        const isCorrectOrder = bStop.route_stop_id < dStop.route_stop_id;
        return hasBothTimes && isCorrectOrder;
      }
      return true;
    });

    setAvailableTrips(filtered);
  }, [boardingLocation, dropoffLocation, selectedDirection, filteredStops, allTripsOnDate, stops, isDataLoaded]);

  // 入力エラーのチェック（ボタンの活性/非活性制御用）
  const validationError = useMemo(() => {
    if (!isDataLoaded || !boardingLocation || !dropoffLocation) return null;
    if (boardingLocation === dropoffLocation) return "乗降場所に同じ場所は指定できません。";
    
    const b = filteredStops.find(s => s.stop_id.toString() === boardingLocation);
    const d = filteredStops.find(s => s.stop_id.toString() === dropoffLocation);
    
    // 停留所のマスター順序(route_stop_id)を比較して逆走を防止
    if (b && d && b.route_stop_id >= d.route_stop_id) {
      return "進行方向が正しくありません。上り/下りの選択を確認してください。";
    }
    return null;
  }, [boardingLocation, dropoffLocation, filteredStops, isDataLoaded]);

  // --- 3. 保存処理 (handleSave) ---
  const handleSave = async () => {
    if (validationError || !selectedTripId) return;
    setIsSaving(true);
    try {
      // Supabaseの「予約」テーブルを更新
      const { error } = await supabase.from("予約").update({
        trip_id: parseInt(selectedTripId),
        boarding_id: parseInt(boardingLocation),
        alighting_id: parseInt(dropoffLocation),
        direction: selectedDirection, // 方向情報を保存
        adult_count: adults,
        child_count: children,
        reserved_count: adults + children, // 合計人数を自動計算して保存
        notes: historyMemo,
      }).eq("reservation_id", reservation.reservation_id);

      if (error) throw error;
      alert("予約内容を更新しました。");
      onUpdate(); // 親コンポーネントの一覧を更新
      onClose();  // モーダルを閉じる
    } catch (e) {
      setErrorMsg("保存中にエラーが発生しました。");
    } finally {
      setIsSaving(false);
    }
  };

  // モーダルが閉じていれば何も表示しない
  if (!isOpen || !reservation) return null;

  return (
    /* 背景オーバーレイ */
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 font-bold text-black">
      {/* モーダル本体（グリーンの外枠） */}
      <div className="bg-green-700 rounded-3xl p-4 sm:p-6 w-full max-w-[900px] shadow-2xl overflow-hidden">
        {/* 白いコンテンツエリア */}
        <div className="bg-white rounded-2xl p-6 relative max-h-[85vh] overflow-y-auto">
          {/* 閉じるボタン */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
            <X size={28} />
          </button>

          <h2 className="text-xl mb-4 border-b pb-2 text-green-800">予約内容の編集</h2>
          
          {/* エラー表示エリア */}
          {isDataLoaded && (errorMsg || validationError) && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border-2 border-red-200 flex items-center gap-2 text-sm">
              <AlertCircle size={20} /><span>{errorMsg || validationError}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* 1. 方向選択：上り/下りで停留所リストを切り替える */}
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

            {/* 2. 乗降場所：セレクトボックスで停留所を選択 */}
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

            {/* 3. 便（時間）選択：場所と方向の条件に合う便のみが表示される */}
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

            {/* 4. 人数設定：プラス・マイナスボタンによるカウンター機能 */}
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

            {/* 5. 備考欄 */}
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

          {/* アクションボタン：保存またはキャンセル */}
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