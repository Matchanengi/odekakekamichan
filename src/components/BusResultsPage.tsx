import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';


interface Bus {
  id: number;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  totalSeats: number;
  fare: number;
}

interface BusResultsPageProps {
  searchData: {
    line: string;
    departure: string;
    arrival: string;
    tripType: '片道' | '往復';
    outboundDate: string;
    outboundTime: string;
    returnDate?: string;
    returnTime?: string;
    adults: number;
    children: number;
  };
  onBack: (currentData: any) => void;
  onConfirm: (bookingData: {
    line: string;
    departure: string;
    arrival: string;
    tripType: '片道' | '往復';
    date: string;
    time: string;
    departureTime: string;
    arrivalTime: string;
    returnDate?: string;
    returnTime?: string;
    returnDepartureTime?: string;
    returnArrivalTime?: string;
    adults: number;
    children: number;
    tripId: number;
    returnTripId?: number;
    fare: number;
  }) => void;
}

export function BusResultsPage({ searchData, onBack, onConfirm }: BusResultsPageProps) {
  const [outboundBuses, setOutboundBuses] = useState<Bus[]>([]);
  const [returnBuses, setReturnBuses] = useState<Bus[]>([]);
  const [selectedOutboundBus, setSelectedOutboundBus] = useState<Bus | null>(null);
  const [selectedReturnBus, setSelectedReturnBus] = useState<Bus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBuses() {
      console.log("BusResultPage:--- 検索開始 ---");
      setOutboundBuses([]);
      setReturnBuses([]);
      setIsLoading(true);
      try {
        const getBusData = async (date: string, lineName: string, depName: string, arrName: string, targetTime: string) => {
          // 1. 「便」テーブルからその日の全データを取得
          console.log(`BusResultPage:1. 便取得を試みます: 日付=${date}`);
          
          const { data: trips, error: tripError } = await supabase
            .from('便')
            .select('trip_id, fare, capacity, reserved_count, route_id, departure_time')
            .eq('operation_date', date)
            ;

          if (tripError) {
            console.error("BusResultPage:便取得エラー:", tripError);
            throw tripError;
          }
          console.log(`BusResultPage:2. 便データを ${trips?.length || 0} 件取得しました`, trips);
          // 2. 「バス路線」とそれに紐づく「路線停留所」を取得
          console.log(`BusResultPage:3. バス路線取得を試みます: 路線名=${lineName}`);
          const { data: routes, error: routeError } = await supabase
            .from('バス路線')
            .select(`
              route_id,
              route_name,
              路線停留所 (
                stop_order,
                stop_time,
                停留所:stop_id (
                  stop_name
                )
              )
            `)
            .eq('route_name', lineName);

          if (routeError) {
            console.error("BusResultPage:路線取得エラー:", routeError);
            throw routeError;
          }
          console.log(`BusResultPage:4. 路線データを ${routes?.length || 0} 件取得しました`, routes);

          
          if (!trips || trips.length === 0 || !routes || routes.length === 0) {
            console.warn("BusResultPage:便または路線が0件のため、照合をスキップします。");
            return [];
          }
          // 3. 取得したデータを結合してフィルタリング
          console.log("実際にDBから届いた便データ:", trips);
          return (trips || [])
            .map(trip => {
              const route = routes.find((r: any) => r.route_id === trip.route_id) as {
                route_id: number;
                route_name: string;
                路線停留所: any[];
              } | undefined;
              if (!route) return null;

              const stops = route.路線停留所 || [];
              const depStop = stops.find((s: any) => s.停留所?.stop_name === depName);
              const arrStop = stops.find((s: any) => s.停留所?.stop_name === arrName);

              if (depStop && arrStop) {
                // 1. 各時刻を 5文字(HH:MM)で取得
                const stopDepT = depStop.stop_time.slice(0, 5); // 停留所マスタの時刻
                const stopArrT = arrStop.stop_time.slice(0, 5); // 停留所マスタの時刻
                const tripStartT = trip.departure_time.slice(0, 5); // 便の始発時刻
                const searchT = targetTime.slice(0, 5); // ユーザーの検索希望時刻

                // 2. 条件判定
                // ・停留所の時刻が、便の始発時刻以上であること (trip.departure_time 以降の stop_time)
                // ・停留所の時刻が、ユーザーの検索希望時刻以上であること
                // ・出発地が到着地より前にあること（stop_order 順）
                if (
                  // 1. 順序が正しいか (逆走チェック)
                  depStop.stop_order < arrStop.stop_order &&
                  // 2. ユーザーが検索した時刻以降の便か (targetTime: 03:50 など)
                  // ここは「停留所のマスタ時間」ではなく「便の始発時間」で判定するのが一般的です
                  tripStartT >= searchT 
                ) {
                  // 表示するのはマスタの 08:35 でも、ID 2 の便として成立する
                  return {
                    id: trip.trip_id, // 2 や 3
                    departureTime: stopDepT, // "08:35" (マスタの時間)
                    arrivalTime: stopArrT,
                    availableSeats: trip.capacity - (trip.reserved_count || 0),
                    totalSeats: trip.capacity,
                    fare: trip.fare
                  };
                }
              }
              return null;
            })
            .filter(Boolean)
            .sort((a: any, b: any) => a.departureTime.localeCompare(b.departureTime));
        };

        // --- 実行（アラートを1回にまとめるため await で順番に処理） ---
        
        // 行き
        const outboundResults = await getBusData(
          searchData.outboundDate,
          searchData.line,
          searchData.departure,
          searchData.arrival,
          searchData.outboundTime
        );
        setOutboundBuses(outboundResults as any);

        // 帰り（往復の場合のみ）
        if (searchData.tripType === '往復' && searchData.returnDate) {
          const returnResults = await getBusData(
            searchData.returnDate,
            searchData.line,
            searchData.arrival, // 帰りは出発地と目的地を逆にする
            searchData.departure,
            searchData.returnTime || '00:00'
          );
          setReturnBuses(returnResults as any);
        }

      } catch (error: any) {
        console.error('Fetch error:', error);
        alert(`バス情報の取得に失敗しました: ${error.message || 'データ構造を確認してください'}`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBuses();
  }, [searchData]);

  const handleConfirm = () => {
    if (searchData.tripType === '片道' && selectedOutboundBus) {
      onConfirm({
        ...searchData,
        date: searchData.outboundDate,
        time: selectedOutboundBus.departureTime,
        departureTime: selectedOutboundBus.departureTime,
        arrivalTime: selectedOutboundBus.arrivalTime,        
        tripId: selectedOutboundBus.id,
        fare: selectedOutboundBus.fare
      });
    } else if (searchData.tripType === '往復' && selectedOutboundBus && selectedReturnBus) {
      onConfirm({
        ...searchData,
        date: searchData.outboundDate,
        time: selectedOutboundBus.departureTime,
        departureTime: selectedOutboundBus.departureTime,
        arrivalTime: selectedOutboundBus.arrivalTime,
        returnDepartureTime: selectedReturnBus.departureTime,
        returnArrivalTime: selectedReturnBus.arrivalTime,
        tripId: selectedOutboundBus.id,
        returnTripId: selectedReturnBus.id,
        fare: selectedReturnBus.fare
      });
    }
  };

  const isConfirmDisabled =
    isLoading ||
    (searchData.tripType === '片道' && !selectedOutboundBus) ||
    (searchData.tripType === '往復' && (!selectedOutboundBus || !selectedReturnBus));

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-6 text-2xl font-bold">バス候補</h1>

            {/* 検索概要 */}
            <div className="mb-8 p-4 bg-gray-50 rounded-2xl">
              <p className="text-blue-900 mb-2">路線: {searchData.line}</p>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">{searchData.departure}</span>
                <ArrowRight className="text-cyan-400" />
                <span className="text-lg font-bold">{searchData.arrival}</span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-cyan-400 mb-4" size={48} />
                <p>空席情報を確認中...</p>
              </div>
            ) : (
              <>
                {/* 行きのリスト */}
                <BusList 
                  title={`行き (${searchData.outboundDate})`}
                  buses={outboundBuses}
                  selectedBusId={selectedOutboundBus?.id}
                  onSelect={setSelectedOutboundBus}
                />

                {/* 帰りのリスト */}
                {searchData.tripType === '往復' && (
                  <BusList 
                    title={`帰り (${searchData.returnDate})`}
                    buses={returnBuses}
                    selectedBusId={selectedReturnBus?.id}
                    onSelect={setSelectedReturnBus}
                  />
                )}
              </>
            )}

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
              <button onClick={() => onBack(searchData)} className="w-full sm:w-auto bg-gray-400 text-white px-12 py-3 rounded-xl">
                戻る
              </button>
              <button
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
                className={`w-full sm:w-auto px-12 py-3 rounded-xl ${
                  isConfirmDisabled ? 'bg-gray-300' : 'bg-blue-600 text-white'
                }`}
              >
                予約確認へ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// リスト表示用のサブコンポーネント（可読性向上のため）
function BusList({ title, buses, selectedBusId, onSelect }: { 
  title: string, buses: Bus[], selectedBusId?: number, onSelect: (bus: Bus) => void 
}) {
  return (
    <div className="mb-10">
      <h2 className="text-xl text-blue-900 mb-4 font-bold">{title}</h2>
      {buses.length === 0 ? (
        <p className="text-gray-500 py-4">該当する便が見つかりませんでした。</p>
      ) : (
        <div className="space-y-3">
          {buses.map((bus) => (
            <button
              key={bus.id}
              onClick={() => onSelect(bus)}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedBusId === bus.id ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200 hover:border-cyan-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-gray-500">出発</div>
                    <div className="text-xl font-bold">{bus.departureTime}</div>
                  </div>
                  <ArrowRight className="text-cyan-400" size={20} />
                  <div>
                    <div className="text-xs text-gray-500">到着</div>
                    <div className="text-xl font-bold">{bus.arrivalTime}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">空席</div>
                  <div className={`font-bold ${bus.availableSeats < 3 ? 'text-red-500' : 'text-green-600'}`}>
                    {bus.availableSeats} / {bus.totalSeats}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}