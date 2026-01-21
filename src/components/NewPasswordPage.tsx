import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabaseClient';

// --- 1. バリデーションルールの定義 (Zod) ---
/** * パスワード再設定フォームの入力ルール
 * newPassword: 8文字以上、特定の半角英数字・記号のみ許可
 * confirmPassword: 空欄不可、かつ newPassword との一致をチェック
 */
const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "パスワードは8文字以上で設定してください")
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_\-+=?]+$/, 
      "パスワードは半角英数字と指定の記号(!@#$%^&*()_-+=?)のみ使用できます"
    ),
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  // refine を使い、2つのフィールドを跨いだ比較（一致チェック）を行う
  message: "パスワードが一致しません",
  path: ["confirmPassword"], // エラーを表示させる対象のフィールド
});

// Zodスキーマから型を推論して定義
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface NewPasswordPageProps {
  email: string;      // 認証対象のメールアドレス
  otp: string;        // 検証済みのワンタイムパスワード
  onComplete: () => void; // 完了後に親コンポーネントで行う処理（遷移など）
}

/**
 * パスワード再設定ページコンポーネント
 */
export function NewPasswordPage({ email, otp, onComplete }: NewPasswordPageProps) {
  // パスワードの伏せ字（●●●）と表示の切り替え状態
  const [showNewPassword, setShowNewPassword] = useState(false);

  // --- 2. React Hook Form の設定 ---
  const {
    register,     // 各入力項目をフォームに登録するための関数
    handleSubmit, // フォーム送信時のハンドラ
    formState: { errors, isSubmitting }, // エラー情報と送信中フラグ
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema), // Zodと連携
    mode: "onSubmit", // 送信ボタンが押されたタイミングでバリデーション実行
  });

  // --- 3. 更新処理 (onSubmit) ---
  const onSubmit = async (data: ResetPasswordFormData) => {
    // ページ遷移等で必要なデータが失われていないかチェック
    if (!email || !otp) {
      alert('エラー：セッションが切断されました。最初からやり直してください。');
      return;
    }

    try {
      /**
       * Supabase Edge Functions を呼び出してサーバー側でパスワードを更新する
       * 直接 auth.updateUser を使わずサーバーを介すことで、OTP検証等の安全性を確保している構成
       */
      const { error } = await supabase.functions.invoke('server', {
        body: { 
          action: 'reset-password', 
          email: email,
          otp: otp,
          newPassword: data.newPassword // バリデーション済みの安全なパスワード
        },
      });

      if (error) {
        // Edge Function側から返されたカスタムエラーメッセージを取得
        const errorData = await error.context?.json();
        throw new Error(errorData?.error || 'パスワードの更新に失敗しました');
      }

      alert('パスワードを正常に再設定しました。新しいパスワードでログインしてください。');
      onComplete(); // 親へ完了を通知

    } catch (err: any) {
      console.error(err);
      alert(err.message || '予期せぬエラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* ポップな配色のコンテナデザイン */}
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12 text-3xl font-bold text-center">新しいパスワードの設定</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-8">
              <div className="text-blue-900 leading-relaxed text-center">
                <p>安全な新しいパスワードを入力してください。</p>
              </div>

              {/* --- 新パスワード入力項目 --- */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  <label className="text-blue-900 font-bold sm:min-w-[180px]">新パスワード</label>
                  <div className="flex-1 relative">
                    <input
                      {...register("newPassword")} // React Hook Form へ登録
                      type={showNewPassword ? 'text' : 'password'}
                      className={`w-full px-4 py-3 border-2 rounded-lg pr-12 outline-none transition-colors ${
                        errors.newPassword ? 'border-red-500 bg-red-50' : 'border-blue-900 focus:ring-2 focus:ring-cyan-300'
                      }`}
                      placeholder="8文字以上"
                      disabled={isSubmitting}
                    />
                    {/* パスワード表示/非表示の切り替えアイコン */}
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                {/* 補助メッセージとバリデーションエラー */}
                <div className="sm:ml-[212px]">
                  <p className="text-[11px] text-gray-500">※半角英数字・指定の記号(!@#$%^&*()_-+=?)のみ（全角不可）</p>
                  {errors.newPassword && <p className="text-red-500 text-sm font-bold mt-1">{errors.newPassword.message}</p>}
                </div>
              </div>

              {/* --- 確認用パスワード入力項目 --- */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  <label className="text-blue-900 font-bold sm:min-w-[180px]">確認用</label>
                  <input
                    {...register("confirmPassword")}
                    type={showNewPassword ? 'text' : 'password'}
                    className={`w-full flex-1 px-4 py-3 border-2 rounded-lg outline-none transition-colors ${
                      errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-blue-900 focus:ring-2 focus:ring-cyan-300'
                    }`}
                    placeholder="もう一度入力"
                    disabled={isSubmitting}
                  />
                </div>
                {/* 確認用フィールドのエラー（不一致など）を表示 */}
                {errors.confirmPassword && <p className="text-red-500 text-sm font-bold sm:ml-[212px] mt-1">{errors.confirmPassword.message}</p>}
              </div>

              {/* --- 送信ボタンセクション --- */}
              <div className="flex items-center justify-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting} // 送信中は連打できないよう無効化
                  className="px-20 py-4 bg-blue-900 text-white font-bold text-lg rounded-xl hover:bg-blue-800 transition-colors shadow-lg disabled:bg-slate-400"
                >
                  {isSubmitting ? '更新中...' : 'パスワードを更新する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}