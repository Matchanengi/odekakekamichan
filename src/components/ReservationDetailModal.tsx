import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "./supabaseClient";

/**
 * 予約詳細モーダルのプロパティ定義
 */
interface ReservationDetailModalProps {
  isOpen: boolean;    // モーダルの開閉状態
  onClose: () => void;  // 閉じるボタン押下時のコールバック
  onUpdate: () => void; // データ更新（キャンセル等）後の再取得用コールバック
  reservation: any;     // 親コンポーネントから渡される予約の基本データ
}

export function ReservationDetailModal({
  isOpen,
  onClose,
  onUpdate,
  reservation,
}: ReservationDetailModalProps) {
  // --- ステータス管理 ---
  const [extraInfo, setExtraInfo] = useState<any>(null); // 追加で取得するユーザー情報や停留所名
  const [loading, setLoading] = useState(false);        // データ読み込み中フラグ
  const [isUpdating, setIsUpdating] = useState(false);  // キャンセル処理中フラグ

  /**
   * モーダルが開かれた際、または予約データが変わった際に
   * データベースから詳細情報を取得する
   */
  useEffect(() => {
    if (isOpen && reservation) {
      fetchFullDetails();
    }
  }, [isOpen, reservation]);

  /**
   * Supabaseから関連する詳細情報（ユーザー、停留所名、出発時刻）を取得
   */
  async function fetchFullDetails() {
    setLoading(true);
    try {
      // 1. ユーザー情報、乗車停留所名、降車停留所名を並列で取得（高速化）
      const [userRes, bStopRes, aStopRes] = await Promise.all([
        supabase.from("ユーザ").select("telephone_number, email").eq("id", reservation.user_id).maybeSingle(),
        supabase.from("停留所").select("stop_name").eq("stop_id", reservation.boarding_id).maybeSingle(),
        supabase.from("停留所").select("stop_name").eq("stop_id", reservation.alighting_id).maybeSingle()
      ]);

      // 2. 便の情報から基本の出発時刻とルートIDを取得
      const { data: tripData } = await supabase
        .from("便")
        .select("departure_time, route_id")
        .eq("trip_id", reservation.trip_id)
        .maybeSingle();

      let displayTime = "";
      const depTime = tripData?.departure_time;
      const rId = tripData?.route_id || reservation.route_id;

      // 3. 路線停留所マスタから、時間帯に応じた具体的な通過予定時刻を算出
      if (rId && reservation.boarding_id && depTime) {
        const { data: rsList } = await supabase
          .from("路線停留所")
          .select("stop_time, stop_time_2, stop_time_3, stop_time_4")
          .eq("route_id", rId)
          .eq("stop_id", reservation.boarding_id);

        if (rsList && rsList.length > 0) {
          const rs = rsList[0];
          // 便の基本出発時間から、どの運行枠（1〜4）を使用するか判定
          const hour = parseInt(depTime.split(":")[0], 10);
          const minute = parseInt(depTime.split(":")[1], 10);
          const totalMinutes = hour * 60 + minute;

          // 時間帯区分によってカラムを切り替え
          if (totalMinutes >= 360 && totalMinutes < 660) displayTime = rs.stop_time;
          else if (totalMinutes >= 660 && totalMinutes < 840) displayTime = rs.stop_time_2;
          else if (totalMinutes >= 840 && totalMinutes < 1062) displayTime = rs.stop_time_3;
          else displayTime = rs.stop_time_4;
        }
      }

      // 取得した情報をまとめてステータスに保存
      setExtraInfo({
        user: userRes.data,
        boardingName: bStopRes.data?.stop_name || "不明",
        alightingName: aStopRes.data?.stop_name || "不明",
        stopTime: displayTime || "---"
      });

    } catch (error) {
      console.error("詳細取得エラー:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * 予約をキャンセル状態に更新する
   */
  async function handleCancel() {
    if (!window.confirm("この予約をキャンセルしてもよろしいですか？")) return;

    setIsUpdating(true);
    try {
      // 予約ステータスを 'cancelled' に変更
      const { error } = await supabase
        .from("予約")
        .update({ status: "cancelled" })
        .eq("reservation_id", reservation.reservation_id);

      if (error) throw error;

      alert("予約をキャンセルしました。");
      onUpdate(); // 親コンポーネントの一覧を再読込
      onClose();  // モーダルを閉じる
    } catch (error: any) {
      alert("エラーが発生しました: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  }

  // モーダルが非表示、または予約データがない場合は何もレンダリングしない
  if (!isOpen || !reservation) return null;

  return (
    /* 背景オーバーレイ */
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* 外枠（緑の枠線風） */}
      <div className="bg-green-700 rounded-3xl p-4 sm:p-8 w-full max-w-[1000px] max-h-[90vh] overflow-hidden">
        {/* コンテンツ本体 */}
        <div className="bg-white rounded-3xl p-4 sm:p-8 relative max-h-[calc(90vh-2rem)] sm:max-h-[calc(90vh-4rem)] overflow-y-auto">
          
          {/* 閉じるボタン */}
          <button onClick={onClose} className="absolute top-4 right-4 text-black hover:text-gray-600">
            <X size={32} />
          </button>

          {/* ヘッダーセクション: 代表者名・予約ID */}
          <div className="mb-8 pr-12">
            <h2 className="text-xl sm:text-2xl mb-4 font-bold">予約詳細</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">代表者名</div>
                <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-50 font-bold text-lg">
                  {reservation.利用者?.name} 様
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">予約ID</div>
                <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-50">
                  A0{reservation.reservation_id?.toString().padStart(4, "0")}
                </div>
              </div>
            </div>
          </div>

          {/* 内容セクション: ステータス・日時・場所 */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-bold border-l-4 border-green-700 pl-2">予約内容</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">ステータス</div>
                  <div className={`border-2 border-black rounded-lg px-4 py-2 bg-gray-50 font-bold ${reservation.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {reservation.status === "active" ? "確定済み" : "キャンセル済み"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">乗車日時</div>
                  <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-50 font-bold">
                    {reservation.便?.operation_date} 
                    <span className="ml-2 text-green-800">
                      {/* 出発予定時刻がある場合のみ表示 */}
                      {extraInfo?.stopTime ? `(${extraInfo.stopTime.slice(0, 5)} 出発予定)` : ""}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">乗降場所</div>
                <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-50 text-base font-bold">
                  {loading ? "読み込み中..." : (
                    <div className="flex items-center">
                      <span className="text-blue-700">【乗】{extraInfo?.boardingName}</span>
                      <span className="mx-4 text-gray-400">▶</span>
                      <span className="text-red-700">【降】{extraInfo?.alightingName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ユーザー連絡先セクション */}
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-bold border-l-4 border-green-700 pl-2">連絡先情報</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">電話番号</div>
                <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-50">
                  {loading ? "..." : (extraInfo?.user?.telephone_number || "未登録")}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">メールアドレス</div>
                <div className="border-2 border-black rounded-lg px-4 py-2 bg-gray-50">
                  {loading ? "..." : (extraInfo?.user?.email || "未登録")}
                </div>
              </div>
            </div>
          </div>

          {/* メモセクション */}
          <div className="mb-8">
            <h3 className="mb-2 text-lg font-bold border-l-4 border-green-700 pl-2">対応履歴メモ</h3>
            <div className="border-2 border-black rounded-lg px-4 py-3 bg-gray-50 min-h-[80px] text-gray-700 whitespace-pre-wrap font-medium">
              {reservation.notes || "メモはありません"}
            </div>
          </div>

          {/* アクションボタン（キャンセル・閉じる） */}
          <div className="flex flex-col gap-3 mt-10 max-w-sm mx-auto">
            {/* 予約がアクティブな場合のみキャンセルボタンを表示 */}
            {reservation.status === "active" && (
              <button 
                onClick={handleCancel}
                disabled={isUpdating}
                className="bg-red-600 text-white px-12 py-3 rounded-xl w-full font-bold hover:bg-red-700 transition-colors shadow-md disabled:bg-red-300"
              >
                {isUpdating ? "処理中..." : "この予約をキャンセルする"}
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-white border-2 border-black px-12 py-3 rounded-xl w-full font-bold hover:bg-gray-100 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}