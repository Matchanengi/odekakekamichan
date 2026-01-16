import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabaseClient'; // パスを ./ に修正（直下にない場合）

interface NewPasswordPageProps {
  email: string;      // 親から渡されるメールアドレス
  otp: string;        // ★追加: 前の画面で入力された認証コード
  onComplete: () => void; 
}

export function NewPasswordPage({ email, otp, onComplete }: NewPasswordPageProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // 1. バリデーション
    if (!newPassword || !confirmPassword) {
      alert('すべての項目を入力してください');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }
    if (newPassword.length < 8) {
      alert('セキュリティのため、パスワードは8文字以上で設定してください');
      return;
    }
    if (!email || !otp) {
      alert('エラー：セッションが切断されました。最初からやり直してください。');
      return;
    }

    setLoading(true);

    try {
      // ★修正ポイント: Edge Function (index.ts) を呼び出してパスワードをリセットする
      // これにより Authentication 側の本物のパスワードが書き換わります
      const { data: _, error } = await supabase.functions.invoke('server', {
        body: { 
          action: 'reset-password', 
          email: email,
          otp: otp,
          newPassword: newPassword
        },
      });

      if (error) {
        const errorData = await error.context?.json();
        throw new Error(errorData?.error || 'パスワードの更新に失敗しました');
      }

      // 3. 成功処理
      alert('パスワードを正常に再設定しました。新しいパスワードでログインしてください。');
      onComplete();

    } catch (err: any) {
      console.error(err);
      alert(err.message || '予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12 text-3xl font-bold text-center">新しいパスワードの設定</h1>

            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-blue-900 leading-relaxed text-center">
                <p>安全な新しいパスワードを入力してください。</p>
              </div>

              {/* 新しいパスワード入力 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 font-bold sm:min-w-[180px]">新パスワード</label>
                <div className="flex-1 relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-900 rounded-lg pr-12 outline-none focus:ring-2 focus:ring-cyan-300"
                    placeholder="8文字以上"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* 確認用パスワード入力 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 font-bold sm:min-w-[180px]">確認用</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-1/2 flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg outline-none focus:ring-2 focus:ring-cyan-300"
                  placeholder="もう一度入力"
                  disabled={loading}
                />
              </div>

              {/* 決定ボタン */}
              <div className="flex items-center justify-center pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-20 py-4 bg-blue-900 text-white font-bold text-lg rounded-xl hover:bg-blue-800 transition-colors shadow-lg disabled:bg-slate-400"
                >
                  {loading ? '更新中...' : 'パスワードを更新する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}