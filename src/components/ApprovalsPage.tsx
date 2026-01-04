import { useState } from 'react';
import { ReservationDetailModal } from './ReservationDetailModal';

export function ApprovalsPage() {
  const [selectedReservation, setSelectedReservation] = useState<number | null>(null);

  const approvals = [
    {
      id: 1,
      route: "蕨野線",
      time: "09:30",
      name: "山田 太郎",
      people: 2,
      status: "承認待ち",
      date: "25/11/18",
    },
    {
      id: 2,
      route: "白川線",
      time: "10:30",
      name: "香美 花子",
      people: 1,
      status: "承認待ち",
      date: "25/11/18",
    },
  ];

  const selectedApproval = approvals.find((a) => a.id === selectedReservation);

  return (
    <div>
      <h2 className="mb-6 text-xl sm:text-3xl">
        <span className="text-black">
          【最優先】承認待ちの予約{" "}
        </span>
        <span className="text-red-600">(4件)</span>
      </h2>

      <div className="border-4 border-black rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base sm:text-lg min-w-[600px]">
            <thead>
              <tr className="bg-green-700 text-white">
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">
                  路線名
                </th>
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">
                  乗車時間
                </th>
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">
                  予約者名
                </th>
                <th className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6">
                  人数
                </th>
                <th className="py-3 sm:py-4 px-3 sm:px-6">
                  詳細
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {approvals.map((approval) => (
                <tr
                  key={approval.id}
                  className="border-t-4 border-black"
                >
                  <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                    {approval.route}
                  </td>
                  <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                    <span className="text-blue-400">
                      {approval.time}
                    </span>{" "}
                    発
                  </td>
                  <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                    {approval.name}
                  </td>
                  <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                    {approval.people}名
                  </td>
                  <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                    <span
                      className="text-red-600 cursor-pointer"
                      onClick={() => setSelectedReservation(approval.id)}
                    >
                      確認
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="border-t-4 border-black">
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                  ：
                </td>
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                  ：
                </td>
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                  ：
                </td>
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                  ：
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                  ：
                </td>
              </tr>
              <tr className="border-t-4 border-black">
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                  ：
                </td>
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                  ：
                </td>
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                  ：
                </td>
                <td className="border-r-4 border-black py-3 sm:py-4 px-3 sm:px-6 text-center">
                  ：
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                  ：
                </td>
              </tr>
              <tr className="border-t-4 border-black">
                <td className="border-r-4 border-black py-4 sm:py-8 px-3 sm:px-6"></td>
                <td className="border-r-4 border-black py-4 sm:py-8 px-3 sm:px-6"></td>
                <td className="border-r-4 border-black py-4 sm:py-8 px-3 sm:px-6"></td>
                <td className="border-r-4 border-black py-4 sm:py-8 px-3 sm:px-6"></td>
                <td className="py-4 sm:py-8 px-3 sm:px-6"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {selectedApproval && (
        <ReservationDetailModal
          isOpen={true}
          reservation={selectedApproval}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
}