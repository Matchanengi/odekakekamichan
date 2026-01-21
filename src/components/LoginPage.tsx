import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from "./supabaseClient";

/**
 * LoginPage コンポーネントのプロパティ定義
 */
interface LoginPageProps {
  onLoginAsUser: () => void;     // ログイン成功時に親コンポーネントへ通知する関数
  onShowRegister?: () => void;    // 新規登録画面への切り替え関数
  onShowPasswordReset?: () => void; // パスワードリセット画面への切り替え関数
  message?: string;               // 外部（登録完了後など）から渡される通知メッセージ
}

/**
 * ログイン画面コンポーネント
 */
export function LoginPage({ 
  onLoginAsUser, 
  onShowRegister, 
  onShowPasswordReset, 
  message 
}: LoginPageProps) {
  // --- フォームの状態管理 ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // パスワードの伏せ字切り替え
  const [loading, setLoading] = useState(false);           // 処理中のボタン無効化用
  const [error, setError] = useState<string | null>(null); // エラーメッセージ表示用

  /**
   * Google OAuth 認証処理
   * Supabase の signInWithOAuth を呼び出し、Googleのログイン画面へリダイレクトします。
   */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        // ログイン後のリダイレクト先を現在のドメインのルートに設定
        redirectTo: window.location.origin 
      }
    });
    if (error) {
      setError('Google連携に失敗しました。');
      setLoading(false);
    }
  };

  /**
   * メールアドレスとパスワードによるログイン処理
   */
  const handleEmailLogin = async () => {
    // 未入力チェック
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    setLoading(true);
    setError(null);

    // Supabase Auth を使って認証を実行
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // エラーメッセージの日本語化
      if (error.message === 'Invalid login credentials') {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else {
        setError('ログインに失敗しました。入力内容をご確認ください。');
      }
      setLoading(false);
      return;
    }

    // 成功時、親コンポーネントの処理（画面遷移等）を実行
    onLoginAsUser();
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* 外側のシアン色の枠 */}
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12 shadow-xl">
          {/* 内側の白いコンテンツエリア */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-8 text-center text-3xl font-bold">ログイン</h1>

            {/* 外部からのメッセージ（パスワード再設定後など）があれば表示 */}
            {message && (
              <div className="mb-6 bg-cyan-50 border border-cyan-200 rounded-2xl p-4 text-center text-blue-900 text-sm font-bold animate-in fade-in zoom-in">
                {message}
              </div>
            )}

            {/* エラー発生時に表示する警告アラート */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm animate-in shake">
                <span className="text-red-500">⚠️</span>
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="max-w-xl mx-auto space-y-6">
              
              {/* --- Googleログインセクション --- */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700 bg-white"
                >
                  {/* GoogleロゴのSVGアイコン */}
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Googleで ログイン / 新規登録
                </button>
                <p className="text-[11px] text-gray-500 text-center">
                  ※Googleアカウントをお持ちの方は、1クリックで登録・ログインが完了します。
                </p>
              </div>

              {/* 区切り線 */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400 font-bold">またはメールアドレスでログイン</span></div>
              </div>

              {/* --- メール・パスワード入力セクション --- */}
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="メールアドレス"
                  className="w-full px-4 py-3 border-2 border-blue-900 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400"
                  disabled={loading}
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワード"
                    className="w-full px-4 py-3 border-2 border-blue-900 rounded-lg pr-12 outline-none focus:ring-2 focus:ring-cyan-400"
                    disabled={loading}
                  />
                  {/* パスワード表示/非表示の切り替えボタン */}
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* サブアクション：新規登録 / パスワード再設定への導線 */}
              <div className="flex flex-col gap-3 text-sm text-blue-900 font-bold pt-2">
                <button onClick={onShowRegister} className="text-left hover:underline flex items-center gap-1">
                  <span>→</span> メールアドレスで新規登録の方はこちら
                </button>
                <button onClick={onShowPasswordReset} className="text-left hover:underline flex items-center gap-1 text-gray-400 font-normal">
                  <span>→</span> パスワードをお忘れの方
                </button>
              </div>

              {/* ログイン実行ボタン */}
              <button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full py-4 bg-blue-900 text-white font-bold text-lg rounded-xl hover:bg-blue-800 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
              >
                ログイン
              </button>

              {/* --- 案内用フッターエリア --- */}
              <div className="mt-10 p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                <h3 className="text-blue-900 font-bold text-sm flex items-center gap-2">
                  <span className="text-lg">💡</span> ログイン・セキュリティのご案内
                </h3>
                <ul className="text-[11px] text-blue-800 space-y-2 leading-relaxed">
                  <li><strong>● Google登録：</strong> 本サイト専用のパスワード設定は不要です。上のボタンからすぐに開始できます。</li>
                  <li><strong>● Googleログインの方へ：</strong> 「パスワードをお忘れの方」からパスワードを設定すると、次回からメールアドレスでのログインも併用できるようになります。</li>
                  <li><strong>● 管理者の方：</strong> 登録済みのメールアドレスでログインすると、自動的に管理者メニューが表示されます。</li>
                  <li><strong>● セキュリティ：</strong> 操作がない状態が5分続くと、安全のため自動的にログアウトされます。</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}