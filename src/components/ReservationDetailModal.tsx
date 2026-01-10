import { X } from "lucide-react";

interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: {
    id: number;
    status: string;
    date: string;
    route: string;
    name: string;
    people: number;
  };
}

export function ReservationDetailModal({
  isOpen,
  onClose,
  reservation,
}: ReservationDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-green-700 rounded-3xl p-4 sm:p-8 w-full max-w-[1100px] max-h-[90vh] overflow-hidden">
        <div className="bg-white rounded-3xl p-4 sm:p-8 relative max-h-[calc(90vh-2rem)] sm:max-h-[calc(90vh-4rem)] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black hover:text-gray-600"
          >
            <X size={32} />
          </button>

          {/* Title Section */}
          <div className="mb-6 pr-12">
            <h2 className="text-xl sm:text-2xl mb-4">予約詳細</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-700 mb-1">代表者名</div>
                <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                  {reservation.name} 様
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-1">予約ID</div>
                <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                  A0{reservation.id.toString().padStart(4, "0")}
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Information Section */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg sm:text-xl">予約情報</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-700 mb-1">ステータス</div>
                  <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                    {reservation.status}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-700 mb-1">乗車日時</div>
                  <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                    2025 年 11 月 18 日(火) 09:30
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-700 mb-1">路線名</div>
                  <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                    蕨野線（山田駅 発）
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-700 mb-1">乗降場所</div>
                  <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                    [乗] 山田駅 → [降] いずみの広場
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-700 mb-1">人数</div>
                  <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                    おとな{reservation.people}名 こども0名
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-700 mb-1">往復</div>
                  <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100 flex items-center">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="w-6 h-6 mr-2"
                    />
                    <span>往復便</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg sm:text-xl">お客様情報</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-700 mb-1">氏名</div>
                  <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                    {reservation.name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-700 mb-1">電話番号</div>
                  <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                    090-1234-5678
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Response History Memo Section */}
          <div className="mb-6">
            <div className="text-sm text-gray-700 mb-2">対応履歴メモ（追記可）</div>
            <textarea
              defaultValue="電話にて予約受付（担当：佐藤）"
              className="border-2 border-black rounded-lg px-4 py-2 w-full h-32"
              placeholder="対応履歴を入力してください"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-8 max-w-md mx-auto">
            <button className="bg-green-700 text-white px-12 py-3 rounded-lg w-full">
              予約を承認する
            </button>
            <button className="bg-white border-2 border-red-600 text-red-600 px-12 py-3 rounded-lg w-full">
              予約を却下する
            </button>
            <button
              onClick={onClose}
              className="bg-white border-2 border-black px-12 py-3 rounded-lg w-full"
            >
              保存して閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}