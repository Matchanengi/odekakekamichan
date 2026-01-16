import { useState } from 'react';
import { supabase } from './supabaseClient';

interface OneTimePasswordPageProps {
  // ★ 入力されたOTPを親に渡せるように引数を追加
  onConfirm: (otp: string) => void; 
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
      // 1. データベースから現在のコードと期限を取得
      const { data: user, error } = await supabase
        .from('ユーザ')
        .select('reset_otp_code, reset_otp_expires_at')
        .eq('email', email)
        .single();

      if (error) throw new Error('通信エラーが発生しました。');

      // 2. コードの照合
      if (user?.reset_otp_code === oneTimePassword) {
        // 3. 有効期限のチェック
        const isExpired = new Date() > new Date(user.reset_otp_expires_at);
        if (isExpired) {
          alert('有効期限（10分）が切れています。もう一度送信し直してください。');
          onBack();
        } else {
          // ★成功：入力したコードを引数に入れて親（App.tsx）に渡す
          onConfirm(oneTimePassword); 
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
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-8 text-3xl font-bold text-center">コード確認</h1>
            
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-blue-900 leading-relaxed text-center text-lg">
                <p>（<span className="italic font-bold">{email}</span>）<br className="sm:hidden"/>宛に送信された認証コードを入力してください。</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 font-bold sm:min-w-[160px]">認証コード</label>
                <input
                  type="text"
                  value={oneTimePassword}
                  onChange={(e) => setOneTimePassword(e.target.value)}
                  placeholder="6桁の数字"
                  maxLength={6}
                  className="flex-1 px-4 py-4 border-2 border-blue-900 rounded-lg text-center text-3xl font-mono tracking-[0.5em] outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="flex items-center justify-center gap-6 pt-6">
                <button 
                  onClick={onBack} 
                  className="px-12 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  戻る
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={loading} 
                  className="px-12 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:bg-slate-400 transition-colors shadow-lg"
                >
                  {loading ? '照合中...' : '次へ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}