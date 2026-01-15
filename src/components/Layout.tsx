import { type ReactNode } from 'react'; // type を追加
import { Header } from './Header';

import { type MainPage } from "../App";

interface LayoutProps {
  children: ReactNode;
  currentMainPage: MainPage;
  onMainPageChange: (page: MainPage) => void;
}

export function Layout({ children, currentMainPage, onMainPageChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-200">
      <Header currentMainPage={currentMainPage} onMainPageChange={onMainPageChange} />
      <main className="p-3 sm:p-6">
        {children}
      </main>
    </div>
  );
}