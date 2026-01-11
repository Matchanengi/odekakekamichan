import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// 同じフォルダ内の supabaseClient.ts からインポート
import { supabase } from "./supabaseClient";

/**
 * 1. バリデーションルールの定義 (Zod)
 * ここでデータの形式を厳格に定義します。
 */
const contactSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("正しいメールアドレスの形式で入力してください"),
  subject: z
    .string()
    .min(1, "件名を入力してください")
    .max(50, "件名は50文字以内で入力してください"),
  content: z
    .string()
    .min(10, "お問い合わせ内容は10文字以上で入力してください")
    .max(1000, "1000文字以内で入力してください"),
});

// 型定義の自動生成
type ContactFormData = z.infer<typeof contactSchema>;

export function ContactPage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * 2. React Hook Form の設定
   * mode: "onSubmit" により、ボタンを押すまでエラーを表示しません。
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onSubmit",         // 最初のエラーチェックは送信時
    reValidateMode: "onSubmit" // 修正中も送信ボタンを押すまで再チェックしない（静かな設定）
  });

  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';

  /**
   * 3. 送信処理
   * バリデーションを通過したデータのみが data 引数に渡されます。
   */
  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('お問い合わせ')
        .insert([
          {
            email: data.email,
            subject: data.subject,
            content: data.content,
            received_at: new Date().toISOString(),
            status_ask: "未対応" // Supabase側のEnum型/文字列に合わせる
          }
        ]);

      if (error) throw error;
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Supabase Error:', error);
      alert(`送信に失敗しました: ${error.message || "通信エラー"}`);
    } finally {
      setLoading(false);
    }
  };

  // 送信完了画面
  if (isSubmitted) {
    return (
      <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
        <div className="bg-white rounded-3xl p-6 sm:p-12">
          <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">送信完了</h2>
          <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] gap-8">
            <div className="border-2 border-black bg-gray-300 rounded-lg p-8 sm:p-12 max-w-2xl w-full text-center">
              <p className="text-lg sm:text-xl leading-relaxed">
                お問い合わせ内容をお送りしました。<br />
                返信には2～3日かかります。
              </p>
            </div>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-16 sm:px-24 py-3 sm:py-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              確認
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 入力フォーム画面
  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">お問い合わせ</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
          
          {/* 氏名入力 */}
          {/*           
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-blue-600 min-w-[120px]">氏名</label>
            <input
              type="text"
              placeholder="山田 太郎"
              className="flex-1 border-2 border-black rounded-lg px-4 py-2"
            />
          </div>
          */}

          {/* Email */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-blue-600 italic min-w-[120px]">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="example@mail.com"
                className={`flex-1 border-2 rounded-lg px-4 py-2 outline-none ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-black focus:border-blue-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm sm:ml-[136px] font-bold">{errors.email.message}</p>
            )}
          </div>
          
          {/* 件名 */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-blue-600 min-w-[120px]">件名</label>
              <input
                {...register("subject")}
                type="text"
                placeholder="不具合について"
                className={`flex-1 border-2 rounded-lg px-4 py-2 outline-none ${
                  errors.subject ? 'border-red-500 bg-red-50' : 'border-black focus:border-blue-500'
                }`}
              />
            </div>
            {errors.subject && (
              <p className="text-red-500 text-sm sm:ml-[136px] font-bold">{errors.subject.message}</p>
            )}
          </div>
          
          {/* 内容 */}
          <div className="flex flex-col gap-1">
            <label className="text-blue-600 block mb-2">お問い合わせ内容</label>
            <textarea
              {...register("content")}
              rows={8}
              placeholder="こちらにお問い合わせ内容を入力してください（10文字以上）"
              className={`w-full border-2 rounded-lg px-4 py-2 outline-none ${
                errors.content ? 'border-red-500 bg-red-50' : 'border-black focus:border-blue-500'
              }`}
            />
            {errors.content && (
              <p className="text-red-500 text-sm font-bold">{errors.content.message}</p>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`text-white px-12 sm:px-20 py-3 sm:py-4 rounded-lg transition-colors font-bold ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? "送信中..." : "送信"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}