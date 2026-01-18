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
                direction,
                stop_time,
                stop_time_2,
                stop_time_3,
                stop_time_4,
                停留所 (
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
          const route = routes[0] as any;
          const stops = route.路線停留所 || [];

          // 行きなら direction: 0、帰りなら direction: 1 のレコードを使う想定
          const isReturnSearch = depName !== searchData.departure; // 出発地が検索条件と違う＝帰り
          const currentDirectionStops = stops.filter((s: any) => s.direction === (isReturnSearch ? 1 : 0));

          // 1. この路線に紐づく停留所の中で最小の stop_order を特定する
          const stopOrders = currentDirectionStops.map((s: any) => s.stop_order);
          const minOrder = Math.min(...stopOrders);

          // 2. その最小 order を持つ停留所を「始発」として特定
          const firstStop = currentDirectionStops.find((s: any) => s.stop_order === minOrder);
          if (!firstStop) {
            console.log("❌ 該当路線の停留所が見つかりません");
            return [];
          }

          // デバッグ用：どの番号を始発として認識したか出力
          console.log(`✅ 始発判定: ${firstStop.停留所?.stop_name} (stop_order: ${minOrder})`);

          // 3. 取得したデータを結合してフィルタリング
          console.log("実際にDBから届いた便データ:", trips);
          return (trips || [])
            .map(trip => {
              // この便が「何番目のダイヤ」か判定するロジック
              const tripStartT = trip.departure_time.split(':').slice(0, 2).join(':');
              let timeKey = ''; 
              // const tripStartT = trip.departure_time.slice(0, 5);
              // let timeKey = 'stop_time'; // デフォルト

              // 停留所マスタの各時刻列と比較
              const checkMatch = (masterTime: string | null) => {
                if (!masterTime) return false;
                return masterTime.split(':').slice(0, 2).join(':') === tripStartT;
              };

              if (checkMatch(firstStop.stop_time)) timeKey = 'stop_time';
              else if (checkMatch(firstStop.stop_time_2)) timeKey = 'stop_time_2';
              else if (checkMatch(firstStop.stop_time_3)) timeKey = 'stop_time_3';
              else if (checkMatch(firstStop.stop_time_4)) timeKey = 'stop_time_4';
              
              if (!timeKey) {
                console.warn(`便ID:${trip.trip_id} は路線の始発時刻(${tripStartT})と一致するダイヤがありません`);
                return null;
              }

              const depStop = currentDirectionStops.find((s: any) => s.停留所?.stop_name === depName);
              const arrStop = currentDirectionStops.find((s: any) => s.停留所?.stop_name === arrName);

              if (depStop && arrStop && depStop.stop_order < arrStop.stop_order) {
                console.log(`--- 便ID: ${trip.trip_id} の詳細解析 ---`);
                console.log(`選択された timeKey: ${timeKey}`);
                console.log(`降車停留所オブジェクト:`, arrStop);
                console.log(`生データへのアクセス結果: arrStop['${timeKey}'] =`, arrStop[timeKey]);
                const depTime = depStop[timeKey]?.split(':').slice(0, 2).join(':');
                const arrTime = arrStop[timeKey]?.split(':').slice(0, 2).join(':');
                console.log(`最終判定: 出発=${depTime}, 到着=${arrTime}`);
                const searchTime = targetTime.split(':').slice(0, 2).join(':');

                // ユーザーの検索希望時刻（targetTime）以降の便のみ表示
                if (depTime && depTime >= searchTime) {
                  return {
                    id: trip.trip_id,
                    departureTime: depTime,
                    arrivalTime: arrTime,
                    availableSeats: trip.capacity - (trip.reserved_count || 0),
                    totalSeats: trip.capacity,
                    fare: trip.fare
                  };
                }
              }
              return null;
            })
            .filter((b): b is Bus => b !== null)
            .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
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
        setOutboundBuses(outboundResults);

        // 帰り（往復の場合のみ）
        if (searchData.tripType === '往復' && searchData.returnDate) {
          const returnResults = await getBusData(
            searchData.returnDate,
            searchData.line,
            searchData.arrival, // 帰りは出発地と目的地を逆にする
            searchData.departure,
            searchData.returnTime || '00:00'
          );
          setReturnBuses(returnResults);
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
        fare: selectedOutboundBus.fare + selectedReturnBus.fare
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
              <button 
                onClick={() => onBack(searchData)}
                className="w-full sm:w-auto bg-gray-400 text-white px-12 py-3 rounded-xl"
              >
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