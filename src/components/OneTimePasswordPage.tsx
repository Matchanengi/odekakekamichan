import { useState } from 'react';
import { supabase } from './supabaseClient';

interface OneTimePasswordPageProps {
  onConfirm: () => void;
  onBack: () => void;
  email: string;
}

export function OneTimePasswordPage({ onConfirm, onBack, email }: OneTimePasswordPageProps) {
  const [oneTimePassword, setOneTimePassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!oneTimePassword) {
      alert('ワンタイムパスワードを入力してください');
      return;
    }

    setLoading(true);
    try {
      const { data: user, error } = await supabase
        .from('ユーザ')
        .select('reset_otp_code, reset_otp_expires_at')
        .eq('email', email)
        .single();

      if (error) throw new Error('通信エラーが発生しました。');

      if (user?.reset_otp_code === oneTimePassword) {
        // 期限チェック
        const isExpired = new Date() > new Date(user.reset_otp_expires_at);
        if (isExpired) {
          alert('有効期限（10分）が切れています。もう一度送信し直してください。');
          onBack();
        } else {
          onConfirm(); // 成功：パスワード設定画面へ
        }
      } else {
        alert('ワンタイムパスワードが正しくありません');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12 text-2xl font-bold">ワンタイムパスワード入力</h1>
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-blue-900 leading-relaxed text-center">
                <p>（<span className="italic">{email}</span>）に送信されたコードを入力してください。</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[200px]">ワンタイムパスワード</label>
                <input
                  type="text"
                  value={oneTimePassword}
                  onChange={(e) => setOneTimePassword(e.target.value)}
                  placeholder="123456"
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg text-center font-bold"
                />
              </div>
              <div className="flex items-center justify-center gap-6 pt-6">
                <button onClick={onBack} className="px-12 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg">
                  戻る
                </button>
                <button onClick={handleConfirm} disabled={loading} className="px-12 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
                  {loading ? '照合中...' : '確認'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}