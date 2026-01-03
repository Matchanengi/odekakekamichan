export function MessagesPage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const messages = [
    { subject: "予約時間が近づきました", date: "11:50" },
    { subject: "予約が完了しました", date: "11月20日" },
    { subject: "予約を受け付けました", date: "11月19日" },
    { subject: "会員登録が完了しました", date: "11月15日" },
  ];
  
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';
  const headerColor = isAdmin ? 'bg-green-600' : 'bg-cyan-600';

  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">メッセージ</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className={headerColor}>
                <th className="border-2 border-black px-4 py-3 text-center text-white">件名</th>
                <th className="border-2 border-black px-4 py-3 text-center text-white">日付</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message, index) => (
                <tr key={index} className="bg-gray-200">
                  <td className="border-2 border-black px-4 py-3 text-center">{message.subject}</td>
                  <td className="border-2 border-black px-4 py-3 text-center italic">{message.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}