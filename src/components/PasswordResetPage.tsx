import { useState } from 'react';
import { supabase } from './supabaseClient'; // パスが src/components/ なら ./ でOK

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
      // ★Supabase SDKの機能を使って Edge Function を呼び出す
      // 第1引数は関数名（フォルダ名）、第2引数にオプション
      const { data, error } = await supabase.functions.invoke('server', {
        body: { 
          action: 'send-otp', 
          email: email 
        },
      });

      // SDKのエラー判定
      if (error) {
        // Edge Function側で返した 404 や 500 もここに入ります
        const errorData = await error.context?.json();
        throw new Error(errorData?.error || '送信に失敗しました');
      }

      console.log("Edge Function Response:", data); // デバッグ用

      alert('認証コードをメールで送信しました。');
      
      // 親コンポーネント（App.tsx）に入力したメールアドレスを渡して
      // 次の「ワンタイムパスワード入力画面」へ進む
      onSendEmail(email);

    } catch (err: any) {
      console.error(err);
      if (err.message === 'User not found') {
        alert('このメールアドレスは登録されていません');
      } else {
        alert('エラー: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12 text-3xl font-bold text-center">パスワードリセット</h1>
            
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-blue-900 leading-relaxed text-center text-lg">
                <p>ご登録いただいているメールアドレスに<br className="sm:hidden"/>ワンタイムパスワードを送信いたします。</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 font-bold sm:min-w-[120px]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400"
                  disabled={loading}
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
                  onClick={handleSendEmail} 
                  disabled={loading} 
                  className="px-12 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:bg-slate-400 transition-colors shadow-lg"
                >
                  {loading ? '送信中...' : '送信する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}