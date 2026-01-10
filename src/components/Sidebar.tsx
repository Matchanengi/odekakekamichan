type Page = 'dashboard' | 'approvals' | 'departures';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="w-full md:w-64">
      <div className="space-y-4 flex flex-col">
        <button
          onClick={() => onPageChange('dashboard')}
          className={`w-full py-4 md:py-6 px-4 md:px-6 rounded-2xl border-4 text-center text-lg md:text-xl ${
            currentPage === 'dashboard' 
              ? 'bg-white text-black border-green-700' 
              : 'bg-green-700 text-white border-white'
          }`}
        >
          <div className="leading-tight">本日の</div>
          <div className="leading-tight">利用状況</div>
        </button>
        <button
          onClick={() => onPageChange('approvals')}
          className={`w-full py-4 md:py-6 px-4 md:px-6 rounded-2xl border-4 text-center text-lg md:text-xl ${
            currentPage === 'approvals' 
              ? 'bg-white text-black border-green-700' 
              : 'bg-green-700 text-white border-white'
          }`}
        >
          <div className="leading-tight">承認待ち</div>
          <div className="leading-tight">の予約</div>
        </button>
        <button
          onClick={() => onPageChange('departures')}
          className={`w-full py-4 md:py-6 px-4 md:px-6 rounded-2xl border-4 text-center text-lg md:text-xl ${
            currentPage === 'departures' 
              ? 'bg-white text-black border-green-700' 
              : 'bg-green-700 text-white border-white'
          }`}
        >
          <div className="leading-tight">まもなく</div>
          <div className="leading-tight">出発する便</div>
        </button>
      </div>
    </aside>
  );
}