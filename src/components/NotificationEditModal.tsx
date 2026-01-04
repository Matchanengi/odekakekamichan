import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface NotificationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification?: {
    id: number;
    status: string;
    importance: string;
    title: string;
    startDate: string;
    endDate: string;
  } | null;
}

export function NotificationEditModal({
  isOpen,
  onClose,
  notification,
}: NotificationEditModalProps) {
  const [status, setStatus] = useState(notification?.status || "下書き");
  const [importance, setImportance] = useState(notification?.importance || "通常");
  const [title, setTitle] = useState(notification?.title || "");
  const [startDate, setStartDate] = useState(notification?.startDate || "2025/11/18");
  const [endDate, setEndDate] = useState(notification?.endDate || "2025/11/19");
  const [content, setContent] = useState("");

  if (!isOpen) return null;

  const isNewNotification = !notification;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-green-700 rounded-3xl p-3 sm:p-8 w-full max-w-[1000px] max-h-[95vh] overflow-hidden">
        <div className="bg-white rounded-3xl p-3 sm:p-8 relative max-h-[calc(95vh-1.5rem)] sm:max-h-[calc(90vh-4rem)] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-black hover:text-gray-600 z-10"
          >
            <X size={24} className="sm:hidden" />
            <X size={32} className="hidden sm:block" />
          </button>

          {/* Title */}
          <h2 className="text-lg sm:text-2xl mb-4 sm:mb-6 pr-8">
            ・{isNewNotification ? "新規お知らせ作成" : `お知らせの編集（ID：N0${notification.id.toString().padStart(4, "0")}）`}
          </h2>

          {/* お知らせ基本情報 */}
          <div className="mb-4 sm:mb-6">
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg">お知らせ基本情報</h3>

            <div className="space-y-3 sm:space-y-4">
              {/* Status and Importance - Stack on mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg min-w-[100px] sm:min-w-[120px] text-sm sm:text-base text-center">
                    <span className="text-red-600">*</span>ステータス
                  </div>
                  <div className="relative flex-1 sm:w-64 sm:flex-none">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 w-full appearance-none bg-white text-sm sm:text-base"
                    >
                      <option>下書き</option>
                      <option>公開中</option>
                      <option>公開終了</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg min-w-[100px] sm:min-w-[120px] text-sm sm:text-base text-center">
                    <span className="text-red-600">*</span>重要度
                  </div>
                  <div className="relative flex-1 sm:w-64 sm:flex-none">
                    <select
                      value={importance}
                      onChange={(e) => setImportance(e.target.value)}
                      className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 w-full appearance-none bg-white text-sm sm:text-base"
                    >
                      <option>通常</option>
                      <option>緊急</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg min-w-[100px] sm:min-w-[120px] text-sm sm:text-base text-center">
                  <span className="text-red-600">*</span>タイトル
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 flex-1 text-sm sm:text-base"
                  placeholder="大雨に伴う一部路線の運休について"
                />
              </div>

              {/* Date Range */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-green-700 text-white px-3 sm:px-6 py-2 rounded-lg min-w-[100px] sm:min-w-[120px] text-sm sm:text-base text-center">
                    <span className="text-red-600">*</span>公開期間
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 sm:pl-[116px] md:pl-[136px]">
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 w-full sm:w-64 text-sm sm:text-base"
                  />
                  <span className="text-center sm:text-left">～</span>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 w-full sm:w-64 text-sm sm:text-base"
                  />
                </div>
                <span className="text-gray-500 text-xs sm:text-sm sm:pl-[116px] md:pl-[136px]">（カレンダーから選択）</span>
              </div>
            </div>
          </div>

          {/* お知らせ内容 */}
          <div className="mb-4 sm:mb-6">
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg">お知らせ内容</h3>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="mb-2 text-sm sm:text-base">
                  <span className="text-red-600">*</span>本文：
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border-2 border-black rounded-lg px-3 sm:px-4 py-2 w-full h-48 sm:h-64 text-sm sm:text-base"
                  placeholder="本日は大雨の影響により、蕨野線（山田駅発）の運行を13:30便より休止いたします。&#10;ご利用予定のお客様には大変ご迷惑をおかけいたしますが、何卒ご理解のほどよろしくお願いいたします。&#10;&#10;■運休区間：蕨野線（山田駅発）&#10;■運休時間：13:30便以降&#10;■再開予定：未定（天候回復次第）&#10;&#10;最新情報は随時更新いたします。"
                />
              </div>

              <div className="text-xs sm:text-sm text-gray-600">
                ※本文は改行が反映されます。お客様に分かりやすい表現を心がけてください。
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
            <button className="bg-green-700 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg text-sm sm:text-base w-full sm:w-auto">
              {isNewNotification ? "お知らせを作成する" : "変更を保存する"}
            </button>
            <button
              onClick={onClose}
              className="bg-white border-2 border-red-600 text-red-600 px-8 sm:px-12 py-2 sm:py-3 rounded-lg text-sm sm:text-base w-full sm:w-auto"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}