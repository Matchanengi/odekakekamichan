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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-green-700 rounded-3xl p-8 w-[1100px] max-w-[90vw]">
        <div className="bg-white rounded-3xl p-8 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black hover:text-gray-600"
          >
            <X size={32} />
          </button>

          {/* Title */}
          <h2 className="text-2xl mb-6">
            ・予約詳細：{reservation.name} 様（ID：A0
            {reservation.id.toString().padStart(4, "0")}）
          </h2>

          {/* Reservation Information Section */}
          <div className="mb-6">
            <h3 className="mb-4">予約情報</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-green-700 text-white px-6 py-2 rounded-lg min-w-[120px]">
                  ステータス
                </div>
                <input
                  type="text"
                  value={reservation.status}
                  readOnly
                  className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100 flex-1"
                />

                <div className="bg-green-700 text-white px-6 py-2 rounded-lg min-w-[120px]">
                  乗車日時
                </div>
                <input
                  type="text"
                  value={`2025 年 11 月 18 日(火) 09:30`}
                  readOnly
                  className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100 flex-1"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-green-700 text-white px-6 py-2 rounded-lg min-w-[120px]">
                  路線名
                </div>
                <input
                  type="text"
                  value={`蕨野線（山田駅 発）`}
                  readOnly
                  className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100 flex-1"
                />

                <div className="bg-green-700 text-white px-6 py-2 rounded-lg min-w-[120px]">
                  乗降場所
                </div>
                <input
                  type="text"
                  value={`[乗] 山田駅 → [降] いずみの広場`}
                  readOnly
                  className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100 flex-1"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-green-700 text-white px-6 py-2 rounded-lg min-w-[120px]">
                  人数
                </div>
                <input
                  type="text"
                  value={`おとな${reservation.people}名 こども0名`}
                  readOnly
                  className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100 w-80"
                />

                <div className="flex items-center gap-2">
                  <span>往復</span>
                  <input
                    type="checkbox"
                    checked={true}
                    readOnly
                    className="w-6 h-6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="mb-6">
            <h3 className="mb-4">お客様情報</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-green-700 text-white px-6 py-2 rounded-lg min-w-[120px]">
                  氏名
                </div>
                <input
                  type="text"
                  value={reservation.name}
                  readOnly
                  className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100 flex-1"
                />

                <div className="bg-green-700 text-white px-6 py-2 rounded-lg min-w-[120px]">
                  電話番号
                </div>
                <input
                  type="text"
                  value="090-1234-5678"
                  readOnly
                  className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100 flex-1"
                />
              </div>
            </div>
          </div>

          {/* Response History Memo Section */}
          <div className="mb-6">
            <div className="mb-2">対応履歴メモ（追記可）：</div>
            <textarea
              defaultValue="電話にて予約受付（担当：佐藤）"
              className="border-2 border-black rounded-lg px-4 py-2 w-full h-32"
              placeholder="対応履歴を入力してください"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <button className="bg-green-700 text-white px-12 py-3 rounded-lg">
              予約を承認する
            </button>
            <button className="bg-white border-2 border-red-600 text-red-600 px-12 py-3 rounded-lg">
              予約を却下する
            </button>
            <button
              onClick={onClose}
              className="bg-white border-2 border-black px-12 py-3 rounded-lg"
            >
              保存して閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}