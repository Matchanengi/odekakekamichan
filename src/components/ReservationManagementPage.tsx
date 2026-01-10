import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ReservationDetailModal } from "./ReservationDetailModal";
import { ReservationEditModal } from "./ReservationEditModal";

type MainPage =
  | "top"
  | "reservations"
  | "new-reservation"
  | "notifications"
  | "member";

interface ReservationManagementPageProps {
  onNavigate: (page: MainPage) => void;
}

export function ReservationManagementPage({
  onNavigate,
}: ReservationManagementPageProps) {
  const [startDate, setStartDate] = useState("2025-11-18");
  const [endDate, setEndDate] = useState("2025-11-18");
  
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
  
  const [route, setRoute] = useState("すべての路線");
  const [status, setStatus] = useState("承認待ち");
  const [selectedReservation, setSelectedReservation] =
    useState<number | null>(null);
  const [editReservation, setEditReservation] = useState<
    number | null
  >(null);

  const reservations = [
    {
      id: 1,
      status: "承認待ち",
      date: "25/11/18",
      route: "蕨野線",
      name: "山田 太郎",
      people: 2,
      statusColor: "text-yellow-600",
    },
    {
      id: 2,
      status: "確定",
      date: "25/11/18",
      route: "白川線",
      name: "鈴木 次郎",
      people: 3,
      statusColor: "text-green-600",
    },
    {
      id: 3,
      status: "キャンセル",
      date: "25/11/19",
      route: "谷相線",
      name: "高橋 三郎",
      people: 1,
      statusColor: "text-red-600",
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
                className="w-full bg-white text-black py-4 md:py-6 px-4 md:px-6 rounded-2xl border-4 border-green-700 text-center text-lg md:text-xl"
              >
                <div className="leading-tight">予約管理</div>
              </button>
              <button
                onClick={() => onNavigate("new-reservation")}
                className="w-full bg-green-700 text-white py-4 md:py-6 px-4 md:px-6 rounded-2xl border-4 border-white text-center text-lg md:text-xl"
              >
                <div className="leading-tight">新規予約</div>
                <div className="leading-tight">登録</div>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 max-h-[600px] overflow-y-auto">
            <h2 className="text-2xl sm:text-3xl mb-4 sm:mb-6">予約管理</h2>

            {/* Search Section */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl mb-3 sm:mb-4">・検索絞り込み</h3>
              <div className="space-y-3 sm:space-y-4">
                {/* Date Range */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg min-w-[90px] sm:min-w-[120px] text-sm sm:text-base text-center">
                      乗車日
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 sm:pl-[102px] md:pl-[136px]">
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) =>
                        setStartDate(handleDateInput(e.target.value))
                      }
                      placeholder="YYYYMMDD"
                      className="border-4 border-black rounded-lg px-3 sm:px-4 py-2 w-full sm:w-64 text-sm sm:text-base"
                    />
                    <span className="text-center sm:text-left">～</span>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(handleDateInput(e.target.value))}
                      placeholder="YYYYMMDD"
                      className="border-4 border-black rounded-lg px-3 sm:px-4 py-2 w-full sm:w-64 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Route */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg min-w-[90px] sm:min-w-[120px] text-sm sm:text-base text-center">
                    路線名
                  </div>
                  <div className="relative w-full sm:w-64">
                    <select
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                      className="border-4 border-black rounded-lg px-3 sm:px-4 py-2 w-full appearance-none bg-white text-sm sm:text-base"
                    >
                      <option>すべての路線</option>
                      <option>蕨野線</option>
                      <option>白川線</option>
                      <option>谷相線</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg min-w-[90px] sm:min-w-[120px] text-sm sm:text-base text-center">
                    ステータス
                  </div>
                  <div className="relative w-full sm:w-64">
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value)
                      }
                      className="border-4 border-black rounded-lg px-3 sm:px-4 py-2 w-full appearance-none bg-white text-sm sm:text-base"
                    >
                      <option>承認待ち</option>
                      <option>確定</option>
                      <option>キャンセル</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      size={20}
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-4 sm:ml-4">
                    <button className="bg-green-700 text-white px-6 sm:px-8 py-2 rounded-lg flex-1 sm:flex-none text-sm sm:text-base">
                      検索
                    </button>
                    <button className="bg-white border-2 border-black px-6 sm:px-8 py-2 rounded-lg flex-1 sm:flex-none text-sm sm:text-base">
                      クリア
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservations List */}
            <div>
              <h3 className="text-lg sm:text-xl mb-3 sm:mb-4">・予約一覧</h3>
              <div className="border-4 border-black rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-base sm:text-lg min-w-[700px]">
                    <thead>
                      <tr className="bg-green-700 text-white">
                        <th className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4">
                          ステータス
                        </th>
                        <th className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4">
                          乗車日
                        </th>
                        <th className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4">
                          路線名
                        </th>
                        <th className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4">
                          予約者名
                        </th>
                        <th className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4">
                          人数
                        </th>
                        <th className="py-3 sm:py-4 px-2 sm:px-4">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {reservations.map((reservation) => (
                        <tr
                          key={reservation.id}
                          className="border-t-4 border-black"
                        >
                          <td
                            className={`border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center ${reservation.statusColor}`}
                          >
                            {reservation.status}
                          </td>
                          <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center text-cyan-400">
                            {reservation.date}
                          </td>
                          <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                            {reservation.route}
                          </td>
                          <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                            {reservation.name}
                          </td>
                          <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center text-cyan-400">
                            {reservation.people} 名
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-4 text-center text-sm sm:text-base">
                            <span
                              className="text-blue-500 mr-2 sm:mr-4 cursor-pointer"
                              onClick={() =>
                                setSelectedReservation(
                                  reservation.id,
                                )
                              }
                            >
                              詳細
                            </span>
                            <span
                              className="text-red-600 cursor-pointer"
                              onClick={() =>
                                setEditReservation(reservation.id)
                              }
                            >
                              編集
                            </span>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-4 border-black">
                        <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                        <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                        <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                        <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                        <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                      </tr>
                      <tr className="border-t-4 border-black">
                        <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                        <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                        <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                        <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                        <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                        <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                          ：
                        </td>
                      </tr>
                      <tr className="border-t-4 border-black">
                        <td className="border-r-4 border-black py-4 sm:py-8 px-2 sm:px-4"></td>
                        <td className="border-r-4 border-black py-4 sm:py-8 px-2 sm:px-4"></td>
                        <td className="border-r-4 border-black py-4 sm:py-8 px-2 sm:px-4"></td>
                        <td className="border-r-4 border-black py-4 sm:py-8 px-2 sm:px-4"></td>
                        <td className="border-r-4 border-black py-4 sm:py-8 px-2 sm:px-4"></td>
                        <td className="py-4 sm:py-8 px-2 sm:px-4"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReservationDetailModal
        isOpen={selectedReservation !== null}
        onClose={() => setSelectedReservation(null)}
        reservation={
          reservations.find(
            (r) => r.id === selectedReservation,
          ) || reservations[0]
        }
      />
      <ReservationEditModal
        isOpen={editReservation !== null}
        onClose={() => setEditReservation(null)}
        reservation={
          reservations.find((r) => r.id === editReservation) ||
          reservations[0]
        }
      />
    </div>
  );
}