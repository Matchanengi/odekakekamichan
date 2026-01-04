interface BookingCompletePageProps {
  onComplete: () => void;
}

export function BookingCompletePage({ onComplete }: BookingCompletePageProps) {
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-16">予約完了</h1>

            <div className="max-w-2xl mx-auto">
              {/* メッセージボックス */}
              <div className="bg-gray-200 rounded-3xl p-12 mb-16 text-center">
                <p className="text-blue-900 text-xl">担当者に予約内容をお送りしました。</p>
              </div>

              {/* 完了ボタン */}
              <div className="flex justify-center">
                <button
                  onClick={onComplete}
                  className="bg-blue-600 text-white px-20 py-4 rounded-lg hover:bg-blue-700 transition-colors"
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
