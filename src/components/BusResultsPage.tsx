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
  direction: boolean;
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
    direction: boolean;
    returnTripId?: number;
    returnDirection?: boolean;
    fare: number;
  }) => void;
}
// Supabaseから返ってくるデータの構造を定義
interface RouteWithStops {
  route_id: number;
  route_name: string;
  路線停留所: {
    stop_order: number;
    direction: number;
    stop_time: string | null;
    stop_time_2: string | null;
    stop_time_3: string | null;
    stop_time_4: string | null;
    停留所: {
      stop_name: string;
    } | null;
  }[];
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
        // 
        const getBusData = async (date: string, lineName: string, depName: string, arrName: string, targetTime: string) => {
          // 1. 路線と全停留所を取得（direction 0と1の両方）
          const { data: rawRoutes, error: routeError } = await supabase
            .from('バス路線')
            .select(`
            route_id,
            路線停留所 (
              stop_order, direction, stop_time, stop_time_2, stop_time_3, stop_time_4,
              停留所 ( stop_name )
            )
          `)
            .eq('route_name', lineName);

          const routes = rawRoutes as unknown as RouteWithStops[];
          if (routeError || !routes || routes.length === 0) return [];
          const allStops = routes[0].路線停留所 || [];

          // 「路線全体の本当の始発点」を特定（常にここをキーにする）
          // 理由：便テーブルの departure_time は、この地点の時刻しか持っていないため
          const absoluteMinOrder = Math.min(...allStops.map((s: any) => s.stop_order));
          const routeOriginStop = allStops.find((s: any) => s.stop_order === absoluteMinOrder);

          if (!routeOriginStop) {
            console.warn("路線の始発停留所を特定できませんでした。");
            return []; // 見つからない場合は空のリストを返して終了する
          }
          // 3. 便データの取得
          const { data: trips } = await supabase
            .from('便')
            .select('*')
            .eq('operation_date', date)
            .eq('route_id', routes[0].route_id);

          if (!trips) return [];

          return trips.map(trip => {
            // 4. 便の特定（常に全体の始発点 A の時刻と比較）
            const tripStartT = trip.departure_time.split(':').slice(0, 2).join(':');
            let timeKey: 'stop_time' | 'stop_time_2' | 'stop_time_3' | 'stop_time_4' | '' = '';
            const checkMatch = (t: string | null) => t?.split(':').slice(0, 2).join(':') === tripStartT;

            if (checkMatch(routeOriginStop.stop_time)) timeKey = 'stop_time';
            else if (checkMatch(routeOriginStop.stop_time_2)) timeKey = 'stop_time_2';
            else if (checkMatch(routeOriginStop.stop_time_3)) timeKey = 'stop_time_3';
            else if (checkMatch(routeOriginStop.stop_time_4)) timeKey = 'stop_time_4';

            if (!timeKey) return null;

            // 5. ユーザーが探している「乗車駅」「降車駅」の組み合わせが
            // direction: 0 か 1 どちらにあるか自動判定する

            // まず direction: 0 で探してみる
            let depStop = allStops.find(s => s.停留所?.stop_name === depName && s.direction === 0);
            let arrStop = allStops.find(s => s.停留所?.stop_name === arrName && s.direction === 0);
            let currentDirection = 0;

            // direction: 0 に正しい順序（dep < arr）で存在しない場合、direction: 1 を探す
            if (!(depStop && arrStop && depStop.stop_order < arrStop.stop_order)) {
              depStop = allStops.find(s => s.停留所?.stop_name === depName && s.direction === 1);
              arrStop = allStops.find(s => s.停留所?.stop_name === arrName && s.direction === 1);
              currentDirection = 1;
            }
            // 6. 進行方向チェック（同じ direction 内で順番が正しいか）
            if (depStop && arrStop && depStop.stop_order < arrStop.stop_order) {
              const actualDepTime = depStop[timeKey]?.split(':').slice(0, 2).join(':');
              const actualArrTime = arrStop[timeKey]?.split(':').slice(0, 2).join(':');
              const searchLimit = targetTime.split(':').slice(0, 2).join(':');

              // ユーザーの検索条件（B地点の通過時刻など）に合うか判定
              if (actualDepTime && actualDepTime >= searchLimit) {
                return {
                  id: trip.trip_id,
                  departureTime: actualDepTime, // B地点の通過時刻が入る
                  arrivalTime: actualArrTime,   // A地点(戻り)の到着時刻が入る
                  availableSeats: trip.capacity - (trip.reserved_count || 0),
                  totalSeats: trip.capacity,
                  fare: trip.fare,
                  direction: currentDirection === 1
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
        direction: selectedOutboundBus.direction,
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
        direction: selectedOutboundBus.direction,
        returnTripId: selectedReturnBus.id,
        returnDirection: selectedReturnBus.direction,
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
                className={`w-full sm:w-auto px-12 py-3 rounded-xl ${isConfirmDisabled ? 'bg-gray-300' : 'bg-blue-600 text-white'
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
              className={`w-full p-4 rounded-xl border-2 transition-all ${selectedBusId === bus.id ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200 hover:border-cyan-200'
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