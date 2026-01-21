import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// 同じフォルダ内の supabaseClient.ts からインポート（データベース接続用）
import { supabase } from "./supabaseClient";

/**
 * 1. バリデーションルールの定義 (Zod)
 * フォームの入力値が正しいかどうかを判定する「スキーマ」を定義します。
 */
const contactSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください") // 必須チェック
    .email("正しいメールアドレスの形式で入力してください"), // 形式チェック
  subject: z
    .string()
    .min(1, "件名を入力してください")
    .max(50, "件名は50文字以内で入力してください"),
  content: z
    .string()
    .min(10, "お問い合わせ内容は10文字以上で入力してください") // 最短文字数制限
    .max(1000, "1000文字以内で入力してください"), // 最長文字数制限
});

// スキーマからTypeScriptの型を自動生成（二重定義を防ぐ）
type ContactFormData = z.infer<typeof contactSchema>;

/**
 * お問い合わせページコンポーネント
 * @param onBack 戻るボタン押下時のコールバック
 * @param isAdmin 管理者画面として表示するか（背景色切り替え用）
 */
export function ContactPage({ onBack, isAdmin = false }: { onBack: () => void; isAdmin?: boolean }) {
  const [isSubmitted, setIsSubmitted] = useState(false); // 送信完了フラグ
  const [loading, setLoading] = useState(false);      // 送信中フラグ（二重送信防止）

  /**
   * 2. React Hook Form の設定
   * register: 各入力項目をHook Formに登録するための関数
   * handleSubmit: バリデーション成功時にのみonSubmitを実行するラッパー
   * errors: バリデーションエラー情報が格納されるオブジェクト
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema), // ZodとHook Formを接続
    mode: "onSubmit",         // 最初のバリデーションは送信ボタン押下時に実行
    reValidateMode: "onSubmit" // 修正中も送信ボタンを押すまで再評価しない（ユーザーの入力を妨げない設定）
  });

  // 管理者フラグにより背景色を動的に変更
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';

  /**
   * 3. 送信処理（Supabaseへのデータ挿入）
   * @param data バリデーションを通過した安全なフォームデータ
   */
  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    try {
      // Supabaseの「お問い合わせ」テーブルに新規レコードを挿入
      const { error } = await supabase
        .from('お問い合わせ')
        .insert([
          {
            email: data.email,
            subject: data.subject,
            content: data.content,
            received_at: new Date().toISOString(), // 送信時刻（ISO形式）
            status_ask: "未対応" // 初期ステータスを設定
          }
        ]);

      if (error) throw error; // エラーがあれば catch ブロックへ
      setIsSubmitted(true);   // 完了画面へ切り替え
    } catch (error: any) {
      console.error('Supabase Error:', error);
      alert(`送信に失敗しました: ${error.message || "通信エラー"}`);
    } finally {
      setLoading(false); // 送信中状態を解除
    }
  };

  /**
   * 送信完了画面
   */
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
            {/* 呼び出し元へ戻るボタン */}
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

  /**
   * 入力フォーム画面
   */
  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">お問い合わせ</h2>
        
        {/* handleSubmit で onSubmit をラップすることで、バリデーションが自動実行される */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
          
          {/* 氏名入力 (現在未使用のためコメントアウト) */}
          {/* <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-blue-600 min-w-[120px]">氏名</label>
            <input
              type="text"
              placeholder="山田 太郎"
              className="flex-1 border-2 border-black rounded-lg px-4 py-2"
            />
          </div>
          */}

          {/* Email入力フィールド */}
          <div className="flex flex-col gap-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-blue-600 italic min-w-[120px]">Email</label>
              <input
                {...register("email")} // Hook Formに登録
                type="email"
                placeholder="example@mail.com"
                className={`flex-1 border-2 rounded-lg px-4 py-2 outline-none ${
                  // エラーがある場合は枠線を赤く、背景を薄い赤にする
                  errors.email ? 'border-red-500 bg-red-50' : 'border-black focus:border-blue-500'
                }`}
              />
            </div>
            {/* メールアドレスの個別エラーメッセージ表示 */}
            {errors.email && (
              <p className="text-red-500 text-sm sm:ml-[136px] font-bold">{errors.email.message}</p>
            )}
          </div>
          
          {/* 件名入力フィールド */}
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
          
          {/* お問い合わせ内容入力フィールド（複数行） */}
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
          
          {/* 送信ボタン（ローディング中は無効化） */}
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