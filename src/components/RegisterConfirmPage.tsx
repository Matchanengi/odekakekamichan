import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterConfirmPageProps {
  data: {
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    googleLinked: boolean;
  };
  onConfirm: () => void;
}

export function RegisterConfirmPage({ data, onConfirm }: RegisterConfirmPageProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12">新規登録確認</h1>

            <div className="max-w-2xl mx-auto space-y-8">
              {/* Last Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[200px]">氏名</label>
                <div className="flex-1 text-gray-900">{data.lastName}</div>
              </div>

              {/* First Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[200px]">名前</label>
                <div className="flex-1 text-gray-900">{data.firstName}</div>
              </div>

              {/* Email */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 italic sm:min-w-[200px]">Email</label>
                <div className="flex-1 text-gray-900">{data.email}</div>
              </div>

              {/* Password */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[200px]">パスワード</label>
                <div className="flex-1 flex items-center gap-4">
                  <div className="text-gray-900">
                    {showPassword ? data.password : '*'.repeat(17)}
                  </div>
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Google Account */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 italic sm:min-w-[200px]">googleアカウント</label>
                <div className="flex-1 text-gray-900">
                  {data.googleLinked ? '連携済み' : '未連携'}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={onConfirm}
                  className="px-20 py-4 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-colors"
                >
                  決定
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}