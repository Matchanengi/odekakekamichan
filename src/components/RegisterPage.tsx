import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterPageProps {
  onShowConfirm?: (data: {
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    googleLinked: boolean;
  }) => void;
}

export function RegisterPage({ onShowConfirm }: RegisterPageProps) {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [googleLinked, setGoogleLinked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleLogin = () => {
    // Google連携の処理（モック）
    setGoogleLinked(true);
    console.log('Google連携');
  };

  const handleSubmit = () => {
    // 登録処理（モック）
    if (password !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }
    console.log('登録完了');
    if (onShowConfirm) {
      onShowConfirm({
        lastName,
        firstName,
        email,
        password,
        googleLinked
      });
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12">新規登録</h1>

            <div className="max-w-2xl mx-auto space-y-8">
              {/* Last Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[140px]">氏名</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="香美"
                  className="flex-1 px-4 py-3 border-2 border-black rounded-lg placeholder:text-gray-400"
                />
              </div>

              {/* First Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[140px]">名前</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="太郎"
                  className="flex-1 px-4 py-3 border-2 border-black rounded-lg placeholder:text-gray-400"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 italic sm:min-w-[140px]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-black rounded-lg"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[140px]">パスワード</label>
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[140px]">確認用パスワード</label>
                <div className="flex-1 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                    onTouchStart={() => setShowConfirmPassword(true)}
                    onTouchEnd={() => setShowConfirmPassword(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Google Login Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleGoogleLogin}
                  className="bg-cyan-400 text-white px-8 py-4 rounded-lg hover:bg-cyan-500 transition-colors flex items-center gap-3 border-2 border-black"
                >
                  <div className="flex items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
                      <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
                      <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
                      <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
                    </svg>
                    <span className="text-xl">google連携</span>
                  </div>
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleSubmit}
                  className="px-20 py-4 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-colors"
                >
                  確認
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}