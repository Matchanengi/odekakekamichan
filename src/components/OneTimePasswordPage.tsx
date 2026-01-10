import { useState } from 'react';

interface OneTimePasswordPageProps {
  onConfirm: () => void;
  onBack: () => void;
  email: string;
}

export function OneTimePasswordPage({ onConfirm, onBack, email }: OneTimePasswordPageProps) {
  const [oneTimePassword, setOneTimePassword] = useState('');

  const handleResend = () => {
    alert('ワンタイムパスワードを再送信しました。メールをご確認ください。');
    console.log('ワンタイムパスワード再送信先:', email);
  };

  const handleConfirm = () => {
    if (!oneTimePassword) {
      alert('ワンタイムパスワードを入力してください');
      return;
    }
    // 何が入力されていても次のページに遷移
    onConfirm();
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12">ワンタイムパスワード入力</h1>

            <div className="max-w-2xl mx-auto space-y-8">
              {/* 説明文 */}
              <div className="text-blue-900 leading-relaxed">
                <p>ご登録のメールアドレス（<span className="italic">{email}</span>）にワンタイムパスワードを送信しました。</p>
                <p className="mt-2">メールに記載されているワンタイムパスワードを入力してください。</p>
              </div>

              {/* ワンタイムパスワード入力欄 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 sm:min-w-[200px]">ワンタイムパスワード</label>
                <input
                  type="text"
                  value={oneTimePassword}
                  onChange={(e) => setOneTimePassword(e.target.value)}
                  placeholder="123456"
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg placeholder:text-gray-400"
                />
              </div>

              {/* 再送ボタン */}
              <div className="flex justify-center">
                <button
                  onClick={handleResend}
                  className="text-blue-900 hover:underline"
                >
                  →ワンタイムパスワードを再送信
                </button>
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
                  onClick={handleConfirm}
                  className="px-12 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  確認
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}