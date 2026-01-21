import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
//import { ApprovalsPage } from './ApprovalsPage'; // 将来的な拡張用または削除済み
import { DashboardPage } from './DashboardPage';
import { DeparturesPage } from './DeparturesPage';

/**
 * このページ内で切り替えるサブページの型定義
 */
type Page = 'dashboard' | 'departures';

/**
 * 管理画面のメインコンテンツエリア
 * 役割：サイドバーでの選択に応じて、表示するコンポーネントを切り替える
 */
export function TopPage() {
  // --- 状態管理 ---
  // 現在どのタブ（ダッシュボード or 出発便）を表示しているかを保持。初期値は 'dashboard'
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  return (
    // 外枠：緑色の丸みを帯びたコンテナ
    <div className="bg-green-700 rounded-3xl p-3 sm:p-8">
      {/* 白背景のメインエリア：モバイルでは縦、md(768px)以上で横に分割（サイドバー+コンテンツ） */}
      <div className="bg-white rounded-3xl p-3 sm:p-8 min-h-[500px] flex flex-col md:flex-row">
        
        {/* 左側：ナビゲーションサイドバー
            currentPageを渡し、更新用のsetCurrentPageを関数として渡す */}
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        
        {/* 右側：コンテンツ表示エリア */}
        <div className="flex-1 md:pl-8 mt-4 md:mt-0">
          {/* 現在の状態（currentPage）に基づいて、表示するコンポーネントを条件付きレンダリング */}
          {currentPage === 'dashboard' && <DashboardPage />}
          
          {/* ApprovalsPage の表示条件は削除またはコメントアウトされています */}
          {/* {currentPage === 'approvals' && <ApprovalsPage />} */}
          
          {currentPage === 'departures' && <DeparturesPage />}
        </div>
      </div>
    </div>
  );
}