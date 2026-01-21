import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from './supabaseClient';

// 1. バリデーションルールの定義
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
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface NewPasswordPageProps {
  email: string;
  otp: string;
  onComplete: () => void;
}

export function NewPasswordPage({ email, otp, onComplete }: NewPasswordPageProps) {
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2. React Hook Form の設定
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    // セッションチェック
    if (!email || !otp) {
      alert('エラー：セッションが切断されました。最初からやり直してください。');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('server', {
        body: { 
          action: 'reset-password', 
          email: email,
          otp: otp,
          newPassword: data.newPassword // React Hook Form から渡されたデータを使用
        },
      });

      if (error) {
        const errorData = await error.context?.json();
        throw new Error(errorData?.error || 'パスワードの更新に失敗しました');
      }

      alert('パスワードを正常に再設定しました。新しいパスワードでログインしてください。');
      onComplete();

    } catch (err: any) {
      console.error(err);
      alert(err.message || '予期せぬエラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12 text-3xl font-bold text-center">新しいパスワードの設定</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-8">
              <div className="text-blue-900 leading-relaxed text-center">
                <p>安全な新しいパスワードを入力してください。</p>
              </div>

              {/* 新パスワード入力 */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  <label className="text-blue-900 font-bold sm:min-w-[180px]">新パスワード</label>
                  <div className="flex-1 relative">
                    <input
                      {...register("newPassword")}
                      type={showNewPassword ? 'text' : 'password'}
                      className={`w-full px-4 py-3 border-2 rounded-lg pr-12 outline-none transition-colors ${
                        errors.newPassword ? 'border-red-500 bg-red-50' : 'border-blue-900 focus:ring-2 focus:ring-cyan-300'
                      }`}
                      placeholder="8文字以上"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="sm:ml-[212px]">
                  <p className="text-[11px] text-gray-500">※半角英数字・指定の記号(!@#$%^&*()_-+=?)のみ（全角不可）</p>
                  {errors.newPassword && <p className="text-red-500 text-sm font-bold mt-1">{errors.newPassword.message}</p>}
                </div>
              </div>

              {/* 確認用入力 */}
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
                {errors.confirmPassword && <p className="text-red-500 text-sm font-bold sm:ml-[212px] mt-1">{errors.confirmPassword.message}</p>}
              </div>

              {/* 決定ボタン */}
              <div className="flex items-center justify-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
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