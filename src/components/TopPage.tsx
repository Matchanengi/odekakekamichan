import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
//import { ApprovalsPage } from './ApprovalsPage';
import { DashboardPage } from './DashboardPage';
import { DeparturesPage } from './DeparturesPage';

type Page = 'dashboard' | 'departures';

export function TopPage() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  return (
    <div className="bg-green-700 rounded-3xl p-3 sm:p-8">
      <div className="bg-white rounded-3xl p-3 sm:p-8 min-h-[500px] flex flex-col md:flex-row">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <div className="flex-1 md:pl-8 mt-4 md:mt-0">
          {currentPage === 'dashboard' && <DashboardPage />}
          {/* 3. ApprovalsPage の表示条件を削除 */}
          {/* {currentPage === 'approvals' && <ApprovalsPage />} */}
          {currentPage === 'departures' && <DeparturesPage />}
        </div>
      </div>
    </div>
  );
}