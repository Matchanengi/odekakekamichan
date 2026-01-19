import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from 'lucide-react';

/**
 * 1. バリデーションルールの定義 (Zod)
 */
const registerSchema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスの形式で入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で設定してください")
    .regex(
      /^[a-zA-Z0-9!-/:-@[-`{-~]+$/,
      "パスワードは半角英数字・記号で入力してください"
    ),
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage({ onShowConfirm, initialData }: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * 2. React Hook Form の設定
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit", // 送信時まで静かに
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: initialData?.password || '',
      confirmPassword: initialData?.password || '',
    }
  });

  const onSubmit = (data: RegisterFormData) => {
    // バリデーション成功時のみ実行される
    onShowConfirm(data);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12 shadow-xl">
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12 text-center text-3xl font-bold">新規登録</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
              
              {/* お名前 */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  <label className="text-blue-900 font-bold sm:min-w-[140px]">お名前</label>
                  <input
                    {...register("name")}
                    placeholder="香美 太郎"
                    className={`flex-1 px-4 py-3 border-2 rounded-lg outline-none transition-colors ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-blue-900 focus:ring-2 focus:ring-cyan-400'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm sm:ml-[172px] font-bold">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  <label className="text-blue-900 font-bold sm:min-w-[140px]">Email</label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="example@mail.com"
                    className={`flex-1 px-4 py-3 border-2 rounded-lg outline-none transition-colors ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-blue-900 focus:ring-2 focus:ring-cyan-400'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm sm:ml-[172px] font-bold">{errors.email.message}</p>}
              </div>

              {/* パスワード入力 */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  <label className="text-blue-900 font-bold sm:min-w-[140px]">パスワード</label>
                  <div className="flex-1 relative">
                    <input
                      {...register("password")}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="8文字以上"
                      className={`w-full px-4 py-3 border-2 rounded-lg pr-12 outline-none transition-colors ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-blue-900 focus:ring-2 focus:ring-cyan-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900 p-2"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* ★ ここに注意書きを追加 */}
                <div className="sm:ml-[172px] space-y-1">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    ※ 8文字以上、半角英数字・記号が使用できます。<br />
                    <span className="text-red-500 font-medium">※ 全角文字(日本語・全角数字など)は使用できません。</span>
                  </p>
                  {errors.password && (
                    <p className="text-red-500 text-sm font-bold">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {/* 確認用パスワード */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  <label className="text-blue-900 font-bold sm:min-w-[140px]">確認用</label>
                  <div className="flex-1 relative">
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="もう一度入力"
                      className={`w-full px-4 py-3 border-2 rounded-lg pr-12 outline-none transition-colors ${
                        errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-blue-900 focus:ring-2 focus:ring-cyan-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900 p-2"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm sm:ml-[172px] font-bold">{errors.confirmPassword.message}</p>}
              </div>

              <div className="flex justify-center pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-20 py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg active:scale-95 ${
                    isSubmitting ? 'bg-gray-400' : 'bg-blue-900 hover:bg-blue-800'
                  }`}
                >
                  {isSubmitting ? "処理中..." : "確認画面へ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}