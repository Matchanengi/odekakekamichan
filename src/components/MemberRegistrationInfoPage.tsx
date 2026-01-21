// import { useState } from 'react';
import type { User } from '@supabase/supabase-js';

/**
 * データベース（独自テーブル）側のユーザー情報型定義
 * Supabase Authとは別に管理している名前などのプロフィール情報
 */
type UserProfile = {
  id: number;
  name: string;
  email: string;
};

/**
 * プロパティの型定義
 */
interface MemberRegistrationInfoPageProps {
  onBack: () => void;         // 「戻る」ボタン押下時のコールバック関数
  isAdmin?: boolean;          // 管理者モード判定（背景色の切り替えに使用）
  user: User | null;          // Supabase Authから取得した認証メタデータ
  profile: UserProfile | null; // データベースから直接取得したユーザー名等の情報
}

/**
 * 会員登録情報の確認ページコンポーネント
 */
export function MemberRegistrationInfoPage({ 
  onBack, 
  isAdmin = false, 
  user, 
  profile 
}: MemberRegistrationInfoPageProps) {
  
  // 管理者モードならグリーン、通常ならシアンに背景色を切り替え
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';

  /**
   * Google連携状態の判定
   * Supabaseから渡される user オブジェクトの中身を多角的にチェック
   * 1. app_metadata.provider が 'google' かどうか
   * 2. identities（ログイン手段の配列）の中に 'google' が含まれているか
   */
  const isGoogleLinked = user?.app_metadata?.provider === 'google' || 
                         user?.identities?.some(id => id.provider === 'google');
  
  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        {/* ヘッダーセクション */}
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">登録情報確認</h2>
        
        <div className="space-y-6 sm:space-y-8 max-w-2xl">
          
          {/* 1. お名前表示エリア（データベースから取得した実名） */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-gray-50 pb-4">
            <span className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">お名前</span>
            <span className="text-lg sm:text-xl text-gray-800">
              {profile?.name || '未設定'}
            </span>
          </div>
          
          {/* 2. Email表示エリア（認証システムに登録されているログイン用メール） */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-gray-50 pb-4">
            <span className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">Email</span>
            <span className="text-lg sm:text-xl text-gray-800 italic">
              {user?.email || '未設定'}
            </span>
          </div>
          
          {/* 3. パスワード表示エリア（表示不可のためマスク処理） */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-gray-50 pb-4">
            <span className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">パスワード</span>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl text-gray-800">●●●●●●●●●●</span>
              <span className="ml-4 text-xs text-gray-400">※セキュリティのため表示されません</span>
            </div>
          </div>
          
          {/* 4. Google連携状態表示エリア（ソーシャルログイン連携の有無） */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-gray-50 pb-4">
            <span className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">Googleアカウント</span>
            <span className={`text-lg sm:text-xl ${isGoogleLinked ? 'text-green-600' : 'text-gray-400'}`}>
              {isGoogleLinked ? '● 連携済み' : '未連携'}
            </span>
          </div>
          
          {/* アクションボタンエリア */}
          <div className="flex gap-4 pt-8">
            {/* 戻るボタン：呼び出し元の前の状態（マイページ等）へ戻る */}
            <button
              onClick={onBack}
              className="bg-gray-500 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors font-bold"
            >
              戻る
            </button>
            
            {/* 確認終了ボタン：現在は戻るボタンと同じ動作 */}
            <button 
              onClick={onBack}
              className="bg-blue-600 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              確認終了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}