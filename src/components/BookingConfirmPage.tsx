import { ArrowRight } from 'lucide-react';

interface BookingConfirmPageProps {
  onBack: () => void;
  onConfirm: () => void;
  bookingData: {
    line?: string;
    departure: string;
    arrival: string;
    tripType: '片道' | '往復';
    date: string;
    time: string;
    departureTime?: string;
    arrivalTime?: string;
    returnDate?: string;
    returnTime?: string;
    returnDepartureTime?: string;
    returnArrivalTime?: string;
    adults: number;
    children: number;
  };
}

export function BookingConfirmPage({ onBack, onConfirm, bookingData }: BookingConfirmPageProps) {
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-6">バス予約</h1>

            <div className="mb-8">
              <p className="text-blue-900 mb-2">市営バスの予約をします</p>
              <p className="text-blue-900">目的地が表示されない場合はタクシー等の他の公共交通機関をお使いください</p>
            </div>

            {/* 路線情報 */}
            {bookingData.line && (
              <div className="mb-6">
                <div className="bg-cyan-50 border-2 border-cyan-400 rounded-2xl p-6">
                  <p className="text-blue-900 mb-2"><span className="font-semibold">路線:</span> {bookingData.line}</p>
                </div>
              </div>
            )}

            {/* 乗車地・降車地 */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center border-2 border-blue-900 rounded-full overflow-hidden">
                <div className="bg-cyan-400 text-blue-900 px-6 py-3">乗車地</div>
                <div className="bg-white text-blue-900 px-8 py-3">{bookingData.departure}</div>
              </div>
              <ArrowRight className="text-cyan-400" size={40} />
              <div className="flex items-center border-2 border-blue-900 rounded-full overflow-hidden">
                <div className="bg-cyan-400 text-blue-900 px-6 py-3">降車地</div>
                <div className="bg-white text-blue-900 px-8 py-3">{bookingData.arrival}</div>
              </div>
            </div>

            {/* 片道・往復、日時 */}
            <div className="bg-gray-200 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <button 
                  className={`px-8 py-3 rounded-full border-2 border-blue-900 ${
                    bookingData.tripType === '片道' 
                      ? 'bg-gray-300 text-blue-900' 
                      : 'bg-white text-blue-900'
                  }`}
                >
                  片道
                </button>
                <button 
                  className={`px-8 py-3 rounded-full border-2 border-blue-900 ${
                    bookingData.tripType === '往復' 
                      ? 'bg-gray-300 text-blue-900' 
                      : 'bg-white text-blue-900'
                  }`}
                >
                  往復
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-blue-900 min-w-[80px]">日時</span>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="bg-white border-2 border-blue-900 rounded-lg px-6 py-2">
                    {bookingData.date}
                  </div>
                  <div className="bg-white border-2 border-blue-900 rounded-lg px-4 py-2">
                    {bookingData.time.split(' ')[0]}
                  </div>
                  <div className="bg-white border-2 border-blue-900 rounded-lg px-4 py-2">
                    {bookingData.time.split(' ')[1]}
                  </div>
                </div>
              </div>

              {bookingData.returnDate && bookingData.returnTime && (
                <div className="flex items-center gap-4 mt-6 flex-wrap">
                  <span className="text-blue-900 min-w-[80px]">帰還日時</span>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="bg-white border-2 border-blue-900 rounded-lg px-6 py-2">
                      {bookingData.returnDate}
                    </div>
                    <div className="bg-white border-2 border-blue-900 rounded-lg px-4 py-2">
                      {bookingData.returnTime.split(' ')[0]}
                    </div>
                    <div className="bg-white border-2 border-blue-900 rounded-lg px-4 py-2">
                      {bookingData.returnTime.split(' ')[1]}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 選択したバス情報 */}
            {bookingData.departureTime && bookingData.arrivalTime && (
              <div className="mb-8">
                <h2 className="text-xl text-blue-900 mb-4">選択したバス</h2>
                
                {/* 行きのバス */}
                <div className="bg-cyan-50 border-2 border-cyan-400 rounded-2xl p-6 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div>
                        <div className="text-sm text-gray-600">出発時刻</div>
                        <div className="text-2xl text-blue-900">{bookingData.departureTime}</div>
                      </div>
                      <ArrowRight className="text-cyan-400" size={32} />
                      <div>
                        <div className="text-sm text-gray-600">到着時刻</div>
                        <div className="text-2xl text-blue-900">{bookingData.arrivalTime}</div>
                      </div>
                    </div>
                    <div className="text-blue-900 bg-white px-4 py-2 rounded-lg border-2 border-blue-900">
                      行き
                    </div>
                  </div>
                </div>

                {/* 帰りのバス（往復の場合） */}
                {bookingData.returnDepartureTime && bookingData.returnArrivalTime && (
                  <div className="bg-cyan-50 border-2 border-cyan-400 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <div>
                          <div className="text-sm text-gray-600">出発時刻</div>
                          <div className="text-2xl text-blue-900">{bookingData.returnDepartureTime}</div>
                        </div>
                        <ArrowRight className="text-cyan-400" size={32} />
                        <div>
                          <div className="text-sm text-gray-600">到着時刻</div>
                          <div className="text-2xl text-blue-900">{bookingData.returnArrivalTime}</div>
                        </div>
                      </div>
                      <div className="text-blue-900 bg-white px-4 py-2 rounded-lg border-2 border-blue-900">
                        帰り
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 人数 */}
            <div className="flex items-center gap-8 mb-12">
              <span className="text-blue-900">人数</span>
              <div className="flex items-center gap-4">
                <span className="text-blue-900">おとな</span>
                <div className="bg-white border-2 border-blue-900 rounded-lg px-6 py-2">
                  {bookingData.adults}人
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-blue-900">こども</span>
                <div className="bg-white border-2 border-blue-900 rounded-lg px-6 py-2">
                  {bookingData.children}人
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="bg-green-500 text-white px-12 py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={onConfirm}
                className="bg-blue-600 text-white px-12 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                予約確定
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}