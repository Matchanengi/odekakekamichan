export function EmailChangePage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';
  
  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">E-mail変更</h2>
        
        <div className="space-y-6 sm:space-y-8 max-w-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-blue-600 min-w-[140px] sm:min-w-[180px]">新しいE-mail</label>
            <input
              type="email"
              className="flex-1 border-2 border-gray-800 rounded-lg px-4 py-2"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-blue-600 min-w-[140px] sm:min-w-[180px]">確認用E-mail</label>
            <input
              type="email"
              className="flex-1 border-2 border-gray-800 rounded-lg px-4 py-2"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              onClick={onBack}
              className="bg-gray-500 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              戻る
            </button>
            <button className="bg-blue-600 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors">
              変更
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}