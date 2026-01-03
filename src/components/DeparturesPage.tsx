export function DeparturesPage() {
  const departures = [
    {
      id: 1,
      route: '蕨野線',
      time: '09:30',
      reserved: 5,
      capacity: 10
    },
    {
      id: 2,
      route: '白川線',
      time: '10:30',
      reserved: 10,
      capacity: 10
    }
  ];

  const handlePrintPassengerList = (departureId: number) => {
    // PDF出力機能は将来実装予定
    console.log(`乗車客リストPDF出力: ${departureId}`);
  };

  return (
    <div>
      <h2 className="mb-6 text-xl sm:text-3xl">まもなく出発する便</h2>
      
      <div className="border-4 border-black rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base sm:text-lg min-w-[600px]">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">路線名</th>
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">乗車時間</th>
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">予約/定員</th>
                <th className="py-3 sm:py-4 px-3 sm:px-6">乗客リスト</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {departures.map((departure) => (
                <tr key={departure.id} className="border-t-4 border-black">
                  <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                    {departure.route}
                  </td>
                  <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                    <span className="text-blue-400">{departure.time}</span> 発
                  </td>
                  <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                    <span className={departure.reserved === departure.capacity ? 'text-red-600' : 'text-cyan-400'}>
                      {departure.reserved}
                    </span>
                    {' / '}{departure.capacity} 人
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                    <button
                      className="text-red-600 hover:text-red-800 cursor-pointer underline"
                      onClick={() => handlePrintPassengerList(departure.id)}
                    >
                      印刷
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="border-t-4 border-black">
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">：</td>
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">：</td>
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">：</td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">：</td>
              </tr>
              <tr className="border-t-4 border-black">
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">：</td>
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">：</td>
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">：</td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">：</td>
              </tr>
              <tr className="border-t-4 border-black">
                <td className="border-r-4 border-black py-4 sm:py-8 px-3 sm:px-6"></td>
                <td className="border-r-4 border-black py-4 sm:py-8 px-3 sm:px-6"></td>
                <td className="border-r-4 border-black py-4 sm:py-8 px-3 sm:px-6"></td>
                <td className="py-4 sm:py-8 px-3 sm:px-6"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}