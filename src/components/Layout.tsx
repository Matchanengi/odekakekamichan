import { type ReactNode } from 'react'; // type を追加
import { Header } from './Header';

import { type MainPage } from "../App";

interface LayoutProps {
  children: ReactNode;
  currentMainPage: MainPage;
  onMainPageChange: (page: MainPage) => void;
}

/**
 * 管理画面専用のレイアウトコンポーネント
 */
export function Layout({ children, currentMainPage, onMainPageChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-200">
      <Header currentMainPage={currentMainPage} onMainPageChange={onMainPageChange} />
      <main className="p-3 sm:p-6">
        {children} {/* ここに各管理ページが表示される */}
      </main>
    </div>
  );
}