import { useState } from "react";
import { MemberRegistrationInfoPage } from "./MemberRegistrationInfoPage";
import { EmailChangePage } from "./EmailChangePage";
import { PasswordChangePage } from "./PasswordChangePage";
import { MessagesPage } from "./MessagesPage";
import { TermsOfServicePage } from "./TermsOfServicePage";

interface MemberInfoPageProps {
  onLogout?: () => void;
  isAdmin?: boolean;
}

export function MemberInfoPage({ onLogout, isAdmin = false }: MemberInfoPageProps = {}) {
  const [currentView, setCurrentView] = useState<string | null>(null);
  
  const bgColor = isAdmin ? 'bg-green-700' : 'bg-cyan-400';

  if (currentView === "registration") {
    return <MemberRegistrationInfoPage onBack={() => setCurrentView(null)} isAdmin={isAdmin} />;
  }

  if (currentView === "email") {
    return <EmailChangePage onBack={() => setCurrentView(null)} isAdmin={isAdmin} />;
  }

  if (currentView === "password") {
    return <PasswordChangePage onBack={() => setCurrentView(null)} isAdmin={isAdmin} />;
  }

  if (currentView === "messages") {
    return <MessagesPage onBack={() => setCurrentView(null)} isAdmin={isAdmin} />;
  }

  if (currentView === "terms") {
    return <TermsOfServicePage onBack={() => setCurrentView(null)} isAdmin={isAdmin} />;
  }

  const menuItems = [
    { label: "登録情報確認", buttonText: "確認", onClick: () => setCurrentView("registration") },
    { label: "E-mail変更", buttonText: "変更", onClick: () => setCurrentView("email") },
    { label: "パスワード変更", buttonText: "変更", onClick: () => setCurrentView("password") },
    { label: "メッセージ", buttonText: "確認", onClick: () => setCurrentView("messages") },
    { label: "利用規約確認", buttonText: "確認", onClick: () => setCurrentView("terms") },
  ];

  return (
    <div className={`${bgColor} rounded-3xl p-3 sm:p-8`}>
      <div className="bg-white rounded-3xl p-6 sm:p-12">
        <h2 className="text-2xl sm:text-3xl mb-8 sm:mb-12 text-blue-600">会員情報</h2>
        
        <div className="space-y-4 sm:space-y-6 max-w-2xl">
          {menuItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4 sm:gap-8">
              <span className="text-lg sm:text-xl text-blue-600 flex-1">{item.label}</span>
              <button 
                onClick={item.onClick}
                className="bg-blue-600 text-white px-8 sm:px-12 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors min-w-[100px] sm:min-w-[120px]"
              >
                {item.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        {onLogout && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full max-w-md mx-auto block bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </div>
  );
}