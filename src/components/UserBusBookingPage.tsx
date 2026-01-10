import { useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";

// 停留所データ（路線情報を含む）
const busStops = [
  { id: 1, name: '山田駅前', line: '町田線' },
  { id: 2, name: '下ノ村', line: '町田線' },
  { id: 3, name: '山田駅前', line: 'やまださくら線' },
  { id: 4, name: '宮ノ下', line: 'やまださくら線' },
];

const busLines = ['町田線', 'やまださくら線'];

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
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [selectedLine, setSelectedLine] = useState('町田線');
  const [departureLocation, setDepartureLocation] = useState('');
  const [arrivalLocation, setArrivalLocation] = useState('');
  
  // Outbound trip
  const [outboundDate, setOutboundDate] = useState('2025-11-20');
  const [outboundHour, setOutboundHour] = useState('12');
  const [outboundMinute, setOutboundMinute] = useState('00');
  
  // Return trip
  const [returnDate, setReturnDate] = useState('2025-11-20');
  const [returnHour, setReturnHour] = useState('12');
  const [returnMinute, setReturnMinute] = useState('00');
  
  // 日付入力の自動フォーマット関数
  const handleDateInput = (value: string) => {
    // 数字のみを抽出
    const numbers = value.replace(/[^\d]/g, '');
    
    // 8桁以上なら自動でフォーマット
    if (numbers.length >= 8) {
      const year = numbers.slice(0, 4);
      const month = numbers.slice(4, 6);
      const day = numbers.slice(6, 8);
      return `${year}-${month}-${day}`;
    } else if (numbers.length >= 6) {
      const year = numbers.slice(0, 4);
      const month = numbers.slice(4, 6);
      const day = numbers.slice(6);
      return `${year}-${month}-${day}`;
    } else if (numbers.length >= 4) {
      const year = numbers.slice(0, 4);
      const month = numbers.slice(4);
      return `${year}-${month}`;
    }
    
    return numbers;
  };
  
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // ���択された路線の停留所のみをフィルタリング
  const availableStops = useMemo(() => {
    return busStops.filter(stop => stop.line === selectedLine).map(stop => stop.name);
  }, [selectedLine]);

  // 路線が変更されたら停留所をリセット
  const handleLineChange = (line: string) => {
    setSelectedLine(line);
    setDepartureLocation('');
    setArrivalLocation('');
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
            >
              <option value="">選択してください</option>
              {availableStops.map((stop) => (
                <option key={stop} value={stop}>{stop}</option>
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
                <option key={stop} value={stop}>{stop}</option>
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
                type="text"
                value={outboundDate}
                onChange={(e) => setOutboundDate(handleDateInput(e.target.value))}
                placeholder="YYYYMMDD"
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
                    type="text"
                    value={returnDate}
                    onChange={(e) => setReturnDate(handleDateInput(e.target.value))}
                    placeholder="YYYYMMDD"
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
          <p>体に障害があり、お手伝いを必要とする方は営業所にもあますぐご連絡ください</p>
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