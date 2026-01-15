import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from "./supabaseClient";

interface LoginPageProps {
  onLoginAsUser: () => void;
  onLoginAsAdmin: () => void;
  onShowRegister?: () => void;
  onShowPasswordReset?: () => void;
  message?: string;
}

export function LoginPage({ 
  onLoginAsUser, 
  onLoginAsAdmin, 
  onShowRegister, 
  onShowPasswordReset, 
  message 
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin // handles both dev and prod
      }
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Email/Password login
  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    const { data: _data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Success - call appropriate callback based on user role
    // You might want to check user role here
    onLoginAsUser();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12">ログイン</h1>

            {/* Error Message */}
            {error && (
              <div className="mb-8 max-w-2xl mx-auto">
                <div className="bg-red-100 border-2 border-red-400 rounded-xl p-6 text-center">
                  <p className="text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mb-8 max-w-2xl mx-auto">
                <div className="bg-cyan-100 border-2 border-cyan-400 rounded-xl p-6 text-center">
                  <p className="text-blue-900">{message}</p>
                </div>
              </div>
            )}

            <div className="max-w-2xl mx-auto space-y-8">
              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Googleでログイン
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">または</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 italic sm:min-w-[120px]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[120px]">パスワード</label>
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-900 rounded-lg pr-12"
                    disabled={loading}
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
                  <button onClick={onShowRegister} className="hover:underline text-left">
                    →新規登録の方はこちら
                  </button>
                </div>
                <div>
                  <button onClick={onShowPasswordReset} className="hover:underline">
                    →パスワードをお忘れの方はこちら
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-4 pt-6">
                <button
                  onClick={onLoginAsUser}
                  disabled={loading}
                  className="px-8 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  一般
                </button>
                <button
                  onClick={handleEmailLogin}
                  disabled={loading}
                  className="px-12 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
                >
                  {loading ? '処理中...' : '決定'}
                </button>
                <button
                  onClick={onLoginAsAdmin}
                  disabled={loading}
                  className="px-8 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg hover:bg-gray-50 disabled:opacity-50"
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