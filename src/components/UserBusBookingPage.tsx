import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from './supabaseClient';
//import { FormItem } from "./ui/form";
// const busStops = [
//     { id: 1, name: '山田駅前', line: '町田線' },
//     { id: 2, name: '下ノ村', line: '町田線' },
//     { id: 3, name: '山田駅前', line: 'やまださくら線' },
//     { id: 4, name: '宮ノ下', line: 'やまださくら線' },
//   ];
// 時間と分の選択肢を生成
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = ['00', '10', '20', '30', '40', '50'];

interface UserBusBookingPageProps {
  onShowRouteMap?: () => void;
  onShowBusResults?: (searchData: {
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
  }) => void;
}

export function UserBusBookingPage({ onShowRouteMap, onShowBusResults }: UserBusBookingPageProps) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentHour = String(now.getHours()).padStart(2, '0');
  const roundedMinutes = Math.ceil(now.getMinutes() / 10) * 10;
  const currentMinute = String(roundedMinutes === 60 ? 50 : roundedMinutes).padStart(2, '0');
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [selectedLine, setSelectedLine] = useState('町田線');
  const [departureLocation, setDepartureLocation] = useState('');
  const [arrivalLocation, setArrivalLocation] = useState('');
  
  // Outbound trip
  const [outboundDate, setOutboundDate] = useState(today);
  const [outboundHour, setOutboundHour] = useState(currentHour);
  const [outboundMinute, setOutboundMinute] = useState(currentMinute);
  
  // Return trip
  const [returnDate, setReturnDate] = useState(today);
  const [returnHour, setReturnHour] = useState(currentHour);
  const [returnMinute, setReturnMinute] = useState(currentMinute);
  
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [availableStops, setAvailableStops] = useState<{id: any, name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  // 路線が変更されたときの処理
  const handleLineChange = async (lineName: string) => {
    setSelectedLine(lineName);
    setDepartureLocation('');
    setArrivalLocation('');

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
          .or(`route_id_1.eq.${routeData.route_id},route_id_2.eq.${routeData.route_id},route_id_3.eq.${routeData.route_id},route_id_4.eq.${routeData.route_id}`);

        if (error) throw error;
        if (data) {
          // ここで型を合わせるためにデータを変換する
          const formattedStops = data.map((item) => ({
            id: item.stop_id,    // stop_id を id に入れる
            name: item.stop_name // stop_name を name に入れる
          }));  
            setAvailableStops(formattedStops);
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
  const [busLines, setBusLines] = useState<string[]>([]);
  // const busLines = ['町田線', 'やまださくら線'];
  //const [busStops, setBusStops] = useState([]);  
  
  function BusLineList() {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const fetchBusLines = async () => {
        console.log("UserBusBookingPage:取得開始..."); // 動いているか確認
        try{
          setLoading(true);
          //supabaseからデータ取得
          const{ data, error } = await supabase
          .from('バス路線')          
          .select('route_name');

          if (error) throw error;
          console.log("UserBusBookingPage:バス路線取得データ:", data); // 取得確認用
          if (data) {
            //データ整形
            const lineArray = data.map((item) => item.route_name);
            setBusLines(lineArray);    
          }      
        } catch (error) {
          console.error('Error fetching bus Lines:', error);        
        } finally {
          setLoading(false);
        }
      };

      fetchBusLines();
    }, []);
    if (loading) return <div>読み込み中...</div>;

    return (
      <ul>
        {busLines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    );
  }
  BusLineList();

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