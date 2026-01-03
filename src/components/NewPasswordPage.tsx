import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface NewPasswordPageProps {
  onComplete: () => void;
}

export function NewPasswordPage({ onComplete }: NewPasswordPageProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    if (!newPassword || !confirmPassword) {
      alert('すべての項目を入力してください');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }
    // パスワード再設定処理（モック）
    alert('パスワードを再設定しました。新しいパスワードでログインしてください。');
    console.log('新しいパスワード設定完了');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12">パスワード再設定</h1>

            <div className="max-w-2xl mx-auto space-y-8">
              {/* 説明文 */}
              <div className="text-blue-900 leading-relaxed">
                <p>新しいパスワードを設定してください。</p>
              </div>

              {/* 新しいパスワード */}
              <div className="flex items-center gap-8">
                <label className="text-blue-900 min-w-[180px]">新しいパスワード</label>
                <div className="flex-1 relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-900 rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowNewPassword(true)}
                    onMouseUp={() => setShowNewPassword(false)}
                    onMouseLeave={() => setShowNewPassword(false)}
                    onTouchStart={() => setShowNewPassword(true)}
                    onTouchEnd={() => setShowNewPassword(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* 確認用パスワード */}
              <div className="flex items-center gap-8">
                <label className="text-blue-900 min-w-[180px]">確認用パスワード</label>
                <div className="flex-1 relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-900 rounded-lg pr-12"
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                    onTouchStart={() => setShowConfirmPassword(true)}
                    onTouchEnd={() => setShowConfirmPassword(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* ボタン */}
              <div className="flex items-center justify-center gap-6 pt-6">
                <button
                  onClick={handleSubmit}
                  className="px-16 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  決定
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
