type MainPage = 'top' | 'reservations' | 'notifications' | 'member' | 'contact';

interface HeaderProps {
  currentMainPage: MainPage;
  onMainPageChange: (page: MainPage) => void;
}

export function Header({ currentMainPage, onMainPageChange }: HeaderProps) {
  return (
    <header className="bg-green-700 text-white px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        {/* Logo */}
        <div className="text-2xl">
          <h1 className="leading-tight">おでかけ</h1>
          <h1 className="leading-tight">かみちゃん</h1>
        </div>
        
        <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          {/* Top Links */}
          <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-lg">
            <span>→</span>
            <button onClick={() => onMainPageChange('contact')} className="hover:underline">
              お問い合わせ
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex gap-0 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <button 
              onClick={() => onMainPageChange('top')}
              className={`px-3 sm:px-6 py-2 sm:py-3 border-2 border-black text-sm sm:text-lg flex-1 sm:flex-none ${
                currentMainPage === 'top' ? 'bg-white text-black' : 'bg-gray-100 text-black'
              }`}
            >
              トップ
            </button>
            <button 
              onClick={() => onMainPageChange('reservations')}
              className={`px-3 sm:px-6 py-2 sm:py-3 border-2 border-l-0 border-black text-sm sm:text-lg flex-1 sm:flex-none ${
                currentMainPage === 'reservations' ? 'bg-white text-black' : 'bg-gray-100 text-black'
              }`}
            >
              予約管理
            </button>
            <button 
              onClick={() => onMainPageChange('notifications')}
              className={`px-3 sm:px-6 py-2 sm:py-3 border-2 border-l-0 sm:border-l-0 border-t-0 sm:border-t-2 border-black text-sm sm:text-lg flex-1 sm:flex-none ${
                currentMainPage === 'notifications' ? 'bg-white text-black' : 'bg-gray-100 text-black'
              }`}
            >
              お知らせ
            </button>
            <button 
              onClick={() => onMainPageChange('member')}
              className={`px-3 sm:px-6 py-2 sm:py-3 border-2 border-l-0 border-t-0 sm:border-t-2 border-black text-sm sm:text-lg flex-1 sm:flex-none ${
                currentMainPage === 'member' ? 'bg-white text-black' : 'bg-gray-100 text-black'
              }`}
            >
              会員情報
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}