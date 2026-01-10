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
        <div className="bg-cyan-400 rounded-[3rem] p-4 sm:p-8">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-12">
            <h1 className="text-xl sm:text-2xl text-blue-900 mb-6">バス予約</h1>

            <div className="mb-8">
              <p className="text-sm sm:text-base text-blue-900 mb-2">市営バスの予約をします</p>
              <p className="text-sm sm:text-base text-blue-900">目的地が表示されない場合はタクシー等の他の公共交通機関をお使いください</p>
            </div>

            {/* 乗車地・降車地 */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-400 text-white px-4 sm:px-6 py-2 rounded-lg min-w-[80px] sm:min-w-[100px] text-center text-sm sm:text-base">
                  乗車
                </div>
                <div className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                  {bookingData.departure}
                </div>
              </div>
              
              <div className="flex justify-center">
                <div className="text-cyan-400 text-3xl">↓</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-cyan-400 text-white px-4 sm:px-6 py-2 rounded-lg min-w-[80px] sm:min-w-[100px] text-center text-sm sm:text-base">
                  降車地
                </div>
                <div className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                  {bookingData.arrival}
                </div>
              </div>
            </div>

            {/* 片道・往復 */}
            <div className="flex gap-2 mb-6">
              <button 
                className={`px-6 sm:px-8 py-2 rounded-lg text-sm sm:text-base ${
                  bookingData.tripType === '片道' 
                    ? 'bg-gray-300 text-black' 
                    : 'bg-white border-2 border-gray-300 text-black'
                }`}
              >
                片道
              </button>
              <button 
                className={`px-6 sm:px-8 py-2 rounded-lg text-sm sm:text-base ${
                  bookingData.tripType === '往復' 
                    ? 'bg-cyan-400 text-white' 
                    : 'bg-white border-2 border-gray-300 text-black'
                }`}
              >
                往復
              </button>
            </div>

            {/* 日時 */}
            <div className="bg-gray-200 rounded-2xl p-4 sm:p-6 mb-6">
              <div className="mb-4">
                <div className="text-sm sm:text-base text-gray-700 mb-3">日時</div>
                <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-3 mb-3 text-sm sm:text-base">
                  {bookingData.date}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                    {bookingData.time.split(' ')[0]}
                  </div>
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                    {bookingData.time.split(' ')[1]}
                  </div>
                  <div className="bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm sm:text-base">
                    行き
                  </div>
                </div>
              </div>

              {bookingData.returnDate && bookingData.returnTime && (
                <div className="border-t-2 border-dotted border-gray-400 pt-4">
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-3 mb-3 text-sm sm:text-base">
                    {bookingData.returnDate}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                      {bookingData.returnTime.split(' ')[0]}
                    </div>
                    <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                      {bookingData.returnTime.split(' ')[1]}
                    </div>
                    <div className="bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm sm:text-base">
                      帰り
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 人数 */}
            <div className="mb-8">
              <div className="text-sm sm:text-base text-gray-700 mb-3">人数</div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">おとな</span>
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base min-w-[60px] text-center">
                    {bookingData.adults}人
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">こども</span>
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base min-w-[60px] text-center">
                    {bookingData.children}人
                  </div>
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex flex-col gap-4">
              <button
                onClick={onBack}
                className="w-full bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
              >
                戻る
              </button>
              <button
                onClick={onConfirm}
                className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
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