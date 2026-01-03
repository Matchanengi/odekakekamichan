import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLoginAsUser: () => void;
  onLoginAsAdmin: () => void;
  onShowRegister?: () => void;
  onShowPasswordReset?: () => void;
}

export function LoginPage({ onLoginAsUser, onLoginAsAdmin, onShowRegister, onShowPasswordReset }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12">ログイン</h1>

            <div className="max-w-2xl mx-auto space-y-8">
              {/* Email */}
              <div className="flex items-center gap-8">
                <label className="text-blue-900 italic min-w-[120px]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg"
                />
              </div>

              {/* Password */}
              <div className="flex items-center gap-8">
                <label className="text-blue-900 min-w-[120px]">パスワード</label>
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-900 rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-3 text-blue-900">
                <div>
                  <button 
                    onClick={onShowRegister}
                    className="hover:underline text-left"
                  >
                    →新規登録の方はこちら
                  </button>
                </div>
                <div>
                  <button
                    onClick={onShowPasswordReset}
                    className="hover:underline"
                  >
                    →パスワードをお忘れの方はこちら
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-4 pt-6">
                <button
                  onClick={onLoginAsUser}
                  className="px-8 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg hover:bg-gray-50"
                >
                  一般
                </button>
                <button
                  className="px-12 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                >
                  決定
                </button>
                <button
                  onClick={onLoginAsAdmin}
                  className="px-8 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg hover:bg-gray-50"
                >
                  管理者
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}