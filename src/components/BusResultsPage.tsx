import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';

/**
 * バス情報のインターフェース
 */
interface Bus {
  id: number;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  totalSeats: number;
  fare: number;
  direction: boolean;
}

/**
 * Propsの型定義
 */
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

/**
 * Supabaseから返ってくる結合データの構造を定義
 */
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
    /**
     * 条件に合致するバス便データを取得・加工する内部関数
     */
    async function fetchBuses() {
      console.log("BusResultPage:--- 検索開始 ---");
      setOutboundBuses([]);
      setReturnBuses([]);
      setIsLoading(true);

      try {
        const getBusData = async (date: string, lineName: string, depName: string, arrName: string, targetTime: string) => {
          
          // 1. 指定された「路線名」に基づき、全停留所と通過予定時刻のマスタを取得
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

          // 2. 「路線全体の本当の始発点」を特定
          // 運行便テーブル(trips)の departure_time は始発停留所の時刻を指すため、マスタ照合の基準キーとなる
          const absoluteMinOrder = Math.min(...allStops.map((s: any) => s.stop_order));
          const routeOriginStop = allStops.find((s: any) => s.stop_order === absoluteMinOrder);

          if (!routeOriginStop) {
            console.warn("路線の始発停留所を特定できませんでした。");
            return [];
          }

          // 3. 指定日の運行スケジュール（便）を取得
          const { data: trips } = await supabase
            .from('便')
            .select('*')
            .eq('operation_date', date)
            .eq('route_id', routes[0].route_id);

          if (!trips) return [];

          // 4. 便ごとに、ユーザーが指定した停留所を通るか、空席があるかを判定して整形
          return trips.map(trip => {
            // 便の出発時刻（HH:mm）を取得
            const tripStartT = trip.departure_time.split(':').slice(0, 2).join(':');
            let timeKey: 'stop_time' | 'stop_time_2' | 'stop_time_3' | 'stop_time_4' | '' = '';
            
            // 始発点の時刻が stop_time ~ stop_time_4 のどれに合致するか判定し、参照するカラム(timeKey)を決定
            const checkMatch = (t: string | null) => t?.split(':').slice(0, 2).join(':') === tripStartT;

            if (checkMatch(routeOriginStop.stop_time)) timeKey = 'stop_time';
            else if (checkMatch(routeOriginStop.stop_time_2)) timeKey = 'stop_time_2';
            else if (checkMatch(routeOriginStop.stop_time_3)) timeKey = 'stop_time_3';
            else if (checkMatch(routeOriginStop.stop_time_4)) timeKey = 'stop_time_4';

            if (!timeKey) return null;

            // 5. 進行方向（direction: 0 か 1）の自動判定
            // まずは direction: 0 で、乗車停留所が降車停留所より前にあるかを確認
            let depStop = allStops.find(s => s.停留所?.stop_name === depName && s.direction === 0);
            let arrStop = allStops.find(s => s.停留所?.stop_name === arrName && s.direction === 0);
            let currentDirection = 0;

            // 0に存在しないか順序が逆なら、逆方向(direction: 1)を探す
            if (!(depStop && arrStop && depStop.stop_order < arrStop.stop_order)) {
              depStop = allStops.find(s => s.停留所?.stop_name === depName && s.direction === 1);
              arrStop = allStops.find(s => s.停留所?.stop_name === arrName && s.direction === 1);
              currentDirection = 1;
            }

            // 6. 停留所が見つかり、順序が正しい場合の最終処理
            if (depStop && arrStop && depStop.stop_order < arrStop.stop_order) {
              const actualDepTime = depStop[timeKey]?.split(':').slice(0, 2).join(':');
              const actualArrTime = arrStop[timeKey]?.split(':').slice(0, 2).join(':');
              const searchLimit = targetTime.split(':').slice(0, 2).join(':');

              // 指定した希望時刻以降の便のみを採用
              if (actualDepTime && actualDepTime >= searchLimit) {
                return {
                  id: trip.trip_id,
                  departureTime: actualDepTime, // 指定乗車停留所の時刻
                  arrivalTime: actualArrTime,   // 指定降車停留所の時刻
                  availableSeats: trip.capacity - (trip.reserved_count || 0), // 残席計算
                  totalSeats: trip.capacity,
                  fare: trip.fare,
                  direction: currentDirection === 1
                };
              }
            }
            return null;
          })
            .filter((b): b is Bus => b !== null) // null（不適合便）を除外
            .sort((a, b) => a.departureTime.localeCompare(b.departureTime)); // 時刻順にソート
        };

        // --- 行きのデータ取得 ---
        const outboundResults = await getBusData(
          searchData.outboundDate,
          searchData.line,
          searchData.departure,
          searchData.arrival,
          searchData.outboundTime
        );
        setOutboundBuses(outboundResults);

        // --- 帰りのデータ取得（往復選択時のみ） ---
        if (searchData.tripType === '往復' && searchData.returnDate) {
          const returnResults = await getBusData(
            searchData.returnDate,
            searchData.line,
            searchData.arrival, // 帰りは出発と到着を入れ替える
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

  /**
   * 選択確定ボタン押下時の処理
   */
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

  // 確定ボタンの活性・非活性判定
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

            {/* 検索条件の要約表示 */}
            <div className="mb-8 p-4 bg-gray-50 rounded-2xl">
              <p className="text-blue-900 mb-2">路線: {searchData.line}</p>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold">{searchData.departure}</span>
                <ArrowRight className="text-cyan-400" />
                <span className="text-lg font-bold">{searchData.arrival}</span>
              </div>
            </div>

            {isLoading ? (
              /* ローディング中画面 */
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-cyan-400 mb-4" size={48} />
                <p>空席情報を確認中...</p>
              </div>
            ) : (
              <>
                {/* 行きの便リスト表示 */}
                <BusList
                  title={`行き (${searchData.outboundDate})`}
                  buses={outboundBuses}
                  selectedBusId={selectedOutboundBus?.id}
                  onSelect={setSelectedOutboundBus}
                />

                {/* 帰りの便リスト表示（往復のみ） */}
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

            {/* 下部ナビゲーションボタン */}
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

/**
 * リスト表示用のサブコンポーネント
 * 便の選択肢をボタン形式で一覧表示する
 */
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
                {/* 時刻表示（出発・到着） */}
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
                {/* 空席状況（残数が少ない場合は赤字で表示） */}
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