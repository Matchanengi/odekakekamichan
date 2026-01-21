import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabaseClient';

/**
 * 登録内容確認ページのプロパティ定義
 */
interface RegisterConfirmPageProps {
  data: { name: string; email: string; password: string; }; // 前のページで入力されたユーザー情報
  onConfirm: () => void; // 登録完了後に呼ばれるコールバック
  onBack: () => void;    // 修正ボタン押下時に戻るためのコールバック
}

export function RegisterConfirmPage({ data, onConfirm, onBack }: RegisterConfirmPageProps) {
  // --- ステータス管理 ---
  const [showPassword, setShowPassword] = useState(false); // パスワードのマスク解除フラグ
  const [loading, setLoading] = useState(false);          // 登録処理中のローディング状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージの保持

  /**
   * Supabaseから返却される英語のエラーメッセージを
   * ユーザーに分かりやすい日本語のメッセージに変換する
   */
  const getFriendlyErrorMessage = (err: any) => {
    const msg = err.message || '';
    // すでに登録済みのメールアドレスの場合
    if (msg.includes('User already registered')) return 'このメールアドレスは既に登録されています。';
    // パスワードの強度が足りない場合（基本は前のページでバリデーション済みだがバックエンド側の制約用）
    if (msg.includes('Password should be')) return 'パスワードは8文字以上で設定してください。';
    
    return '登録中にエラーが発生しました。入力内容を確認してやり直してください。';
  };

  /**
   * 最終的な登録処理の実行
   * 1. Supabase Auth (認証用) への登録
   * 2. Supabase DB (実データ用) への保存
   */
  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      // --- 1. Supabase Auth登録 ---
      // メールアドレスとパスワードでユーザーのアカウント（認証用）を作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('登録に失敗しました');

      // --- 2. データベース(ユーザテーブル)保存 ---
      // 認証以外の情報（名前など）を専用のテーブルに格納する
      const { error: dbError } = await supabase
        .from('ユーザ')
        .insert([{ 
          name: data.name, 
          email: data.email, 
          password_hash: 'managed_by_auth' // パスワード本体はAuthで管理されるため、目印のみ保存
        }]);
        
      if (dbError) throw dbError;

      // 成功したら完了通知
      onConfirm();
    } catch (err: any) {
      // エラーが発生した場合は日本語に変換して表示
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    /* 外枠レイアウト */
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* 装飾用の水色背景パネル */}
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12 shadow-xl">
          {/* コンテンツ本体の白いカード */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-8 text-center text-3xl font-bold">登録内容の確認</h1>

            {/* エラー発生時に表示される警告アラート */}
            {error && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-red-900 font-bold mb-1">登録できませんでした</p>
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="max-w-2xl mx-auto space-y-8">
              {/* 確認内容のリスト */}
              <div className="space-y-6">
                {/* お名前の表示 */}
                <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-4">
                  <label className="text-blue-900 font-bold sm:min-w-[160px]">お名前</label>
                  <div className="text-gray-900 text-xl">{data.name}</div>
                </div>
                
                {/* Emailの表示 */}
                <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-4">
                  <label className="text-blue-900 font-bold sm:min-w-[160px]">Email</label>
                  <div className="text-gray-900 text-xl">{data.email}</div>
                </div>
                
                {/* パスワードの表示（伏せ字切り替え機能付き） */}
                <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-4">
                  <label className="text-blue-900 font-bold sm:min-w-[160px]">パスワード</label>
                  <div className="flex items-center gap-4">
                    <div className="text-gray-900 text-xl font-mono">
                      {showPassword ? data.password : '●●●●●●●●'}
                    </div>
                    {/* 表示・非表示を切り替えるアイコンボタン */}
                    <button 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="text-blue-900 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* フッターアクションボタン */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                {/* 戻って修正するボタン */}
                <button
                  onClick={onBack}
                  disabled={loading} // 登録処理中は操作不可
                  className="px-12 py-5 bg-white text-blue-900 border-2 border-blue-900 font-bold text-xl rounded-2xl hover:bg-gray-50 transition-all"
                >
                  修正する
                </button>
                
                {/* 登録確定ボタン */}
                <button
                  onClick={handleRegister}
                  disabled={loading} // 二重送信防止
                  className="px-12 py-5 bg-blue-900 text-white font-bold text-xl rounded-2xl hover:bg-blue-800 shadow-lg active:scale-95 transition-all disabled:bg-gray-400"
                >
                  {/* ローディング状態に応じたテキスト切り替え */}
                  {loading ? '登録中...' : 'この内容で決定'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}