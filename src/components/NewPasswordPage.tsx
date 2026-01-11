import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabaseClient'; // 同じフォルダ内のクライアントをインポート

interface NewPasswordPageProps {
  email: string;      // 親から渡される更新対象のメールアドレス
  onComplete: () => void; // 完了後にログイン画面へ戻るための関数
}

export function NewPasswordPage({ email, onComplete }: NewPasswordPageProps) {
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
    if (!email) {
      alert('エラー：メールアドレスが正しく引き継がれていません。最初からやり直してください。');
      return;
    }

    setLoading(true);
    try {
      // 2. Supabaseの「ユーザ」テーブルを更新
      const { data, error } = await supabase
        .from('ユーザ')
        .update({
          password_hash: newPassword, // パスワードを更新
          reset_otp_code: null,       // 【重要】使い終わったコードを消去
          reset_otp_expires_at: null  // 【重要】期限もリセット
        })
        .eq('email', email)           // このメールアドレスの行だけを特定
        .select();                    // 更新結果を返してもらう（確認用）

      // 通信エラーなどの判定
      if (error) {
        throw new Error(`通信エラーが発生しました: ${error.message}`);
      }

      // 更新された行があるかチェック
      if (!data || data.length === 0) {
        throw new Error('更新対象のユーザーが見つかりませんでした。');
      }

      // 3. 成功処理
      alert('パスワードを正常に再設定しました。新しいパスワードでログインしてください。');
      onComplete();

    } catch (err: any) {
      // 通信失敗やその他のエラーを表示
      alert(err.message || '予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12 text-2xl font-bold">パスワード再設定</h1>

            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-blue-900 leading-relaxed">
                <p>新しいパスワードを設定してください。</p>
              </div>

              {/* 新しいパスワード入力 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[180px]">新しいパスワード</label>
                <div className="flex-1 relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-900 rounded-lg pr-12 outline-none focus:ring-2 focus:ring-cyan-300"
                    placeholder="8文字以上"
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
                <label className="text-blue-900 sm:min-w-[180px]">確認用パスワード</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg outline-none focus:ring-2 focus:ring-cyan-300"
                  placeholder="もう一度入力"
                />
              </div>

              {/* 決定ボタン */}
              <div className="flex items-center justify-center pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-16 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-lg disabled:bg-slate-400"
                >
                  {loading ? '更新中...' : '決定'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}