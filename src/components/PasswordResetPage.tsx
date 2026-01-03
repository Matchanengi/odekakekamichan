import { useState } from 'react';

interface PasswordResetPageProps {
  onBack: () => void;
  onSendEmail: (email: string) => void;
}

export function PasswordResetPage({ onBack, onSendEmail }: PasswordResetPageProps) {
  const [email, setEmail] = useState('');

  const handleSendEmail = () => {
    if (!email) {
      alert('メールアドレスを入力してください');
      return;
    }
    // ワンタイムパスワード送信処理（モック）
    console.log('ワンタイムパスワード送信先:', email);
    onSendEmail(email);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12">パスワードリセット</h1>

            <div className="max-w-2xl mx-auto space-y-8">
              {/* 説明文 */}
              <div className="text-blue-900 leading-relaxed">
                <p>ご登録いただいているメールアドレスにワンタイムパスワードを送信いたします。</p>
                <p className="mt-2">受信したワンタイムパスワードを使用してログインし、新しいパスワードを設定してください。</p>
              </div>

              {/* Email入力欄 */}
              <div className="flex items-center gap-8">
                <label className="text-blue-900 italic min-w-[120px]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg placeholder:text-gray-400"
                />
              </div>

              {/* ボタン */}
              <div className="flex items-center justify-center gap-6 pt-6">
                <button
                  onClick={onBack}
                  className="px-12 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-12 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}