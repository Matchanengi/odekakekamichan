import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Loader2 } from 'lucide-react';

/**
 * 予約確認画面のプロパティ定義
 */
interface BookingConfirmPageProps {
  onBack: () => void;     // 「戻る」ボタン押下時の処理
  onConfirm: () => void;  // 予約完了後の遷移処理
  userId: any;           // ログイン中のユーザーID
  bookingData: {         // 前の画面から引き継いだ予約詳細データ
    line?: string;
    tripId: number;
    direction: boolean;
    returnTripId: number;
    returnDirection?: boolean;
    departure: string;
    arrival: string;
    tripType: '片道' | '往復';
    date: string;
    time: string;
    departureTime?: string;
    arrivalTime?: string;
    returnDate?: string;
    returnTime?: string;
    returnDepartureTime?: string;
    returnArrivalTime?: string;
    adults: number;
    children: number;
    fare?: number;
  };
}

export function BookingConfirmPage({ onBack, onConfirm, userId, bookingData }: BookingConfirmPageProps) {
  // 送信中状態を管理するステート（二重送信防止用）
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 予約実行処理
   * 1. 停留所名からIDを取得
   * 2. 予約データの組み立て（往復の場合は2レコード分）
   * 3. Supabase（DB）への保存
   */
  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    try {
      // --- 手順0. 停留所名からマスターIDを取得する ---
      // UI上は「名前（文字列）」で持っているため、DB保存用にIDへ変換が必要
      const stopNames = [bookingData.departure, bookingData.arrival];

      const { data: stops, error: stopError } = await supabase
        .from('停留所')
        .select('stop_id, stop_name')
        .in('stop_name', stopNames);
      
      if (stopError) throw stopError;

      // 取得した停留所リストを { "停留所名": ID } の形式のマップに変換
      const stopMap = stops?.reduce((acc: any, stop: any) => {
        acc[stop.stop_name] = stop.stop_id;
        return acc;
      }, {});

      const boardingId = stopMap[bookingData.departure];
      const alightingId = stopMap[bookingData.arrival];

      // IDが見つからない場合はエラーを投げて中断
      if (!boardingId || !alightingId) {
        throw new Error('停留所IDが見つかりませんでした。');
      }

      // --- 手順1. 保存用データの準備 ---
      const bookings = [];

      // 「行き」の予約データを作成
      bookings.push({
        user_id: userId,
        trip_id: Number(bookingData.tripId),
        boarding_id: Number(boardingId),
        alighting_id: Number(alightingId),
        direction: bookingData.direction ? 1 : 0, // booleanをDB用に0/1へ変換
        adult_count: Number(bookingData.adults),
        child_count: Number(bookingData.children),
        reserved_count: Number(bookingData.adults) + Number(bookingData.children), // 合計人数
        status: 'active'
      });

      // 「往復」が選択されている場合は「帰り」のデータも追加
      if (bookingData.tripType === '往復' && bookingData.returnDate) {
        bookings.push({
          user_id: userId,
          trip_id: Number(bookingData.returnTripId),
          boarding_id: Number(alightingId), // 帰りは出発地と目的地が逆転
          alighting_id: Number(boardingId),
          direction: bookingData.returnDirection ? 1 : 0,
          adult_count: Number(bookingData.adults),
          child_count: Number(bookingData.children),
          reserved_count: Number(bookingData.adults) + Number(bookingData.children),
          status: 'active'
        });
      }

      // --- 手順2. Supabaseへデータを一括挿入 ---
      const { error } = await supabase
        .from('予約')
        .insert(bookings);

      if (error) throw error;

      // --- 手順3. 成功処理 ---
      // 親コンポーネントから渡された完了時処理を実行（完了画面への遷移など）
      onConfirm();

    } catch (error: any) {
      console.error('予約保存エラー:', error);
      alert('予約の保存に失敗しました。');
    } finally {
      // 成功・失敗に関わらずローディング状態を解除
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 外枠（水色の装飾部分） */}
        <div className="bg-cyan-400 rounded-[3rem] p-4 sm:p-8">
          {/* コンテンツカード（白背景部分） */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-12">
            <h1 className="text-xl sm:text-2xl text-blue-900 mb-6">バス予約</h1>

            {/* 注意事項の表示 */}
            <div className="mb-8">
              <p className="text-sm sm:text-base text-blue-900 mb-2">市営バスの予約をします</p>
              <p className="text-sm sm:text-base text-blue-900">目的地が表示されない場合はタクシー等の他の公共交通機関をお使いください</p>
            </div>

            {/* 区間表示（乗車地 → 降車地） */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-400 text-white px-4 sm:px-6 py-2 rounded-lg min-w-[80px] sm:min-w-[100px] text-center text-sm sm:text-base">
                  乗車
                </div>
                <div className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                  {bookingData.departure}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="text-cyan-400 text-3xl">↓</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-cyan-400 text-white px-4 sm:px-6 py-2 rounded-lg min-w-[80px] sm:min-w-[100px] text-center text-sm sm:text-base">
                  降車地
                </div>
                <div className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                  {bookingData.arrival}
                </div>
              </div>
            </div>

            {/* 予約種別ボタン（閲覧専用、状態により見た目を切り替え） */}
            <div className="flex gap-2 mb-6">
              <button
                className={`px-6 sm:px-8 py-2 rounded-lg text-sm sm:text-base ${bookingData.tripType === '片道'
                    ? 'bg-gray-300 text-black'
                    : 'bg-white border-2 border-gray-300 text-black'
                  }`}
              >
                片道
              </button>
              <button
                className={`px-6 sm:px-8 py-2 rounded-lg text-sm sm:text-base ${bookingData.tripType === '往復'
                    ? 'bg-cyan-400 text-white'
                    : 'bg-white border-2 border-gray-300 text-black'
                  }`}
              >
                往復
              </button>
            </div>

            {/* 日時情報セクション */}
            <div className="bg-gray-200 rounded-2xl p-4 sm:p-6 mb-6">
              {/* 行きの情報 */}
              <div className="mb-4">
                <div className="text-sm sm:text-base text-gray-700 mb-3">日時</div>
                <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-3 mb-3 text-sm sm:text-base">
                  {bookingData.date}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                    {bookingData.time.split(' ')[0]} {/* 始発時刻 */}
                  </div>
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                    {bookingData.time.split(' ')[1]} {/* 終着時刻 */}
                  </div>
                  <div className="bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm sm:text-base">
                    行き
                  </div>
                </div>
              </div>

              {/* 往復の場合のみ帰りの情報を表示 */}
              {bookingData.returnDate && bookingData.returnTime && (
                <div className="border-t-2 border-dotted border-gray-400 pt-4">
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-3 mb-3 text-sm sm:text-base">
                    {bookingData.returnDate}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                      {bookingData.returnTime.split(' ')[0]}
                    </div>
                    <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base">
                      {bookingData.returnTime.split(' ')[1]}
                    </div>
                    <div className="bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm sm:text-base">
                      帰り
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 予約人数表示 */}
            <div className="mb-8">
              <div className="text-sm sm:text-base text-gray-700 mb-3">人数</div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">おとな</span>
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base min-w-[60px] text-center">
                    {bookingData.adults}人
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">こども</span>
                  <div className="bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base min-w-[60px] text-center">
                    {bookingData.children}人
                  </div>
                </div>
              </div>
            </div>

            {/* 料金合計計算・表示 */}
            <div className="mb-8 border-t-2 border-gray-100 pt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm sm:text-base text-gray-700">料金合計</div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-900">
                    ￥{((bookingData.adults + bookingData.children) * (bookingData.fare || 0)).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">(税込)</span>
                </div>
              </div>
              {bookingData.tripType === '往復' && (
                <p className="text-xs text-gray-400 text-right mt-1">※往復分の合計金額です</p>
              )}
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col gap-4">
              <button
                onClick={onBack}
                disabled={isSubmitting} // 送信中は戻れないように制御
                className="w-full bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
              >
                戻る
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={isSubmitting} // 二重送信防止
                className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
              >
                {/* 送信中はローディングアイコンとテキストを表示 */}
                {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                {isSubmitting ? '処理中...' : '予約を確定する'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}