import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from 'lucide-react';

/**
 * 1. バリデーションルール（入力チェック）の定義 (Zod)
 * フォームの各項目に対して「必須チェック」「形式チェック」を定義します。
 */
const registerSchema = z.object({
  // お名前：空文字を許容しない
  name: z.string().min(1, "お名前を入力してください"),
  // メールアドレス：空文字不可 ＋ 正しいメール形式かチェック
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスの形式で入力してください"),
  // パスワード：8文字以上 ＋ 指定の半角英数字・記号のみ
  password: z
    .string()
    .min(8, "パスワードは8文字以上で設定してください")
    .regex(
      /^[a-zA-Z0-9!@#$%^&*()_\-+=?]+$/, 
      "パスワードは半角英数字と指定の記号(!@#$%^&*()_-+=?)のみ使用できます"
    ),
  // 確認用パスワード：入力必須（後続のrefineで一致確認を行う）
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
}).refine((data) => data.password === data.confirmPassword, {
  // パスワードと確認用パスワードが一致しているか最終チェック
  message: "パスワードが一致しません",
  path: ["confirmPassword"], // エラーメッセージを表示する対象フィールド
});

// Zodの定義から型（TypeScript用）を自動生成
type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * 新規登録ページコンポーネント
 * @param onShowConfirm - 入力成功時に確認画面へ遷移するための関数
 * @param initialData - 確認画面から戻ってきた際などの初期値
 */
export function RegisterPage({ onShowConfirm, initialData }: any) {
  // パスワードの伏せ字を表示するかどうかの状態管理
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * 2. React Hook Form の設定
   * フォームの状態管理、バリデーションの実行、エラー取得を一括で行います。
   */
  const {
    register,      // 各入力項目を登録するための関数
    handleSubmit,  // 送信処理（バリデーション成功時のみ実行）をラップする関数
    formState: { errors, isSubmitting }, // エラー内容と送信中フラグ
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema), // Zodと連携
    mode: "onSubmit", // 送信ボタンを押したタイミングでエラーを表示
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: initialData?.password || '',
      confirmPassword: initialData?.password || '',
    }
  });

  /**
   * フォーム送信時の処理
   * バリデーションが全て通った場合のみ、この関数が呼ばれます。
   */
  const onSubmit = (data: RegisterFormData) => {
    onShowConfirm(data);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* 外側の水色枠デザイン */}
        <div className="bg-cyan-400 rounded-[3rem] p-8 sm:p-12 shadow-xl">
          {/* 内側の白いカード */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-16">
            <h1 className="text-blue-900 mb-12 text-center text-3xl font-bold">新規登録</h1>

            {/* handleSubmit(onSubmit) により、送信時に入力チェックが走る */}
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
              
              {/* --- お名前入力項目 --- */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  <label className="text-blue-900 font-bold sm:min-w-[140px]">お名前</label>
                  <input
                    {...register("name")} // React Hook Formへの紐付け
                    placeholder="香美 太郎"
                    className={`flex-1 px-4 py-3 border-2 rounded-lg outline-none transition-colors ${
                      // エラーがある場合は枠を赤く、背景を薄赤にする
                      errors.name ? 'border-red-500 bg-red-50' : 'border-blue-900 focus:ring-2 focus:ring-cyan-400'
                    }`}
                  />
                </div>
                {/* エラーメッセージの表示 */}
                {errors.name && <p className="text-red-500 text-sm sm:ml-[172px] font-bold">{errors.name.message}</p>}
              </div>

              {/* --- Email入力項目 --- */}
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

              {/* --- パスワード入力項目 --- */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  <label className="text-blue-900 font-bold sm:min-w-[140px]">パスワード</label>
                  <div className="flex-1 relative">
                    <input
                      {...register("password")}
                      type={showPassword ? 'text' : 'password'} // 表示・非表示の切り替え
                      placeholder="8文字以上"
                      className={`w-full px-4 py-3 border-2 rounded-lg pr-12 outline-none transition-colors ${
                        errors.password ? 'border-red-500 bg-red-50' : 'border-blue-900 focus:ring-2 focus:ring-cyan-400'
                      }`}
                    />
                    {/* パスワード表示切り替えアイコンボタン */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-900 p-2"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* パスワードに関する補足説明とエラー表示 */}
                <div className="sm:ml-[172px] space-y-1">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    ※ 8文字以上、半角英数字・指定の記号(!@#$%^&*()_-+=?)のみ（全角不可）が使用できます。<br />
                    <span className="text-red-500 font-medium">※ 全角文字(日本語・全角数字など)は使用できません。</span>
                  </p>
                  {errors.password && (
                    <p className="text-red-500 text-sm font-bold">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {/* --- 確認用パスワード入力項目 --- */}
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

              {/* --- 送信ボタンエリア --- */}
              <div className="flex justify-center pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting} // 二重送信防止
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