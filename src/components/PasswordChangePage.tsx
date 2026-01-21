import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from './supabaseClient';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext';

/**
 * 1. パスワード変更専用のバリデーションスキーマ
 */
const passwordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "パスワードは8文字以上で設定してください")
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_\-+=?]+$/, 
      "パスワードは半角英数字と指定の記号(!@#$%^&*()_-+=?)のみ使用できます"
    ),
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "確認用パスワードが一致しません",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordChangePage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';

  /**
   * 2. React Hook Form の設定
   */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onSubmit",
  });

  const onSubmit = async (data: PasswordFormData) => {
    setMessage(null);

    try {
      // Supabase Auth の更新
      const { error: authError } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (authError) {
        if (authError.message.includes("different from the old password")) {
          throw new Error("新しいパスワードは、現在のパスワードと異なるものを入力してください。");
        }
        throw authError;
      }

      // 独自テーブルの同期 (必要に応じて)
      const targetTable = isAdmin ? '管理者' : 'ユーザ';
      const { error: dbError } = await supabase
        .from(targetTable)
        .update({ password_hash: 'managed_by_supabase_auth' })
        .eq('email', user?.email);

      setMessage({ type: 'success', text: 'パスワードを正常に変更しました！' });
      reset(); // 入力欄をクリア

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '通信エラーが発生しました。' });
    }
  };

  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8 shadow-xl`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-inner">
        <h2 className="text-2xl sm:text-3xl mb-8 text-blue-600 font-bold border-l-4 border-blue-600 pl-4">
          パスワード変更
        </h2>

        {message && (
          <div className={`mb-8 p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' ? 'bg-green-50 border-green-400 text-green-800' : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <p className="flex items-center gap-3 font-bold text-lg">
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 max-w-2xl">
          {/* 新しいパスワード */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">新しいパスワード</label>
              <div className="flex-1 relative">
                <input
                  {...register("newPassword")}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8文字以上で入力"
                  className={`w-full border-2 rounded-xl px-4 py-3 outline-none transition-all shadow-sm ${
                    errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>
            <div className="sm:ml-[196px]">
              <p className="text-[11px] text-gray-500">※半角英数字・指定の記号(!@#$%^&*()_-+=?)のみ（全角不可）</p>
              {errors.newPassword && <p className="text-red-500 text-xs font-bold mt-1">{errors.newPassword.message}</p>}
            </div>
          </div>

          {/* 確認用パスワード */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">確認用パスワード</label>
              <input
                {...register("confirmPassword")}
                type={showPassword ? 'text' : 'password'}
                placeholder="もう一度入力"
                className={`w-1/1 sm:flex-1 border-2 rounded-xl px-4 py-3 outline-none transition-all shadow-sm ${
                  errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs font-bold sm:ml-[196px] mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-100 text-gray-600 px-8 sm:px-12 py-3 rounded-xl hover:bg-gray-200 transition-all font-bold"
            >
              戻る
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-8 sm:px-12 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {isSubmitting ? '変更処理中...' : 'パスワードを更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}