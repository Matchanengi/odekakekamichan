import { useState } from "react";

export function ContactPage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';

  if (isSubmitted) {
    return (
      <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
        <div className="bg-white rounded-3xl p-6 sm:p-12">
          <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">送信完了</h2>
          
          <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] gap-8">
            <div className="border-2 border-black bg-gray-300 rounded-lg p-8 sm:p-12 max-w-2xl w-full text-center">
              <p className="text-lg sm:text-xl leading-relaxed">
                お問い合わせ内容をお送りしました。<br />
                返信には2～3日かかります。
              </p>
            </div>
            
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-16 sm:px-24 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              確認
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">お問い合わせ</h2>
        
        <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-blue-600 min-w-[120px]">氏名</label>
            <input
              type="text"
              placeholder="香美"
              className="flex-1 border-2 border-black rounded-lg px-4 py-2"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-blue-600 min-w-[120px]">名前</label>
            <input
              type="text"
              placeholder="太郎"
              className="flex-1 border-2 border-black rounded-lg px-4 py-2"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-blue-600 italic min-w-[120px]">Email</label>
            <input
              type="email"
              className="flex-1 border-2 border-black rounded-lg px-4 py-2"
            />
          </div>
          
          <div>
            <label className="text-blue-600 block mb-3">お問い合わせ内容</label>
            <textarea
              rows={8}
              className="w-full border-2 border-black rounded-lg px-4 py-2"
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={() => setIsSubmitted(true)}
              className="bg-blue-600 text-white px-12 sm:px-20 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}