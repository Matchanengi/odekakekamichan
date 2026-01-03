import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function MemberRegistrationInfoPage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';
  const password = 'aaaaaaaaaaaaa';
  
  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">登録情報確認</h2>
        
        <div className="space-y-6 sm:space-y-8 max-w-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
            <span className="text-blue-600 min-w-[140px] sm:min-w-[180px]">氏名</span>
            <span className="text-lg sm:text-xl">香美</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
            <span className="text-blue-600 min-w-[140px] sm:min-w-[180px]">名前</span>
            <span className="text-lg sm:text-xl">太郎</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
            <span className="text-blue-600 min-w-[140px] sm:min-w-[180px]">Email</span>
            <span className="text-lg sm:text-xl italic">kamitaro.12345@gmail.com</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
            <span className="text-blue-600 min-w-[140px] sm:min-w-[180px]">パスワード</span>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl">{showPassword ? password : '*****************'}</span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
            <span className="text-blue-600 min-w-[140px] sm:min-w-[180px]">googleアカウント</span>
            <span className="text-lg sm:text-xl">連携済み</span>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              onClick={onBack}
              className="bg-gray-500 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              戻る
            </button>
            <button className="bg-blue-600 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors">
              決定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}