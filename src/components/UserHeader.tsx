import { type UserPage } from "../App";

interface UserHeaderProps {
  currentPage: UserPage;
  onPageChange: (page: UserPage) => void;
  isLoggedIn?: boolean;
  onBusBookingRequireLogin?: () => void;
}

export function UserHeader({ currentPage, onPageChange, isLoggedIn = false, onBusBookingRequireLogin }: UserHeaderProps) {
  // 関数の冒頭で currentPage を使うか、何もしないことでエラーを回避
  void currentPage;
  return (
    <header className="bg-cyan-400 text-blue-900 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        {/* Logo */}
        <button onClick={() => onPageChange('home')} className="hover:opacity-80">
          <div className="text-2xl sm:text-3xl">
            <h1 className="leading-tight">おでかけ</h1>
            <h1 className="leading-tight">かみちゃん</h1>
          </div>
        </button>
        
        <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          {/* Top Links */}
          <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base">
            <span>→</span>
            <button onClick={() => onPageChange('map')} className="hover:underline">
              MAP
            </button>
            <span>→</span>
            <button onClick={() => onPageChange('contact')} className="hover:underline">
              お問い合わせ
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex gap-0 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <button 
              onClick={() => onPageChange('travel')}
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-black text-sm sm:text-base flex-1 sm:flex-none bg-white hover:bg-gray-50"
            >
              旅
            </button>
            <button 
              onClick={() => onPageChange('sightseeing')}
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-l-0 border-black text-sm sm:text-base flex-1 sm:flex-none bg-white hover:bg-gray-50"
            >
              観光地
            </button>
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  onPageChange('booking');
                } else if (onBusBookingRequireLogin) {
                  onBusBookingRequireLogin();
                }
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-l-0 border-black text-sm sm:text-base flex-1 sm:flex-none bg-white hover:bg-gray-50"
            >
              バス予約
            </button>
            <button 
              onClick={() => onPageChange(isLoggedIn ? 'member' : 'login')}
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-l-0 border-black text-sm sm:text-base flex-1 sm:flex-none bg-white hover:bg-gray-50"
            >
              {isLoggedIn ? (
                <div>会員情報</div>
              ) : (
                <>
                  <div className="leading-tight">会員登録/</div>
                  <div className="leading-tight">ログイン</div>
                </>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}