/**
 * 予約完了画面のプロパティ（Props）定義
 */
interface BookingCompletePageProps {
  // 「完了」ボタンをクリックした際に実行されるコールバック関数
  // 通常はトップ画面への遷移や、アプリ状態のリセットに使用されます
  onComplete: () => void;
}

/**
 * BookingCompletePage コンポーネント
 * 予約が正常にシステムへ登録された後に表示される最終確認画面です
 */
export function BookingCompletePage({ onComplete }: BookingCompletePageProps) {
  return (
    // 画面全体の背景設定：画面いっぱいの高さ（min-h-screen）を確保
    <div className="min-h-screen bg-white py-8 px-4">
      
      {/* コンテンツの最大幅を制限して中央に配置 */}
      <div className="max-w-4xl mx-auto">
        
        {/* 外枠：水色（cyan-400）の大きな角丸ボックス */}
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          
          {/* 内枠：白背景のメインカード部分 */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            
            {/* 画面タイトル：予約完了を通知 */}
            <h1 className="text-blue-900 mb-16 text-2xl font-bold">予約完了</h1>

            <div className="max-w-2xl mx-auto">
              
              {/* メッセージボックス：
                  ユーザーに対して「予約が受け付けられ、次のステップに進んでいること」を伝えます */}
              <div className="bg-gray-200 rounded-3xl p-12 mb-16 text-center">
                <p className="text-blue-900 text-xl leading-relaxed">
                  担当者に予約内容をお送りしました。
                </p>
              </div>

              {/* 完了ボタンのアクションエリア */}
              <div className="flex justify-center">
                <button
                  onClick={onComplete}
                  className="bg-blue-600 text-white px-20 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                >
                  完了
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}