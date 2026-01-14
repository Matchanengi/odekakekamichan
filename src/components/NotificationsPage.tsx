import { useState, useEffect } from "react";
import { NotificationEditModal } from "./NotificationEditModal";
import { supabase } from "./supabaseClient";

// --- 型定義 ---
interface NoticeViewDB {
  notice_id: number;
  admin_id: number;
  title: string;
  content: string;
  posted_at: string;
  importance: boolean;
  is_public: boolean;
  start_date: string;
  end_date: string;
  is_draft: boolean;
  status: string;
}

interface UI_Notification {
  id: number;
  status: "公開中" | "下書き" | "公開終了" | "非公開" | "公開前";
  importance: "緊急" | "通常";
  title: string;
  startDate: string;
  endDate: string;
  content: string;
  statusColor: string;
  importanceColor: string;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<UI_Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<UI_Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- ステータス色の決定 ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "公開中": return "text-green-600";
      case "下書き": return "text-red-600";
      case "公開終了": return "text-gray-600";
      case "公開前": return "text-blue-500";
      default: return "text-gray-400";
    }
  };

  // --- データ取得 (SELECT) ---
  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("お知らせ_view")
        .select("*")
        .order("posted_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData: UI_Notification[] = data.map((item: NoticeViewDB) => ({
          id: item.notice_id,
          title: item.title,
          content: item.content,
          startDate: item.start_date.substring(2).replace(/-/g, "/"),
          endDate: item.end_date.substring(2).replace(/-/g, "/"),
          status: item.status as UI_Notification["status"],
          statusColor: getStatusColor(item.status),
          importance: item.importance ? "緊急" : "通常",
          importanceColor: item.importance ? "bg-yellow-400" : "bg-gray-200",
        }));
        setNotifications(formattedData);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // --- 削除処理 ---
  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`「${title}」を完全に削除してもよろしいですか？`)) return;

    try {
      const { error } = await supabase
        .from("お知らせ")
        .delete()
        .eq("notice_id", id);

      if (error) throw error;
      alert("削除しました");
      fetchNotices();
    } catch (error: any) {
      alert(`削除に失敗しました: ${error.message}`);
    }
  };

  // --- 非公開（is_draft: false, is_public: false）への切り替え処理 ---
  const handleSetHidden = async (id: number) => {
    if (!confirm("このお知らせを「非公開」にしますか？（公開が停止されます）")) return;

    try {
      const { error } = await supabase
        .from("お知らせ")
        .update({ 
          is_draft: false,
          is_public: false
        })
        .eq("notice_id", id);

      if (error) throw error;
      alert("非公開に設定しました");
      fetchNotices();
    } catch (error: any) {
      alert(`更新に失敗しました: ${error.message}`);
    }
  };

  // --- モーダル操作 ---
  const handleEdit = (notification: UI_Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedNotification(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
    await new Promise(resolve => setTimeout(resolve, 300)); 
    await fetchNotices(); 
  };

  // --- ボタンレンダリング ---
  const renderActionButtons = (n: UI_Notification) => (
    <div className="flex justify-center gap-3">
      <button 
        onClick={() => handleEdit(n)} 
        className="text-blue-500 hover:underline font-bold"
      >
        編集
      </button>
      
      {n.status === "公開中" ? (
        <button 
          onClick={() => handleSetHidden(n.id)}
          className="text-gray-600 hover:underline font-bold"
        >
          非公開へ
        </button>
      ) : (
        <button 
          onClick={() => handleDelete(n.id, n.title)}
          className="text-red-600 hover:underline font-bold"
        >
          削除
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-green-700 p-4 sm:p-8 min-h-screen flex justify-center">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #15803d; border-radius: 4px; }
      `}</style>

      <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-6xl h-fit border-4 border-black">
        
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <h3 className="text-2xl font-black text-gray-800 tracking-tighter">● お知らせ管理パネル</h3>
          <button
            onClick={handleCreateNew}
            className="bg-green-700 text-white border-2 border-black px-6 py-2 rounded-xl font-bold hover:bg-green-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            ⊕ 新規お知らせ作成
          </button>
        </div>

        <div className="border-2 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base min-w-[800px] border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-green-700 text-white">
                  <th className="border-b-2 border-black py-4 px-2 w-[120px]">ステータス</th>
                  <th className="border-b-2 border-black py-4 px-2 w-[100px]">重要度</th>
                  <th className="border-b-2 border-black py-4 px-4 text-left">タイトル</th>
                  <th className="border-b-2 border-black py-4 px-2 w-[200px]">公開期間</th>
                  <th className="border-b-2 border-black py-4 px-2 w-[160px]">操作</th>
                </tr>
              </thead>
            </table>
          </div>

          <div className="overflow-y-auto max-h-[520px] custom-scrollbar bg-white">
            <table className="w-full text-sm sm:text-base min-w-[800px]">
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-20 font-bold text-gray-400">読み込み中...</td></tr>
                ) : notifications.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-32 font-bold text-gray-400 text-xl">お知らせがありません</td></tr>
                ) : (
                  notifications.map((n) => (
                    <tr key={n.id} className="border-b border-gray-200 hover:bg-green-50 transition-colors">
                      <td className={`py-4 px-2 text-center font-black ${n.statusColor} w-[120px]`}>{n.status}</td>
                      <td className="py-4 px-2 text-center w-[100px]">
                        <span className={`${n.importanceColor} px-3 py-1 rounded-full text-xs font-bold border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}>
                          {n.importance}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-700">{n.title}</td>
                      <td className="py-4 px-2 text-center text-xs font-mono font-bold text-gray-500 w-[200px]">
                        {n.startDate} ～ {n.endDate}
                      </td>
                      <td className="py-4 px-2 text-center text-xs font-bold w-[160px]">
                        {renderActionButtons(n)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-right text-xs text-gray-400 font-bold">
          全 {notifications.length} 件のお知らせを表示中
        </p>
      </div>

      <NotificationEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        notification={selectedNotification}
      />
    </div>
  );
}