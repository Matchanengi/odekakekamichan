import { useState } from 'react';
import { supabase } from './supabaseClient';

interface PasswordResetPageProps {
  onBack: () => void;
  onSendEmail: (email: string) => void;
}

export function PasswordResetPage({ onBack, onSendEmail }: PasswordResetPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!email) {
      alert('メールアドレスを入力してください');
      return;
    }

    setLoading(true);
    try {
      // 1. ユーザー存在チェック
      const { data: user, error: fetchError } = await supabase
        .from('ユーザ')
        .select('id')
        .eq('email', email)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          alert('このメールアドレスは登録されていません');
        } else {
          throw new Error('通信に失敗しました。ネットワーク環境を確認してください。');
        }
        return;
      }

      // 2. ワンタイムパスワード生成 (6桁)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60000).toISOString(); // 5分有効

      // 3. データベース更新
      const { error: updateError } = await supabase
        .from('ユーザ')
        .update({ 
          reset_otp_code: otp, 
          reset_otp_expires_at: expiresAt 
        })
        .eq('email', email);

      if (updateError) throw new Error('認証コードの保存に失敗しました。');

      // 4. 送信処理（テスト用アラート）と遷移
      alert(`【テスト用】ワンタイムパスワードを送りました: ${otp}`);
      onSendEmail(email);

    } catch (err: any) {
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
            <h1 className="text-blue-900 mb-12 text-2xl font-bold">パスワードリセット</h1>
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-blue-900 leading-relaxed">
                <p>ご登録いただいているメールアドレスにワンタイムパスワードを送信いたします。</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 italic sm:min-w-[120px]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-center gap-6 pt-6">
                <button onClick={onBack} className="px-12 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg hover:bg-gray-50 transition-colors">
                  戻る
                </button>
                <button onClick={handleSendEmail} disabled={loading} className="px-12 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:bg-slate-400">
                  {loading ? '送信中...' : '送信'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}