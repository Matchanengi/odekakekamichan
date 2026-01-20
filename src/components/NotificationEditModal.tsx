import { useState, useEffect } from "react";
import { X, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ja } from "date-fns/locale";
import { supabase } from "./supabaseClient";

// カレンダーの日本語化設定
registerLocale("ja", ja);

interface NotificationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 親コンポーネントから渡されるデータ。新規作成時は null または undefined。
  notification?: any | null;
}

export function NotificationEditModal({
  isOpen,
  onClose,
  notification,
}: NotificationEditModalProps) {
  // --- フォームの状態管理 ---
  const [status, setStatus] = useState("下書き");
  const [importance, setImportance] = useState("通常");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 初期化処理 ---
  useEffect(() => {
    if (notification) {
      // 【編集モード】既存のデータを入力欄にセット
      setStatus(notification.status === "公開前" ? "公開中" : notification.status);
      setImportance(notification.importance);
      setTitle(notification.title);
      setContent(notification.content);

      // 日付の復元（文字列 "26/01/14" を JavaScript の Date 型に変換）
      const baseYear = "20" + notification.startDate.split("/")[0];
      setStartDate(new Date(notification.startDate.replace(/^\d{2}/, baseYear)));
      const baseYearEnd = "20" + notification.endDate.split("/")[0];
      setEndDate(new Date(notification.endDate.replace(/^\d{2}/, baseYearEnd)));
    } else {
      // 【新規作成モード】リセット
      setStatus("下書き");
      setImportance("通常");
      setTitle("");
      setContent("");
      setStartDate(new Date());
      setEndDate(new Date());
    }
  }, [notification, isOpen]);

  if (!isOpen) return null;

  // --- 保存処理（INSERT / UPDATE） ---
  const handleSubmit = async () => {
    // バリデーション
    if (!title || !content || !startDate || !endDate) {
      alert("必須項目を入力してください");
      return;
    }

    setIsSubmitting(true);

    // 画面上の選択肢をDBのカラム形式に変換
    const is_draft = status === "下書き";
    const is_public = status === "公開中" || status === "公開前";
    const importance_bool = importance === "緊急";

    // 【重要】タイムゾーンのズレ（1日減る問題）を解決する日付フォーマット関数
    const toLocalDateString = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`; // YYYY-MM-DD 形式
    };

    // 送信用データオブジェクト
    const saveData = {
      title,
      content,
      importance: importance_bool,
      is_public,
      is_draft,
      start_date: toLocalDateString(startDate),
      end_date: toLocalDateString(endDate),
    };

    try {
      if (notification?.id) {
        // --- 【UPDATE：編集処理】 ---
        const targetId = Number(notification.id); // 確実に数値型にする

        const { data, error } = await supabase
          .from("お知らせ")          // 実体テーブルを指定
          .update(saveData)
          .eq("notice_id", targetId) // カラム名は notice_id
          .select();

        if (error) throw error;

        if (!data || data.length === 0) {
          alert(`更新対象が見つかりませんでした (ID:${targetId})。`);
        } else {
          alert("更新に成功しました！");
          onClose();
        }
      } else {
        // --- 【INSERT：新規作成処理】 ---
        const { error } = await supabase
          .from("お知らせ")
          .insert([saveData]);
        
        if (error) throw error;
        alert("新規作成しました");
        onClose();
      }
    } catch (error: any) {
      console.error("Save error:", error);
      alert(`保存エラー: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNewNotification = !notification;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container input { width: 100%; }
      `}</style>

      <div className="bg-green-700 rounded-3xl p-2 sm:p-4 w-full max-w-4xl shadow-2xl">
        <div className="bg-white rounded-2xl p-4 sm:p-8 relative max-h-[90vh] overflow-y-auto border-4 border-black">
          
          <button onClick={onClose} className="absolute top-4 right-4 text-black hover:opacity-70">
            <X size={32} strokeWidth={3} />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-green-700">●</span>
            {isNewNotification ? "新規お知らせ作成" : "お知らせの編集"}
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <label className="bg-green-700 text-white px-4 py-2 rounded-lg font-bold min-w-[100px] text-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  ステータス
                </label>
                <div className="relative flex-1">
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border-2 border-black rounded-lg p-2 appearance-none bg-white font-bold"
                  >
                    <option>下書き</option>
                    <option>公開中</option>
                    <option>非公開</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="bg-green-700 text-white px-4 py-2 rounded-lg font-bold min-w-[100px] text-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  重要度
                </label>
                <div className="relative flex-1">
                  <select 
                    value={importance} 
                    onChange={(e) => setImportance(e.target.value)}
                    className="w-full border-2 border-black rounded-lg p-2 appearance-none bg-white font-bold"
                  >
                    <option>通常</option>
                    <option>緊急</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="bg-green-700 text-white px-4 py-2 rounded-lg font-bold min-w-[100px] text-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  タイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 border-2 border-black rounded-lg p-2 font-bold"
                  placeholder="タイトルを入力してください"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="bg-green-700 text-white px-4 py-2 rounded-lg font-bold min-w-[100px] text-center border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  公開期間
                </label>
                <div className="relative flex-1">
                  <DatePicker
                    selected={startDate}
                    onChange={(dates: [Date | null, Date | null]) => {
                      const [start, end] = dates;
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    locale="ja"
                    dateFormat="yyyy/MM/dd"
                    className="w-full border-2 border-black rounded-lg p-2 pl-10 font-bold"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold block">本文：</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border-2 border-black rounded-xl p-4 h-48 font-medium focus:ring-2 ring-green-500 outline-none"
                placeholder="本文を入力してください..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-700 text-white px-12 py-3 rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all disabled:bg-gray-400"
              >
                {isSubmitting ? "保存中..." : (isNewNotification ? "新規作成" : "変更を保存")}
              </button>
              <button
                onClick={onClose}
                className="bg-white text-red-600 border-2 border-red-600 px-12 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors"
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