import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext'; // ログイン情報を取得

export function PasswordChangePage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';

  const handlePasswordChange = async () => {
    // 1. バリデーション
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'すべての項目を入力してください。' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'パスワードが一致しません。' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'セキュリティのため、8文字以上で設定してください。' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      console.log('パスワード更新開始...');

      // 2. Supabase Authentication（本物のログインパスワード）を更新
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) throw authError;

      // 3. 自作テーブル（管理者 または ユーザ）の同期
      const targetTable = isAdmin ? '管理者' : 'ユーザ';
      console.log(`${targetTable}テーブルの情報を同期中...`);

      const { error: dbError } = await supabase
        .from(targetTable)
        .update({ password_hash: 'managed_by_supabase_auth' })
        .eq('email', user?.email);

      if (dbError) {
        console.error('DB同期エラー:', dbError);
        // パスワード自体は変わっているので、警告のみ出す
        setMessage({ type: 'success', text: 'パスワードを変更しました（一部データの同期に失敗しました）。' });
      } else {
        setMessage({ type: 'success', text: 'パスワードを正常に変更しました。' });
      }

      // 成功したら入力欄をクリア
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      console.error('変更失敗:', err);
      setMessage({ type: 'error', text: '変更に失敗しました: ' + (err.message || '通信エラー') });
    } finally {
      // ★ ここが重要！成功しても失敗しても必ず読み込み中を終わらせる
      setLoading(false);
    }
  };

  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8 shadow-xl`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-8 text-blue-600 font-bold">パスワード変更</h2>
        
        {message && (
          <div className={`mb-8 p-4 rounded-xl border ${
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="flex items-center gap-2 font-bold">
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
                placeholder="8文字以上"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-blue-600 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-blue-600 outline-none"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              onClick={onBack}
              disabled={loading}
              className="bg-gray-500 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-gray-600 font-bold"
            >
              戻る
            </button>
            <button 
              onClick={handlePasswordChange}
              disabled={loading}
              className="bg-blue-600 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-all font-bold shadow-md disabled:opacity-50"
            >
              {loading ? '変更中...' : 'パスワードを変更する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}