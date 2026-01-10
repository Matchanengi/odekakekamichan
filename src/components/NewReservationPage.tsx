import { useState } from "react";
import { ChevronDown } from "lucide-react";

type MainPage =
  | "top"
  | "reservations"
  | "new-reservation"
  | "notifications"
  | "member";

interface NewReservationPageProps {
  onNavigate: (page: MainPage) => void;
}

export function NewReservationPage({
  onNavigate,
}: NewReservationPageProps) {
  const [rideDate, setRideDate] = useState("2025-11-18");
  
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
  
  const [route, setRoute] = useState("蕨野線");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedTime, setSelectedTime] = useState("09:30");
  const [boardingLocation, setBoardingLocation] =
    useState("山田駅");
  const [dropoffLocation, setDropoffLocation] =
    useState("izuみの広場");
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [representativeName, setRepresentativeName] =
    useState("山田　太郎");
  const [phoneNumber, setPhoneNumber] =
    useState("090-1234-5678");
  const [notes, setNotes] = useState(
    "電話にて予約受付（担当：佐藤）",
  );

  const schedules = [
    {
      time: "09:30",
      from: "山田駅",
      to: "izuみの広場",
      available: 5,
      total: 10,
    },
    {
      time: "11:00",
      from: "山田駅",
      to: "izuみの広場",
      available: 8,
      total: 10,
    },
    {
      time: "13:30",
      from: "山田駅",
      to: "izuみの広場",
      available: 0,
      total: 10,
      full: true,
    },
  ];

  return (
    <div className="bg-green-700 rounded-3xl p-3 sm:p-8">
      <div className="bg-white rounded-3xl p-3 sm:p-8">
        <div className="flex flex-col md:flex-row">
          {/* Left Sidebar */}
          <aside className="w-full md:w-64 md:pr-8 mb-4 md:mb-0">
            <div className="space-y-4 flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-4">
              <button
                onClick={() => onNavigate("reservations")}
                className="w-full bg-green-700 text-white py-4 md:py-6 px-4 md:px-6 rounded-2xl border-4 border-white text-center text-lg md:text-xl"
              >
                <div className="leading-tight">予約管理</div>
              </button>
              <button
                onClick={() => onNavigate("new-reservation")}
                className="w-full bg-white text-black py-4 md:py-6 px-4 md:px-6 rounded-2xl border-4 border-green-700 text-center text-lg md:text-xl"
              >
                <div className="leading-tight">新規予約</div>
                <div className="leading-tight">登録</div>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 max-h-[600px] overflow-y-auto md:pr-4">
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl">・新規予約登録</h2>
              <p className="text-xs sm:text-sm text-red-600">
                必須項目には * がついています
              </p>
            </div>

            {/* Section 1: 乗車便の選択 */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl mb-3 sm:mb-4">
                1. ご乗車便の選択
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg min-w-[100px] sm:min-w-[120px] text-sm sm:text-base text-center">
                    <span className="text-red-600">*</span>
                    乗車日
                  </div>
                  <input
                    type="text"
                    value={rideDate}
                    onChange={(e) =>
                      setRideDate(handleDateInput(e.target.value))
                    }
                    placeholder="YYYYMMDD"
                    className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 w-full sm:w-64 text-sm sm:text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg min-w-[100px] sm:min-w-[120px] text-sm sm:text-base text-center">
                    <span className="text-red-600">*</span>
                    路線名
                  </div>
                  <div className="relative w-full sm:w-64">
                    <select
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                      className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 w-full appearance-none bg-white text-sm sm:text-base"
                    >
                      <option>蕨野線</option>
                      <option>白川線</option>
                      <option>谷相線</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      size={20}
                    />
                  </div>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    （路線を選択）
                  </span>
                </div>

                <div>
                  <h4 className="mb-2 text-sm sm:text-base">
                    <span className="text-red-600">*</span>
                    時刻表 / 空席状況
                  </h4>
                  <div className="space-y-2">
                    {schedules.map((schedule) => (
                      <div
                        key={schedule.time}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4"
                      >
                        <input
                          type="checkbox"
                          checked={
                            selectedTime === schedule.time
                          }
                          onChange={() =>
                            setSelectedTime(schedule.time)
                          }
                          className="w-6 h-6 self-start sm:self-auto"
                          disabled={schedule.full}
                        />
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-1">
                          <div
                            className={`border-2 border-black rounded-lg px-3 sm:px-6 py-2 flex items-center gap-2 sm:gap-4 flex-1 text-sm sm:text-base ${schedule.full ? "bg-gray-200" : ""}`}
                          >
                            <span className="min-w-[60px] sm:min-w-[80px]">
                              {schedule.time} 発
                            </span>
                            <span>{schedule.from}</span>
                            <span>→</span>
                            <span>{schedule.to}</span>
                          </div>
                          <div
                            className={`border-2 border-black rounded-lg px-3 sm:px-4 py-2 min-w-[100px] text-center text-sm sm:text-base ${schedule.full ? "bg-gray-200" : ""}`}
                          >
                            <span
                              className={
                                schedule.full
                                  ? "text-red-600"
                                  : ""
                              }
                            >
                              空席：{schedule.available}/
                              {schedule.total}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: 人数と乗車場所の入力 */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl mb-3 sm:mb-4">
                2. 人数と乗車場所の入力
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                  <div className="text-sm sm:text-base">
                    <span className="text-red-600">*</span>人数
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">おとな</span>
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
                        className="w-[80px] border-2 border-black rounded-lg px-3 py-1 bg-white text-center cursor-pointer text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">こども</span>
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
                        className="w-[80px] border-2 border-black rounded-lg px-3 py-1 bg-white text-center cursor-pointer text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <div className="bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg min-w-[100px] sm:min-w-[120px] text-sm sm:text-base text-center">
                      <span className="text-red-600">*</span>
                      乗車場所
                    </div>
                    <div className="relative w-full sm:w-64">
                      <select
                        value={boardingLocation}
                        onChange={(e) =>
                          setBoardingLocation(e.target.value)
                        }
                        className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 w-full appearance-none bg-white text-sm sm:text-base"
                      >
                        <option>山田駅</option>
                        <option>中央公園</option>
                        <option>市役所前</option>
                      </select>
                      <ChevronDown
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        size={20}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <div className="bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg min-w-[100px] sm:min-w-[120px] text-sm sm:text-base text-center">
                      <span className="text-red-600">*</span>
                      降車場所
                    </div>
                    <div className="relative w-full sm:w-64">
                      <select
                        value={dropoffLocation}
                        onChange={(e) =>
                          setDropoffLocation(e.target.value)
                        }
                        className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 w-full appearance-none bg-white text-sm sm:text-base"
                      >
                        <option>izuみの広場</option>
                        <option>駅前ロータリー</option>
                        <option>商店街入口</option>
                      </select>
                      <ChevronDown
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        size={20}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base">往復</span>
                    <input
                      type="checkbox"
                      checked={isRoundTrip}
                      onChange={(e) =>
                        setIsRoundTrip(e.target.checked)
                      }
                      className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: お客様情報の入力 */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl mb-3 sm:mb-4">
                3. お客様情報の入力
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg min-w-[100px] sm:min-w-[120px] text-sm sm:text-base text-center">
                    <span className="text-red-600">*</span>
                    代表者名
                  </div>
                  <input
                    type="text"
                    value={representativeName}
                    onChange={(e) =>
                      setRepresentativeName(e.target.value)
                    }
                    className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 flex-1 text-sm sm:text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg min-w-[100px] sm:min-w-[120px] text-sm sm:text-base text-center">
                    <span className="text-red-600">*</span>
                    電話番号
                  </div>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value)
                    }
                    className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 flex-1 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm sm:text-base">
                    対応履歴メモ（任意）：
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 w-full h-24 sm:h-32 text-sm sm:text-base"
                    placeholder="電話にて予約受付（担当：佐藤）"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
              <button
                onClick={() => onNavigate("reservations")}
                className="bg-green-700 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg text-sm sm:text-base w-full sm:w-auto"
              >
                予約内容を登録する
              </button>
              <button
                onClick={() => onNavigate("reservations")}
                className="bg-white border-2 border-black px-8 sm:px-12 py-2 sm:py-3 rounded-lg text-red-600 text-sm sm:text-base w-full sm:w-auto"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}