import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext';

export function PasswordChangePage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'パスワードを入力してください。' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '確認用パスワードが一致しません。' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'セキュリティのため、パスワードは8文字以上で設定してください。' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) {
        if (authError.message.includes("different from the old password")) {
          throw new Error("新しいパスワードは、現在のパスワードと異なるものを入力してください。");
        }
        throw authError;
      }

      const targetTable = isAdmin ? '管理者' : 'ユーザ';
      const { error: dbError } = await supabase
        .from(targetTable)
        .update({ password_hash: 'managed_by_supabase_auth' })
        .eq('email', user?.email);

      if (dbError) {
        setMessage({ type: 'success', text: 'パスワードを変更しました（一部データの同期に失敗しました）。' });
      } else {
        setMessage({ type: 'success', text: 'パスワードを正常に変更しました！' });
      }

      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '通信エラーが発生しました。' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8 shadow-xl`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-inner">
        <h2 className="text-2xl sm:text-3xl mb-8 text-blue-600 font-bold border-l-4 border-blue-600 pl-4">パスワード変更</h2>
        
        {/* --- Googleユーザー向けのご案内カード --- */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 text-[11px] sm:text-xs text-blue-800 leading-relaxed shadow-sm">
          <p className="font-bold mb-1 flex items-center gap-1"><span>✨</span> Googleアカウントでログイン中の方へ</p>
          <p>
            ここでパスワードを設定すると、次回から「Googleログイン」だけでなく、「メールアドレスとパスワード」でのログインも併用できるようになります（アカウントは共通のまま維持されます）。
          </p>
        </div>

        {message && (
          <div className={`mb-8 p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <p className="flex items-center gap-3 font-bold text-lg">
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </p>
          </div>
        )}

        <div className="space-y-6 sm:space-y-8 max-w-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">新しいパスワード</label>
            <div className="flex-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                placeholder="8文字以上で入力"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">確認用パスワード</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="もう一度入力"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex gap-4 pt-6">
            <button
              onClick={onBack}
              disabled={loading}
              className="bg-gray-100 text-gray-600 px-8 sm:px-12 py-3 rounded-xl hover:bg-gray-200 transition-all font-bold"
            >
              戻る
            </button>
            <button 
              onClick={handlePasswordChange}
              disabled={loading}
              className="bg-blue-600 text-white px-8 sm:px-12 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? '変更処理中...' : 'パスワードを更新'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}