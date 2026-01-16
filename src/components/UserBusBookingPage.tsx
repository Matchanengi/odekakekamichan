import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from './supabaseClient';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = ['00', '10', '20', '30', '40', '50'];

interface UserBusBookingPageProps {
  onShowRouteMap?: () => void;
  onShowBusResults?: (searchData: //{
     any
  //   line: string;
  //   departure: string;
  //   arrival: string;
  //   tripType: '片道' | '往復';
  //   outboundDate: string;
  //   outboundTime: string;
  //   returnDate?: string;
  //   returnTime?: string;
  //   adults: number;
  //   children: number;
  // }
  ) => void;
  initialData?: any; // 戻り時のデータを受け取る
}

export function UserBusBookingPage({ onShowRouteMap, onShowBusResults, initialData }: UserBusBookingPageProps) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentHour = String(now.getHours()).padStart(2, '0');
  const roundedMinutes = Math.ceil(now.getMinutes() / 10) * 10;
  const currentMinute = String(roundedMinutes === 60 ? 50 : roundedMinutes).padStart(2, '0');

  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>(
    initialData?.tripType === '往復' ? 'round-trip' : 'one-way'
  );
  const [selectedLine, setSelectedLine] = useState(initialData?.line || '町田線');
  const [departureLocation, setDepartureLocation] = useState(initialData?.departure || '');
  const [arrivalLocation, setArrivalLocation] = useState(initialData?.arrival || '');
  
 // 出発情報（時刻は "HH:MM" 形式で来ると想定して split する）
  const initOutboundTime = initialData?.outboundTime?.split(':') || [currentHour, currentMinute];
  const [outboundDate, setOutboundDate] = useState(initialData?.outboundDate || today);
  const [outboundHour, setOutboundHour] = useState(initOutboundTime[0]);
  const [outboundMinute, setOutboundMinute] = useState(initOutboundTime[1]);
  
  // 帰り情報
  const initReturnTime = initialData?.returnTime?.split(':') || [currentHour, currentMinute];
  const [returnDate, setReturnDate] = useState(initialData?.returnDate || today);
  const [returnHour, setReturnHour] = useState(initReturnTime[0]);
  const [returnMinute, setReturnMinute] = useState(initReturnTime[1]);
  
  const [adults, setAdults] = useState(initialData?.adults || 1);
  const [children, setChildren] = useState(initialData?.children || 0);

  const [busLines, setBusLines] = useState<string[]>([]);
  const [availableStops, setAvailableStops] = useState<{id: any, name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  // 日時比較用のロジック
  const outboundFullDate = new Date(`${outboundDate}T${outboundHour}:${outboundMinute}`);
  const returnFullDate = new Date(`${returnDate}T${returnHour}:${returnMinute}`);
  
  // 往復かつ、帰りが行きより前（または同時）であればエラー
  const isTimeError = tripType === 'round-trip' && returnFullDate < outboundFullDate;

  // 戻ってきたときに、選択されていた路線の「停留所リスト」を自動で読み込む
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // (A) まず、すべての「バス路線」を取得してプルダウンを埋める
        const { data: routeList, error: routeError } = await supabase
          .from('バス路線')
          .select('route_name');

        if (routeError) throw routeError;
        if (routeList) {
          setBusLines(routeList.map(item => item.route_name));
        }

        // (B) initialDataがある場合、またはデフォルトの路線がある場合、その停留所を取得
        const lineToFetch = initialData?.line || selectedLine;
        if (lineToFetch) {
          // 第二引数をtrueにして、戻り時のリセットを防止
          await handleLineChange(lineToFetch, !!initialData);
        }
      } catch (error) {
        console.error('初期データの取得に失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // 路線が変更されたときの処理
  const handleLineChange = async (lineName: string, keepsSelection = false) => {
    setSelectedLine(lineName);
    // 初めての入力時（isInitialLoadがfalse）のみ、選択をリセット
    if (!keepsSelection) {
      setDepartureLocation('');
      setArrivalLocation('');
    }

    if (!lineName) {
      setAvailableStops([]);
      return;
    }

    setLoading(true);
    try {
      // 選択された「路線名」から「路線ID」を取得
      const { data: routeData } = await supabase
        .from('バス路線')
        .select('route_id')
        .eq('route_name', lineName)
        .single();

      if (routeData) {
        // route_id_1から4 のいずれかに一致する停留所を取得
        const { data, error } = await supabase
          .from('停留所')
          .select('stop_id, stop_name')
          .or(`route_id_1.eq.${routeData.route_id},route_id_2.eq.${routeData.route_id},route_id_3.eq.${routeData.route_id},route_id_4.eq.${routeData.route_id},route_id_5.eq.${routeData.route_id},route_id_6.eq.${routeData.route_id}`);

        if (error) throw error;
        if (data) {
          // ここで型を合わせるためにデータを変換する
          const formattedStops = data.map((item) => ({
            id: item.stop_id,    // stop_id を id に入れる
            name: item.stop_name // stop_name を name に入れる
          }));  
            setAvailableStops(formattedStops);
            // 戻り時の場合、Propsの値を再度セット（Stateの更新タイミングを合わせるため）
            if (keepsSelection && initialData) {
              setDepartureLocation(initialData.departure);
              setArrivalLocation(initialData.arrival);
            }
        } else {
            setAvailableStops([]);
        }        
      }
    } catch (err) {
      console.error("UserBusBookingPage:停留所の取得に失敗しました", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cyan-400 rounded-3xl p-4 sm:p-8 mx-4 my-6">
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-6 text-blue-600">バス予約</h2>
        
        <div className="mb-6">
          <p className="text-blue-600 mb-2">市営バスの予約をします</p>
          <p className="text-blue-600 text-sm">目的地が表示されない場合はタクシー等の他の公共交通機関をお使いください</p>
        </div>

        {/* Line Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <span className="text-lg">路線</span>
            <select
              value={selectedLine}
              onChange={(e) => handleLineChange(e.target.value)}
              className="flex-1 border-2 border-black rounded-lg px-4 py-2 bg-white"
            >
              {busLines.map((line) => (
                <option key={line} value={line}>{line}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Departure and Arrival Location */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[250px]">
            <span className="bg-cyan-400 text-white px-6 py-2 rounded-lg">乗車地</span>
            <select
              value={departureLocation}
              onChange={(e) => setDepartureLocation(e.target.value)}
              className="flex-1 border-2 border-black rounded-lg px-4 py-2 bg-white"
              disabled={loading} // 読み込み中は操作不能にする
            >
              <option value="">{loading ? "読み込み中..." : "選択してください"}</option>
              {availableStops.map((stop) => (
                // keyにはID、表示とvalueには名前（またはID）を使用
                <option key={stop.id} value={stop.name}>
                  {stop.name}
                </option>
              ))}
            </select>
          </div>
          
          <ArrowRight className="text-cyan-400 hidden sm:block" size={40} strokeWidth={3} />
          
          <div className="flex items-center gap-2 flex-1 min-w-[250px]">
            <span className="bg-cyan-400 text-white px-6 py-2 rounded-lg">降車地</span>
            <select
              value={arrivalLocation}
              onChange={(e) => setArrivalLocation(e.target.value)}
              className="flex-1 border-2 border-black rounded-lg px-4 py-2 bg-white"
            >
              <option value="">選択してください</option>
              {availableStops.map((stop) => (
                <option key={stop.id} value={stop.name}>{stop.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Trip Type Tabs and Date/Time Selection */}
        <div className="bg-gray-300 rounded-2xl p-6 mb-6">
          {/* Trip Type Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTripType('one-way')}
              className={`px-8 py-2 rounded-lg transition-colors ${
                tripType === 'one-way'
                  ? 'bg-gray-400 text-black'
                  : 'bg-white text-black'
              }`}
            >
              片道
            </button>
            <button
              onClick={() => setTripType('round-trip')}
              className={`px-8 py-2 rounded-lg transition-colors ${
                tripType === 'round-trip'
                  ? 'bg-gray-400 text-black'
                  : 'bg-white text-black'
              }`}
            >
              往復
            </button>
          </div>

          {/* ★追加：エラーメッセージの表示 */}
          {isTimeError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl">
              <p className="text-red-600 font-bold text-center">
                【ご注意】帰りの時刻が行きの出発時刻より前の時間に設定されています。
              </p>
            </div>
          )}
          
          {/* Outbound Date and Time Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="min-w-[60px]">日付</span>
              <input
                type="date"
                value={outboundDate}
                onChange={(e) => setOutboundDate(e.target.value)}
                //placeholder="YYYYMMDD"
                className="flex-1 min-w-[200px] border-2 border-black rounded-lg px-4 py-2 bg-white"
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <span className="min-w-[60px]">時刻</span>
              <div className="flex items-center gap-2">
                <select
                  value={outboundHour}
                  onChange={(e) => setOutboundHour(e.target.value)}
                  className="border-2 border-black rounded-lg px-4 py-2 bg-white"
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>{h}時</option>
                  ))}
                </select>
                <select
                  value={outboundMinute}
                  onChange={(e) => setOutboundMinute(e.target.value)}
                  className="border-2 border-black rounded-lg px-4 py-2 bg-white"
                >
                  {minutes.map((m) => (
                    <option key={m} value={m}>{m}分</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Return Trip Section (only shown for round-trip) */}
          {tripType === 'round-trip' && (
            <>
              {/* Dotted Divider */}
              <div className="my-6 border-t-2 border-dotted border-gray-500"></div>

              {/* Return Date and Time Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="min-w-[60px]">日付</span>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    //placeholder="YYYYMMDD"
                    className="flex-1 min-w-[200px] border-2 border-black rounded-lg px-4 py-2 bg-white"
                  />
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <span className="min-w-[60px]">時刻</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={returnHour}
                      onChange={(e) => setReturnHour(e.target.value)}
                      className="border-2 border-black rounded-lg px-4 py-2 bg-white"
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>{h}時</option>
                      ))}
                    </select>
                    <select
                      value={returnMinute}
                      onChange={(e) => setReturnMinute(e.target.value)}
                      className="border-2 border-black rounded-lg px-4 py-2 bg-white"
                    >
                      {minutes.map((m) => (
                        <option key={m} value={m}>{m}分</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Number of Passengers */}
        <div className="mb-6">
          <div className="text-lg mb-3">人数</div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span>おとな</span>
              <input
                type="text"
                value={`${adults}人`}
                readOnly
                onClick={() => {
                  const num = prompt('おとなの人数を入力してください（0-9）', adults.toString());
                  if (num !== null && !isNaN(parseInt(num))) {
                    const parsed = Math.max(0, Math.min(9, parseInt(num)));
                    setAdults(parsed);
                  }
                }}
                className="w-[80px] border-2 border-black rounded-lg px-3 py-2 bg-white text-center cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>こども</span>
              <input
                type="text"
                value={`${children}人`}
                readOnly
                onClick={() => {
                  const num = prompt('こどもの人数を入力してください（0-9）', children.toString());
                  if (num !== null && !isNaN(parseInt(num))) {
                    const parsed = Math.max(0, Math.min(9, parseInt(num)));
                    setChildren(parsed);
                  }
                }}
                className="w-[80px] border-2 border-black rounded-lg px-3 py-2 bg-white text-center cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="mb-6 text-blue-600 text-sm">
          <p>※こどもの区分は12歳以下です。</p>
          <p>体に障害があり、お手伝いを必要とする方は営業所にもいますぐご連絡ください</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          <button
            className="flex-1 min-w-[200px] bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => {
              if (onShowBusResults) {
                onShowBusResults({
                  line: selectedLine,
                  departure: departureLocation,
                  arrival: arrivalLocation,
                  tripType: tripType === 'one-way' ? '片道' : '往復',
                  outboundDate: outboundDate,
                  outboundTime: `${outboundHour}:${outboundMinute}`,
                  returnDate: tripType === 'round-trip' ? returnDate : undefined,
                  returnTime: tripType === 'round-trip' ? `${returnHour}:${returnMinute}` : undefined,
                  adults: adults,
                  children: children,
                });
              }
            }}
          >
            候補を検索
          </button>
          <button
            className="flex-1 min-w-[200px] bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onShowRouteMap}
          >
            路線図表示
          </button>
        </div>
      </div>
    </div>
  );
}