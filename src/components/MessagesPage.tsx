import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "../AuthContext";
import { X, ArrowDown } from "lucide-react";

/**
 * メッセージ項目の型定義
 * お知らせ(notice)とシステム通知(system/予約)の両方に対応
 */
interface MessageItem {
  id: string | number;
  type: 'notice' | 'system';
  subject: string;      // 件名
  content: string;      // 本文
  date: string;         // 表示用日付
  rawDate: Date;        // ソート用の生の日付データ
  isImportant: boolean; // 重要フラグ
  reservationDetails?: { // 予約メッセージの場合のみ保持する詳細データ
    boardingName: string;
    alightingName: string;
    date: string;
    time: string;
    adults: number;
    children: number;
    totalFare: number;
  };
}

/**
 * メッセージ一覧・詳細表示コンポーネント
 * @param onBack 戻るボタン押下時の処理
 * @param isAdmin 管理者モード表示フラグ
 */
export function MessagesPage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const { profile, role } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]); // 統合されたメッセージリスト
  const [isLoading, setIsLoading] = useState(true);            // ローディング状態
  const [selectedMsg, setSelectedMsg] = useState<MessageItem | null>(null); // 現在選択中の詳細メッセージ

  // 管理者かユーザーかでテーマカラーを切り替え
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';
  const headerColor = isAdmin ? 'bg-green-600' : 'bg-cyan-600';

  /**
   * 日付の表示形式を変換するヘルパー関数
   * 今日なら時刻(HH:mm)、それ以外なら月日(M月D日)を返す
   */
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    return date.toDateString() === now.toDateString()
      ? date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      : `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  useEffect(() => {
    /**
     * 複数のテーブルからデータを取得し、MessageItem型に整形して統合する
     */
    const fetchMessages = async () => {
      if (!profile) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const allItems: MessageItem[] = [];

      try {
        // 1. 「お知らせ_view」から公開中のデータを取得
        const { data: notices } = await supabase
          .from("お知らせ_view")
          .select("*")
          .eq("status", "公開中");

        if (notices) {
          notices.forEach(n => {
            allItems.push({
              id: `notice-${n.notice_id}`,
              type: 'notice',
              subject: n.importance ? `【重要】${n.title}` : n.title,
              content: n.content || "",
              date: formatDisplayDate(n.posted_at),
              rawDate: new Date(n.posted_at),
              isImportant: n.importance
            });
          });
        }

        // 2. ユーザーロールに応じて処理を分岐
        if (role === 'user') {
          // 一般ユーザー：自分の予約履歴を取得
          const { data: reservations } = await supabase
            .from("予約")
            .select(`
              *,
              boarding:boarding_id(stop_name),
              alighting:alighting_id(stop_name),
              trip:trip_id(operation_date, departure_time, fare)
            `)
            .eq('user_id', profile.id)
            .eq('status', 'active'); // キャンセルされた予約を除外

          if (reservations) {
            reservations.forEach((r: any) => {
              // 料金計算 (大人運賃 + 小人運賃[大人の半分])
              const totalFare = (r.adult_count * (r.trip?.fare || 0)) + (r.child_count * ((r.trip?.fare || 0) / 2));
              
              allItems.push({
                id: `res-${r.reservation_id}`,
                type: 'system',
                subject: `予約を受け付けました (${r.boarding?.stop_name} → ${r.alighting?.stop_name})`,
                content: "", 
                date: formatDisplayDate(r.reserved_at),
                rawDate: new Date(r.reserved_at),
                isImportant: false,
                reservationDetails: {
                  boardingName: r.boarding?.stop_name || "不明",
                  alightingName: r.alighting?.stop_name || "不明",
                  date: r.trip?.operation_date || "",
                  time: r.trip?.departure_time?.slice(0, 5) || "",
                  adults: r.adult_count,
                  children: r.child_count,
                  totalFare: totalFare
                }
              });
            });
          }

          // ウェルカムメッセージ（会員登録完了時）をリストに追加
          if (profile.create) {
            allItems.push({
              id: 'system-welcome',
              type: 'system',
              subject: "会員登録が完了しました",
              content: `${profile.name} 様\n\nおでかけかみちゃんへの会員登録が完了しました！`,
              date: formatDisplayDate(profile.create),
              rawDate: new Date(profile.create),
              isImportant: false
            });
          }
        } else if (role === 'admin') {
           // 管理者：管理者用メッセージを表示
           allItems.push({
             id: 'admin-msg',
             type: 'system',
             subject: "管理者モードでログイン中",
             content: "現在は管理者としてログインしています。お知らせの管理などは管理者専用パネルから行ってください。",
             date: formatDisplayDate(new Date().toISOString()),
             rawDate: new Date(),
             isImportant: false
           });
        }

        // 3. 全てのメッセージを日付の新しい順（降順）にソートして反映
        allItems.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
        setMessages(allItems);
      } catch (err) {
        console.error("データ取得エラー:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [profile, role]);

  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8 min-h-[600px] relative transition-colors duration-500`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-inner min-h-full">
        {/* ページヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl text-blue-600 font-bold tracking-tighter">メッセージ</h2>
          {isAdmin && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">管理者表示モード</span>}
        </div>
        
        {/* メッセージ一覧テーブル */}
        <div className="overflow-hidden border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className={`${headerColor} text-white`}>
                <th className="border-b-2 border-black border-r-2 px-4 py-3 text-center font-bold">件名</th>
                <th className="border-b-2 border-black px-4 py-3 text-center font-bold w-[100px] sm:w-[140px]">日付</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={2} className="py-10 text-center text-gray-400 font-bold italic animate-pulse">読み込み中...</td></tr>
              ) : messages.length === 0 ? (
                <tr><td colSpan={2} className="py-10 text-center text-gray-400">表示できるメッセージはありません</td></tr>
              ) : (
                messages.map((message) => (
                  <tr 
                    key={message.id} 
                    onClick={() => setSelectedMsg(message)} 
                    className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 group"
                  >
                    <td className={`px-4 py-4 text-left font-medium border-r-2 border-black/5 ${message.isImportant ? "bg-yellow-50 font-bold" : ""}`}>
                      {message.isImportant && <span className="text-red-500 mr-1">●</span>}
                      {message.subject}
                    </td>
                    <td className={`px-4 py-4 text-center italic text-xs sm:text-sm font-bold text-gray-500 ${message.isImportant ? "bg-yellow-50" : ""}`}>
                      {message.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <button onClick={onBack} className="mt-10 bg-gray-800 text-white px-10 py-3 rounded-xl font-bold shadow-md hover:bg-black transition-all">戻る</button>
      </div>

      {/* --- メッセージ詳細モーダル --- */}
      {selectedMsg && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* コンテナ：max-h-[85vh] と flex-col でスクロール制御を最適化 */}
          <div className="relative bg-white border-4 border-black rounded-[2.5rem] w-full max-w-lg shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            
            {/* モーダルヘッダー：重要度によって背景色を変更 */}
            <div className={`p-5 border-b-4 border-black flex justify-between items-center shrink-0 ${selectedMsg.isImportant ? 'bg-yellow-400' : 'bg-blue-600 text-white'}`}>
              <h3 className="font-black text-xl tracking-tighter">MESSAGE DETAIL</h3>
              <button onClick={() => setSelectedMsg(null)} className="p-2 hover:bg-black/10 rounded-full"><X size={28} strokeWidth={3} /></button>
            </div>

            {/* モーダルコンテンツ：内部スクロール可能エリア */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              {/* 予約情報がある場合：チケット風のレイアウトを表示 */}
              {selectedMsg.reservationDetails ? (
                <div className="space-y-6">
                  {/* 乗車地・降車地 */}
                  <div className="flex items-center gap-4">
                    <span className="bg-cyan-400 text-white px-4 py-1 rounded-lg font-bold text-sm shrink-0">乗車</span>
                    <div className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold bg-gray-50">{selectedMsg.reservationDetails.boardingName}</div>
                  </div>
                  <div className="flex justify-center"><ArrowDown className="text-cyan-400" /></div>
                  <div className="flex items-center gap-4">
                    <span className="bg-cyan-400 text-white px-4 py-1 rounded-lg font-bold text-sm shrink-0">降車地</span>
                    <div className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold bg-gray-50">{selectedMsg.reservationDetails.alightingName}</div>
                  </div>
                  {/* 日時・人数情報 */}
                  <div className="bg-gray-100 rounded-2xl p-4 space-y-4">
                    <p className="text-gray-500 text-sm font-bold">日時</p>
                    <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold">{selectedMsg.reservationDetails.date}</div>
                    <div className="flex items-center gap-4">
                      <div className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 font-bold">{selectedMsg.reservationDetails.time}</div>
                      <div className="bg-cyan-400 text-white px-4 py-2 rounded-lg font-bold">行き</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-500 text-sm font-bold">人数</p>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      <div className="flex items-center gap-2">おとな <span className="border-2 border-gray-200 rounded-lg px-4 py-1 font-bold">{selectedMsg.reservationDetails.adults}人</span></div>
                      <div className="flex items-center gap-2">こども <span className="border-2 border-gray-200 rounded-lg px-4 py-1 font-bold">{selectedMsg.reservationDetails.children}人</span></div>
                    </div>
                  </div>
                  {/* 合計料金 */}
                  <div className="pt-4 border-t-2 border-dotted border-gray-300 flex justify-between items-end">
                    <span className="font-bold text-gray-600">料金合計</span>
                    <div className="text-blue-900"><span className="text-3xl font-black">¥ {selectedMsg.reservationDetails.totalFare.toLocaleString()}</span><span className="text-xs ml-1">(税込)</span></div>
                  </div>
                </div>
              ) : (
                /* 通常のお知らせ・システムメッセージの場合：テキストをそのまま表示 */
                <div className="bg-gray-50 border-2 border-black rounded-2xl p-6 min-h-[150px] whitespace-pre-wrap font-bold text-gray-700 leading-relaxed shadow-inner italic">
                  {selectedMsg.content}
                </div>
              )}
            </div>

            {/* モーダルフッター：スクロールしても常に最下部に固定 */}
            <div className="p-6 pt-0 shrink-0">
              <button onClick={() => setSelectedMsg(null)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black transition-colors hover:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}