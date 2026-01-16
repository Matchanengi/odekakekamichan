import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterPageProps {
  onShowConfirm: (data: {
    name: string;
    email: string;
    password: string;
  }) => void;
  initialData?: { name: string; email: string; password: string; } | null;
}

export function RegisterPage({ onShowConfirm, initialData }: RegisterPageProps) {
  // initialDataがあればそれを初期値にする（修正時に内容が保持される）
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState(initialData?.password || '');
  const [confirmPassword, setConfirmPassword] = useState(initialData?.password || '');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    if (!name || !email || !password) {
      alert('すべての項目を入力してください');
      return;
    }
    if (password.length < 8) {
      alert('パスワードは8文字以上で設定してください');
      return;
    }
    if (password !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }
    
    onShowConfirm({ name, email, password });
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12 shadow-xl">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12 text-center text-3xl font-bold">新規登録</h1>

            <div className="max-w-2xl mx-auto space-y-8">
              {/* お名前 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 font-bold sm:min-w-[140px]">お名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="香美 太郎"
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 font-bold sm:min-w-[140px]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              {/* パスワード */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 font-bold sm:min-w-[140px]">パスワード</label>
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8文字以上"
                    className="w-full px-4 py-3 border-2 border-blue-900 rounded-lg pr-12 outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900 hover:text-cyan-600 p-2"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* 確認用パスワード */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 font-bold sm:min-w-[140px]">確認用</label>
                <div className="flex-1 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="もう一度入力"
                    className="w-full px-4 py-3 border-2 border-blue-900 rounded-lg pr-12 outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900 hover:text-cyan-600 p-2"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button
                  onClick={handleSubmit}
                  className="px-20 py-4 bg-blue-900 text-white font-bold text-lg rounded-xl hover:bg-blue-800 transition-all shadow-lg active:scale-95"
                >
                  確認画面へ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}