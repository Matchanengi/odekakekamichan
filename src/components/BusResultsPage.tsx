import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface Bus {
  id: number;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  totalSeats: number;
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
  onBack: () => void;
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
  }) => void;
}

export function BusResultsPage({ searchData, onBack, onConfirm }: BusResultsPageProps) {
  const [selectedOutboundBus, setSelectedOutboundBus] = useState<Bus | null>(null);
  const [selectedReturnBus, setSelectedReturnBus] = useState<Bus | null>(null);

  // 指定時刻から30分前後のバス候補を生成
  const generateBuses = (targetTime: string): Bus[] => {
    const [hourStr, minuteStr] = targetTime.split(':');
    const hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    const buses: Bus[] = [];
    const timeOffsets = [-30, -15, 0, 15, 30]; // 前後30分の候補
    
    timeOffsets.forEach((offset, index) => {
      const totalMinutes = hour * 60 + minute + offset;
      const busHour = Math.floor(totalMinutes / 60) % 24;
      const busMinute = totalMinutes % 60;
      
      const departureTime = `${String(busHour).padStart(2, '0')}:${String(busMinute).padStart(2, '0')}`;
      const arrivalTimeMinutes = totalMinutes + 25; // 所要時間25分と仮定
      const arrivalHour = Math.floor(arrivalTimeMinutes / 60) % 24;
      const arrivalMinute = arrivalTimeMinutes % 60;
      const arrivalTime = `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}`;
      
      buses.push({
        id: index + 1,
        departureTime,
        arrivalTime,
        availableSeats: Math.floor(Math.random() * 8) + 2, // 2-9席
        totalSeats: 10,
      });
    });
    
    return buses;
  };

  const outboundBuses = generateBuses(searchData.outboundTime);
  const returnBuses = searchData.returnTime ? generateBuses(searchData.returnTime) : [];

  const handleConfirm = () => {
    if (searchData.tripType === '片道' && selectedOutboundBus) {
      onConfirm({
        line: searchData.line,
        departure: searchData.departure,
        arrival: searchData.arrival,
        tripType: '片道',
        date: searchData.outboundDate,
        time: `${selectedOutboundBus.departureTime.split(':')[0]}時 ${selectedOutboundBus.departureTime.split(':')[1]}分`,
        departureTime: selectedOutboundBus.departureTime,
        arrivalTime: selectedOutboundBus.arrivalTime,
        adults: searchData.adults,
        children: searchData.children,
      });
    } else if (searchData.tripType === '往復' && selectedOutboundBus && selectedReturnBus) {
      onConfirm({
        line: searchData.line,
        departure: searchData.departure,
        arrival: searchData.arrival,
        tripType: '往復',
        date: searchData.outboundDate,
        time: `${selectedOutboundBus.departureTime.split(':')[0]}時 ${selectedOutboundBus.departureTime.split(':')[1]}分`,
        departureTime: selectedOutboundBus.departureTime,
        arrivalTime: selectedOutboundBus.arrivalTime,
        returnDate: searchData.returnDate,
        returnTime: `${selectedReturnBus.departureTime.split(':')[0]}時 ${selectedReturnBus.departureTime.split(':')[1]}分`,
        returnDepartureTime: selectedReturnBus.departureTime,
        returnArrivalTime: selectedReturnBus.arrivalTime,
        adults: searchData.adults,
        children: searchData.children,
      });
    }
  };

  const isConfirmDisabled = 
    (searchData.tripType === '片道' && !selectedOutboundBus) ||
    (searchData.tripType === '往復' && (!selectedOutboundBus || !selectedReturnBus));

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-6">バス候補</h1>

            <div className="mb-8">
              <p className="text-blue-900 mb-4">路線: {searchData.line}</p>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-blue-900">{searchData.departure}</span>
                <ArrowRight className="text-cyan-400" size={32} />
                <span className="text-blue-900">{searchData.arrival}</span>
              </div>
              <p className="text-blue-900">人数: おとな{searchData.adults}人 / こども{searchData.children}人</p>
            </div>

            {/* 行きのバス候補 */}
            <div className="mb-8">
              <h2 className="text-xl text-blue-900 mb-4">行き ({searchData.outboundDate})</h2>
              <div className="space-y-3">
                {outboundBuses.map((bus) => (
                  <button
                    key={bus.id}
                    onClick={() => setSelectedOutboundBus(bus)}
                    className={`w-full p-4 rounded-xl border-2 transition-colors ${
                      selectedOutboundBus?.id === bus.id
                        ? 'border-cyan-400 bg-cyan-50'
                        : 'border-gray-300 bg-white hover:border-cyan-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-6">
                        <div className="text-left">
                          <div className="text-sm text-gray-600">出発</div>
                          <div className="text-xl">{bus.departureTime}</div>
                        </div>
                        <ArrowRight className="text-cyan-400" size={24} />
                        <div className="text-left">
                          <div className="text-sm text-gray-600">到着</div>
                          <div className="text-xl">{bus.arrivalTime}</div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-sm text-gray-600">空席</div>
                        <div className={`text-lg ${bus.availableSeats < 3 ? 'text-red-600' : 'text-green-600'}`}>
                          {bus.availableSeats}/{bus.totalSeats}席
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 帰りのバス候補（往復の場合のみ表示） */}
            {searchData.tripType === '往復' && searchData.returnDate && (
              <div className="mb-8">
                <h2 className="text-xl text-blue-900 mb-4">帰り ({searchData.returnDate})</h2>
                <div className="space-y-3">
                  {returnBuses.map((bus) => (
                    <button
                      key={bus.id}
                      onClick={() => setSelectedReturnBus(bus)}
                      className={`w-full p-4 rounded-xl border-2 transition-colors ${
                        selectedReturnBus?.id === bus.id
                          ? 'border-cyan-400 bg-cyan-50'
                          : 'border-gray-300 bg-white hover:border-cyan-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-6">
                          <div className="text-left">
                            <div className="text-sm text-gray-600">出発</div>
                            <div className="text-xl">{bus.departureTime}</div>
                          </div>
                          <ArrowRight className="text-cyan-400" size={24} />
                          <div className="text-left">
                            <div className="text-sm text-gray-600">到着</div>
                            <div className="text-xl">{bus.arrivalTime}</div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-sm text-gray-600">空席</div>
                          <div className={`text-lg ${bus.availableSeats < 3 ? 'text-red-600' : 'text-green-600'}`}>
                            {bus.availableSeats}/{bus.totalSeats}席
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ボタン */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <button
                onClick={onBack}
                className="w-full sm:w-auto bg-gray-400 text-white px-12 py-3 rounded-lg hover:bg-gray-500 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
                className={`w-full sm:w-auto px-12 py-3 rounded-lg transition-colors ${
                  isConfirmDisabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
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