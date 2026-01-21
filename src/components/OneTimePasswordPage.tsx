import { useState } from 'react';
import { supabase } from './supabaseClient';

/**
 * ワンタイムパスワード（OTP）入力確認ページ
 */
interface OneTimePasswordPageProps {
  // 入力されたOTPを親コンポーネントに渡して、次のパスワード設定画面へ進むための関数
  onConfirm: (otp: string) => void; 
  // 前の画面（メールアドレス入力画面）へ戻るための関数
  onBack: () => void;
  // 確認対象のユーザーメールアドレス
  email: string;
}

export function OneTimePasswordPage({ onConfirm, onBack, email }: OneTimePasswordPageProps) {
  // --- 状態管理 ---
  const [oneTimePassword, setOneTimePassword] = useState(''); // 入力された6桁のコード
  const [loading, setLoading] = useState(false);             // 照合処理中のフラグ

  /**
   * 「次へ」ボタンが押された時の照合処理
   */
  const handleConfirm = async () => {
    // 未入力チェック
    if (!oneTimePassword) {
      alert('ワンタイムパスワードを入力してください');
      return;
    }

    setLoading(true);
    try {
      /**
       * 1. データベースから保存されているコードと期限を取得
       * 前の画面で Edge Function により発行・保存された情報を「ユーザ」テーブルから取得します。
       */
      const { data: user, error } = await supabase
        .from('ユーザ')
        .select('reset_otp_code, reset_otp_expires_at')
        .eq('email', email)
        .single(); // 1件のみ取得

      if (error) throw new Error('通信エラーが発生しました。');

      /**
       * 2. コードの照合
       * ユーザーが入力したコードと、DBに保存されているコードが一致するか確認します。
       */
      if (user?.reset_otp_code === oneTimePassword) {
        
        /**
         * 3. 有効期限のチェック
         * 現在時刻が、DBに保存された有効期限を過ぎていないか判定します。
         */
        const isExpired = new Date() > new Date(user.reset_otp_expires_at);
        
        if (isExpired) {
          alert('有効期限（10分）が切れています。もう一度送信し直してください。');
          onBack(); // 期限切れの場合は、メール送信画面に戻す
        } else {
          /**
           * 成功：正しいコードかつ期限内の場合
           * 入力したコードを引数に渡して親（App.tsxなど）の処理を呼び出し、
           * 新しいパスワード設定画面へ遷移します。
           */
          onConfirm(oneTimePassword); 
        }
      } else {
        // コードが一致しない場合
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
        {/* 外側の装飾用パネル */}
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          {/* 内側のコンテンツカード */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-8 text-3xl font-bold text-center">コード確認</h1>
            
            <div className="max-w-2xl mx-auto space-y-8">
              {/* ガイドテキスト：どのメール宛に送ったかを表示 */}
              <div className="text-blue-900 leading-relaxed text-center text-lg">
                <p>（<span className="italic font-bold">{email}</span>）<br className="sm:hidden"/>宛に送信された認証コードを入力してください。</p>
              </div>

              {/* 認証コード入力フィールド */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 font-bold sm:min-w-[160px]">認証コード</label>
                <input
                  type="text"
                  value={oneTimePassword}
                  onChange={(e) => setOneTimePassword(e.target.value)}
                  placeholder="6桁の数字"
                  maxLength={6} // 6桁制限
                  // font-mono と tracking により、数字の間隔を広げて読みやすくデザイン
                  className="flex-1 px-4 py-4 border-2 border-blue-900 rounded-lg text-center text-3xl font-mono tracking-[0.5em] outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              {/* ボタンアクションエリア */}
              <div className="flex items-center justify-center gap-6 pt-6">
                <button 
                  onClick={onBack} 
                  className="px-12 py-3 bg-white text-blue-900 border-2 border-blue-900 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  戻る
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={loading} // 照合中はボタンを無効化
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