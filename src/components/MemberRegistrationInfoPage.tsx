//import { useState } from 'react';
import type { User } from '@supabase/supabase-js';

// AuthContextで定義した型と合わせる
type UserProfile = {
  id: number;
  name: string;
  email: string;
};

interface MemberRegistrationInfoPageProps {
  onBack: () => void;
  isAdmin?: boolean;
  user: User | null;      // AuthContextからのログイン情報
  profile: UserProfile | null; // データベースからの名前情報
}

export function MemberRegistrationInfoPage({ 
  onBack, 
  isAdmin = false, 
  user, 
  profile 
}: MemberRegistrationInfoPageProps) {
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';

  // Google連携しているかどうかを判定
  // user.identities の中に 'google' が含まれているか確認
  const isGoogleLinked = user?.app_metadata?.provider === 'google' || 
                         user?.identities?.some(id => id.provider === 'google');
  
  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">登録情報確認</h2>
        
        <div className="space-y-6 sm:space-y-8 max-w-2xl">
          {/* お名前（DBのユーザテーブルから取得） */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-gray-50 pb-4">
            <span className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">お名前</span>
            <span className="text-lg sm:text-xl text-gray-800">
              {profile?.name || '未設定'}
            </span>
          </div>
          
          {/* Email（Authenticationから取得） */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-gray-50 pb-4">
            <span className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">Email</span>
            <span className="text-lg sm:text-xl text-gray-800 italic">
              {user?.email || '未設定'}
            </span>
          </div>
          
          {/* パスワード（セキュリティ上、表示はできないので伏せ字のみ） */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-gray-50 pb-4">
            <span className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">パスワード</span>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl text-gray-800">●●●●●●●●●●</span>
              <span className="ml-4 text-xs text-gray-400">※セキュリティのため表示されません</span>
            </div>
          </div>
          
          {/* Google連携状態 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 border-b border-gray-50 pb-4">
            <span className="text-blue-600 font-bold min-w-[140px] sm:min-w-[180px]">Googleアカウント</span>
            <span className={`text-lg sm:text-xl ${isGoogleLinked ? 'text-green-600' : 'text-gray-400'}`}>
              {isGoogleLinked ? '● 連携済み' : '未連携'}
            </span>
          </div>
          
          <div className="flex gap-4 pt-8">
            <button
              onClick={onBack}
              className="bg-gray-500 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition-colors font-bold"
            >
              戻る
            </button>
            {/* このページは「確認」なので決定ボタンは戻る動作にするか、あるいは編集へ飛ばす */}
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