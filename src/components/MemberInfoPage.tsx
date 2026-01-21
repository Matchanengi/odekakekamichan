import { useState } from "react";
import { useAuth } from "../AuthContext"; 
import { MemberRegistrationInfoPage } from "./MemberRegistrationInfoPage";
// EmailChangePage のインポートを削除しました
import { PasswordChangePage } from "./PasswordChangePage";
import { MessagesPage } from "./MessagesPage";
import { TermsOfServicePage } from "./TermsOfServicePage";

/**
 * MemberInfoPage のプロパティ定義
 */
interface MemberInfoPageProps {
  onLogout?: () => void; // ログアウト処理（親コンポーネントから渡される）
  isAdmin?: boolean;    // 管理者フラグ（背景色の切り替えに使用）
}

/**
 * 会員情報マイページのメインコンポーネント
 * 各メニュー（登録情報確認、パスワード変更等）への遷移を管理します。
 */
export function MemberInfoPage({ onLogout, isAdmin = false }: MemberInfoPageProps = {}) {
  /**
   * 現在表示している子画面を管理するステート
   * null: メニュー一覧を表示
   * "registration": 登録情報確認を表示
   * "password": パスワード変更を表示
   * ...などの文字列を入れて画面を切り替える
   */
  const [currentView, setCurrentView] = useState<string | null>(null);

  // AuthContextから現在のログインユーザー情報とプロフィール情報を取得
  const { user, profile } = useAuth();

  // 管理者モードか否かで全体の背景色を決定
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';

  // --- 表示切り替えロジック（条件付きレンダリング） ---

  // 1. 登録情報確認画面
  if (currentView === "registration") {
    return (
      <MemberRegistrationInfoPage 
        onBack={() => setCurrentView(null)} // ステートをnullに戻すことでメニューに戻る
        isAdmin={isAdmin}
        user={user}
        profile={profile}
      />
    );
  }

  // Emailの分岐を削除しました（履歴：以前はここにEmail変更画面への遷移があった）

  // 2. パスワード変更画面
  if (currentView === "password") {
    return (
      <PasswordChangePage 
        onBack={() => setCurrentView(null)} 
        isAdmin={isAdmin} 
      />
    );
  }

  // 3. メッセージ（お知らせ・予約通知）画面
  if (currentView === "messages") {
    return <MessagesPage onBack={() => setCurrentView(null)} isAdmin={isAdmin} />;
  }

  // 4. 利用規約画面
  if (currentView === "terms") {
    return <TermsOfServicePage onBack={() => setCurrentView(null)} isAdmin={isAdmin} />;
  }

  // --- メニュー構成データの定義 ---
  /**
   * メニュー一覧を配列で定義し、map関数で回してレンダリングすることで
   * メンテナンス性（項目の追加・削除）を高めています。
   */
  const menuItems = [
    { label: "登録情報確認", buttonText: "確認", onClick: () => setCurrentView("registration") },
    { label: "パスワード変更", buttonText: "変更", onClick: () => setCurrentView("password") },
    { label: "メッセージ", buttonText: "確認", onClick: () => setCurrentView("messages") },
    { label: "利用規約確認", buttonText: "確認", onClick: () => setCurrentView("terms") },
  ];

  // --- メインメニューの表示（currentView === null の時） ---
  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8 shadow-xl`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm">
        
        {/* ヘッダー：タイトルとユーザー名の表示 */}
        <div className="flex justify-between items-center mb-8 sm:mb-12 border-b-2 border-cyan-50 pb-6">
          <h2 className="text-2xl sm:text-3xl text-blue-600 font-bold">会員情報</h2>
          {profile && (
            <div className="text-right">
              <p className="text-blue-400 text-xs font-bold mb-1">ログイン中</p>
              <p className="text-gray-700 font-bold">{profile.name} 様</p>
            </div>
          )}
        </div>
        
        {/* メニューリスト：定義した配列をループ表示 */}
        <div className="space-y-4 sm:space-y-6 max-w-2xl">
          {menuItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4 sm:gap-8 border-b border-gray-50 pb-4 last:border-0">
              <span className="text-lg sm:text-xl text-blue-800 flex-1">{item.label}</span>
              <button 
                onClick={item.onClick}
                className="bg-blue-600 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors min-w-[100px] sm:min-w-[120px] font-bold shadow-sm"
              >
                {item.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* ログアウトボタンエリア：onLogoutが渡されている場合のみ表示 */}
        {onLogout && (
          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <button
              onClick={onLogout}
              className="w-full max-w-sm bg-red-50 text-red-500 border-2 border-red-100 px-8 py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold"
            >
              ログアウトする
            </button>
            <p className="text-[10px] text-gray-400 mt-4">
              ※5分間操作がない場合も自動的にログアウトされます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}