import { useState } from 'react';
import { supabase } from './supabaseClient'; // 共通のSupabaseクライアント設定

/**
 * パスワードリセットページのプロパティ定義
 */
interface PasswordResetPageProps {
  onBack: () => void;                      // 前の画面（ログイン画面など）へ戻る処理
  onSendEmail: (email: string) => void;    // 送信成功後に次の画面（コード入力画面）へ進む処理
}

export function PasswordResetPage({ onBack, onSendEmail }: PasswordResetPageProps) {
  // --- 状態管理 ---
  const [email, setEmail] = useState('');     // 入力されたメールアドレス
  const [loading, setLoading] = useState(false); // 送信リクエスト中のフラグ

  /**
   * 送信ボタンが押されたときのメイン処理
   */
  const handleSendEmail = async () => {
    // 1. 未入力チェック
    if (!email) {
      alert('メールアドレスを入力してください');
      return;
    }

    setLoading(true);
    try {
      /**
       * 2. Supabase Edge Functions の呼び出し
       * セキュリティ上の理由から、クライアント側ではなくサーバー側（Edge Function）で
       * メールの送信処理（認証コード生成など）を実行させます。
       */
      const { data, error } = await supabase.functions.invoke('server', {
        body: { 
          action: 'send-otp', // 実行するアクションを指定
          email: email        // 宛先メールアドレス
        },
      });

      // 3. Supabase SDK 側のエラーハンドリング
      if (error) {
        // Edge Function側で返した具体的なエラーメッセージ（404 User not found等）を抽出
        const errorData = await error.context?.json();
        throw new Error(errorData?.error || '送信に失敗しました');
      }

      // 4. 送信成功後のフロー
      console.log("Edge Function Response:", data); // デバッグ用ログ
      alert('認証コードをメールで送信しました。');
      
      // 親コンポーネントに入力されたメールアドレスを渡し、
      // 認証コード入力画面に切り替えてもらう
      onSendEmail(email);

    } catch (err: any) {
      console.error(err);
      // エラーの種類に応じたユーザーへの通知
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
        {/* 装飾用の水色背景カード */}
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          {/* コンテンツ本体の白いカード */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12 text-3xl font-bold text-center">パスワードリセット</h1>
            
            <div className="max-w-2xl mx-auto space-y-8">
              {/* ガイドメッセージ */}
              <div className="text-blue-900 leading-relaxed text-center text-lg">
                <p>ご登録いただいているメールアドレスに<br className="sm:hidden"/>ワンタイムパスワードを送信いたします。</p>
              </div>

              {/* メールアドレス入力欄 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                <label className="text-blue-900 font-bold sm:min-w-[120px]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="flex-1 px-4 py-3 border-2 border-blue-900 rounded-lg outline-none focus:ring-2 focus:ring-cyan-400"
                  disabled={loading} // 送信中は入力をロック
                />
              </div>

              {/* 下部ボタンエリア */}
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
                  {/* 送信状態に応じてテキストを切り替え */}
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