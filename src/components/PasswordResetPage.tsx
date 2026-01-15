import { useState } from 'react';
//import { supabase } from './supabaseClient'; // パスは適宜調整してください

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
      // サーバー機能（Edge Function）のURLを作成
      // これが "/server/reset-password" になります
      const supabaseUrl = 'https://sfzjvpordilroakqmjnp.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/server/reset-password`;

      console.log("Calling:", functionUrl); // デバッグ用

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // supabaseClient.ts のキーを使って認証
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmemp2cG9yZGlscm9ha3Ftam5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NDY4NDIsImV4cCI6MjA4MjIyMjg0Mn0.f_0QO9dqlY99yr_2YdKw_B8lqxu6fkKMV3z140h2Y8I`,
        },
        body: JSON.stringify({ email: email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '送信に失敗しました');
      }

      alert('認証コードをメールで送信しました。');
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
                <button onClick={onBack} className="px-12 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg">
                  戻る
                </button>
                <button 
                  onClick={handleSendEmail} 
                  disabled={loading} 
                  className="px-12 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:bg-slate-400"
                >
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