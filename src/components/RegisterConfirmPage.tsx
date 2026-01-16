import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabaseClient';

interface RegisterConfirmPageProps {
  data: { name: string; email: string; password: string; };
  onConfirm: () => void;
  onBack: () => void;
}

export function RegisterConfirmPage({ data, onConfirm, onBack }: RegisterConfirmPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 親切なエラーメッセージへの変換
  const getFriendlyErrorMessage = (err: any) => {
    const msg = err.message || '';
    if (msg.includes('User already registered')) return 'このメールアドレスは既に登録されています。';
    if (msg.includes('Password should be')) return 'パスワードは8文字以上で設定してください。';
    return '登録中にエラーが発生しました。入力内容を確認してやり直してください。';
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Auth登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('登録に失敗しました');

      // 2. DB保存
      const { error: dbError } = await supabase
        .from('ユーザ')
        .insert([{ name: data.name, email: data.email, password_hash: 'managed_by_auth' }]);
      if (dbError) throw dbError;

      onConfirm();
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12 shadow-xl">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-8 text-center text-3xl font-bold">登録内容の確認</h1>

            {error && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-red-900 font-bold mb-1">登録できませんでした</p>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="max-w-2xl mx-auto space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-4">
                  <label className="text-blue-900 font-bold sm:min-w-[160px]">お名前</label>
                  <div className="text-gray-900 text-xl">{data.name}</div>
                </div>
                <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-4">
                  <label className="text-blue-900 font-bold sm:min-w-[160px]">Email</label>
                  <div className="text-gray-900 text-xl">{data.email}</div>
                </div>
                <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-4">
                  <label className="text-blue-900 font-bold sm:min-w-[160px]">パスワード</label>
                  <div className="flex items-center gap-4">
                    <div className="text-gray-900 text-xl font-mono">
                      {showPassword ? data.password : '●●●●●●●●'}
                    </div>
                    <button onClick={() => setShowPassword(!showPassword)} className="text-blue-900 p-2">
                      {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <button
                  onClick={onBack}
                  disabled={loading}
                  className="px-12 py-5 bg-white text-blue-900 border-2 border-blue-900 font-bold text-xl rounded-2xl hover:bg-gray-50 transition-all"
                >
                  修正する
                </button>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="px-12 py-5 bg-blue-900 text-white font-bold text-xl rounded-2xl hover:bg-blue-800 shadow-lg active:scale-95 transition-all"
                >
                  {loading ? '登録中...' : 'この内容で決定'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}