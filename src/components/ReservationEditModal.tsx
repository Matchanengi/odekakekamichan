import { useState } from "react";
import { X, ChevronDown, Plus, Minus } from "lucide-react";

interface ReservationEditModalProps {
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

export function ReservationEditModal({
  isOpen,
  onClose,
  reservation,
}: ReservationEditModalProps) {
  const [currentRoute] = useState("蕨野線（山田駅 発）");
  const [selectedDate] = useState("2025 年 11 月 18 日(火) 09:30");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [boardingLocation, setBoardingLocation] = useState("山田駅");
  const [dropoffLocation, setDropoffLocation] = useState("いずみの広場");
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [representativeName, setRepresentativeName] = useState("山田 太郎");
  const [phoneNumber, setPhoneNumber] = useState("090-1234-5678");
  const [editReason, setEditReason] = useState("お客様からの書誌連絡のため");
  const [historyMemo, setHistoryMemo] = useState("人数変更の連絡あり（大人1→2名）");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-green-700 rounded-3xl p-4 sm:p-8 w-full max-w-[1000px] max-h-[90vh] overflow-hidden">
        <div className="bg-white rounded-3xl p-4 sm:p-8 relative max-h-[calc(90vh-2rem)] sm:max-h-[calc(90vh-4rem)] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black hover:text-gray-600 z-10"
          >
            <X size={32} />
          </button>

          {/* Title Section */}
          <div className="mb-6 pr-12">
            <h2 className="text-xl sm:text-2xl mb-4">予約の編集</h2>
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

          {/* Section 1: ご乗車便の変更 */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg sm:text-xl">
              1. ご乗車便の変更（変更がある場合のみ操作してください）
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-700 mb-1">現在の便</div>
                <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                  {currentRoute}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-700 mb-1">乗車日時</div>
                <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-100">
                  {selectedDate}
                </div>
              </div>

              <div>
                <button className="bg-green-700 text-white px-8 py-2 rounded-lg">
                  乗車便を変更する
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: 人数と乗降場所の変更 */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg sm:text-xl">2. 人数と乗降場所の変更</h3>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-700 mb-1">
                  <span className="text-red-600">*</span>人数
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <span>おとな</span>
                    <button
                      onClick={() => setAdults(Math.max(0, adults - 1))}
                      className="border-2 border-black rounded w-8 h-8 flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="text"
                      value={adults}
                      readOnly
                      className="border-2 border-black rounded px-4 py-1 w-16 text-center"
                    />
                    <button
                      onClick={() => setAdults(adults + 1)}
                      className="border-2 border-black rounded w-8 h-8 flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                    <span>名</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>こども</span>
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="border-2 border-black rounded w-8 h-8 flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="text"
                      value={children}
                      readOnly
                      className="border-2 border-black rounded px-4 py-1 w-16 text-center"
                    />
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="border-2 border-black rounded w-8 h-8 flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                    <span>名</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  ※注意：人数を変更する場合は、空席を超えることを確認してください。
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-700 mb-1">乗車場所</div>
                  <div className="relative">
                    <select
                      value={boardingLocation}
                      onChange={(e) => setBoardingLocation(e.target.value)}
                      className="border-2 border-black rounded-lg px-4 py-2 w-full appearance-none bg-white"
                    >
                      <option>山田駅</option>
                      <option>中央公園</option>
                      <option>市役所前</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      size={24}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-700 mb-1">降車場所</div>
                  <div className="relative">
                    <select
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      className="border-2 border-black rounded-lg px-4 py-2 w-full appearance-none bg-white"
                    >
                      <option>いずみの広場</option>
                      <option>駅前ロータリー</option>
                      <option>商店街入口</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      size={24}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-700 mb-1">往復</div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isRoundTrip}
                    onChange={(e) => setIsRoundTrip(e.target.checked)}
                    className="w-6 h-6"
                  />
                  <span>往復便</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: お客様情報の変更 */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg sm:text-xl">3. お客様情報の変更</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-700 mb-1">氏名</div>
                  <input
                    type="text"
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    className="border-2 border-black rounded-lg px-4 py-2 w-full"
                  />
                </div>

                <div>
                  <div className="text-sm text-gray-700 mb-1">電話番号</div>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="border-2 border-black rounded-lg px-4 py-2 w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: 編集履歴とメモ */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg sm:text-xl">4. 編集履歴とメモ</h3>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-700 mb-1">編集理由</div>
                <div className="relative">
                  <select
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="border-2 border-black rounded-lg px-4 py-2 w-full appearance-none bg-white"
                  >
                    <option>お客様からの書誌連絡のため</option>
                    <option>システム不具合による修正</option>
                    <option>スタッフの入力ミス修正</option>
                    <option>その他</option>
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    size={24}
                  />
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-700 mb-2">対応履歴メモ（追記）</div>
                <textarea
                  value={historyMemo}
                  onChange={(e) => setHistoryMemo(e.target.value)}
                  className="border-2 border-black rounded-lg px-4 py-2 w-full h-32"
                  placeholder="人数変更の連絡あり（大人1→2名）"
                />
              </div>

              <div>
                <div className="text-sm text-cyan-600 mb-2">過去の履歴</div>
                <div className="border-2 border-black rounded-lg px-4 py-2 w-full h-32 bg-gray-50 overflow-y-auto">
                  <div className="text-cyan-600">
                    2025/11/17 18:30 電話にて予約受付（担当：佐藤）
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-8 max-w-md mx-auto">
            <button className="bg-green-700 text-white px-12 py-3 rounded-lg w-full">
              変更を保存する
            </button>
            <button
              onClick={onClose}
              className="bg-white border-2 border-red-600 text-red-600 px-12 py-3 rounded-lg w-full"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}