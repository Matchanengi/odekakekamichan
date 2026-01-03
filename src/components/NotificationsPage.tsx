import { useState } from "react";
import { NotificationEditModal } from "./NotificationEditModal";

export function NotificationsPage() {
  const [selectedNotification, setSelectedNotification] =
    useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const notifications = [
    {
      id: 1,
      status: "公開中",
      importance: "緊急",
      title: "大雨に伴う一部路線の運休について",
      startDate: "25/11/18",
      endDate: "25/11/19",
      statusColor: "text-green-600",
      importanceColor: "bg-yellow-400",
    },
    {
      id: 2,
      status: "公開中",
      importance: "通常",
      title: "冬季ダイヤ改正のお知らせ",
      startDate: "25/11/15",
      endDate: "25/12/15",
      statusColor: "text-green-600",
      importanceColor: "bg-gray-200",
    },
    {
      id: 3,
      status: "下書き",
      importance: "通常",
      title: "年末年始の運行について",
      startDate: "",
      endDate: "",
      statusColor: "text-red-600",
      importanceColor: "bg-gray-200",
    },
    {
      id: 4,
      status: "公開終了",
      importance: "通常",
      title: "アンパンマンバスの定期点検について",
      startDate: "25/11/01",
      endDate: "25/11/05",
      statusColor: "text-gray-600",
      importanceColor: "bg-gray-200",
    },
  ];

  const handleEdit = (id: number) => {
    setSelectedNotification(id);
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
    setIsCreatingNew(false);
  };

  const getActionButtons = (
    notification: (typeof notifications)[0],
  ) => {
    if (notification.status === "公開中") {
      return (
        <>
          <span
            className="text-blue-500 mr-4 cursor-pointer"
            onClick={() => handleEdit(notification.id)}
          >
            編集
          </span>
          <span className="text-red-600 cursor-pointer">
            非公開へ
          </span>
        </>
      );
    } else {
      return (
        <>
          <span
            className="text-blue-500 mr-4 cursor-pointer"
            onClick={() => handleEdit(notification.id)}
          >
            編集
          </span>
          <span className="text-red-600 cursor-pointer">
            削除
          </span>
        </>
      );
    }
  };

  return (
    <div className="bg-green-700 rounded-3xl p-3 sm:p-8">
      <div className="bg-white rounded-3xl p-3 sm:p-8">
        {/* Main Content */}
        <div className="max-h-[600px] overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
            <h3 className="text-lg sm:text-xl">・お知らせ一覧</h3>
            <button
              onClick={handleCreateNew}
              className="bg-white border-2 border-black px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
            >
              ⊕ 新規お知らせ作成
            </button>
          </div>

          <div className="border-4 border-black rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-base sm:text-lg min-w-[800px]">
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 w-[100px] sm:w-[120px]">
                      ステータス
                    </th>
                    <th className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 w-[80px] sm:w-[100px]">
                      重要度
                    </th>
                    <th className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4">
                      タイトル
                    </th>
                    <th className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 w-[160px] sm:w-[200px]">
                      公開期間
                    </th>
                    <th className="py-3 sm:py-4 px-2 sm:px-4 w-[120px] sm:w-[150px]">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {notifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className="border-t-4 border-black"
                    >
                      <td
                        className={`border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center ${notification.statusColor}`}
                      >
                        {notification.status}
                      </td>
                      <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center">
                        <div
                          className={`${notification.importanceColor} px-2 sm:px-3 py-1 rounded inline-block text-sm sm:text-base`}
                        >
                          {notification.importance}
                        </div>
                      </td>
                      <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4">
                        {notification.title}
                      </td>
                      <td className="border-r-4 border-black py-3 sm:py-4 px-2 sm:px-4 text-center text-sm sm:text-base">
                        {notification.startDate &&
                        notification.endDate
                          ? `${notification.startDate} - ${notification.endDate}`
                          : ""}
                      </td>
                      <td className="py-3 sm:py-4 px-2 sm:px-4 text-center whitespace-nowrap text-sm sm:text-base">
                        {getActionButtons(notification)}
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
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                      ：
                    </td>
                  </tr>
                  <tr className="border-t-4 border-black">
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

      <NotificationEditModal
        isOpen={isCreatingNew || selectedNotification !== null}
        onClose={handleCloseModal}
        notification={
          selectedNotification
            ? notifications.find(
                (n) => n.id === selectedNotification,
              ) || null
            : null
        }
      />
    </div>
  );
}