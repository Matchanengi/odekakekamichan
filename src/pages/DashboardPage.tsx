export function DashboardPage() {
  return (
    <div>
      <h2 className="mb-8 text-2xl sm:text-3xl">本日の利用状況</h2>
      
      <div className="flex flex-col sm:flex-row gap-6 mt-12">
        <div className="flex-1">
          <div className="border-4 border-black rounded-2xl overflow-hidden">
            <div className="bg-green-700 text-white py-4 sm:py-6 px-4 sm:px-8 text-center text-xl sm:text-2xl">
              今日の予約件数
            </div>
            <div className="bg-white py-8 sm:py-16 text-center">
              <span className="text-4xl sm:text-6xl">15件</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="border-4 border-black rounded-2xl overflow-hidden">
            <div className="bg-green-700 text-white py-4 sm:py-6 px-4 sm:px-8 text-center text-xl sm:text-2xl">
              承認待ち
            </div>
            <div className="bg-white py-8 sm:py-16 text-center">
              <span className="text-4xl sm:text-6xl">4 件</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
