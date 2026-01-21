import { type UserPage } from "../App";

interface UserHeaderProps {
  currentPage: UserPage;               // 現在のページ
  onPageChange: (page: UserPage) => void; // ページ遷移関数
  isLoggedIn?: boolean;                // ログインしているか
  onBusBookingRequireLogin?: () => void; // ログインが必要な際に呼ばれる処理
}

/**
 * ユーザー向け共通ヘッダーコンポーネント
 */
export function UserHeader({ currentPage, onPageChange, isLoggedIn = false, onBusBookingRequireLogin }: UserHeaderProps) {
  // eslint等の警告回避のため currentPage を明示的に参照
  void currentPage;
  
  return (
    <header className="bg-cyan-400 text-blue-900 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        {/* ロゴ部分：クリックでホームへ戻る */}
        <button onClick={() => onPageChange('home')} className="hover:opacity-80">
          <div className="text-2xl sm:text-3xl">
            <h1 className="leading-tight">おでかけ</h1>
            <h1 className="leading-tight">かみちゃん</h1>
          </div>
        </button>
        
        <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          {/* 上部サブリンク（MAP・お問い合わせ） */}
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
          
          {/* メインナビゲーション */}
          <nav className="flex gap-0 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {/* 旅ページへ */}
            <button 
              onClick={() => onPageChange('travel')}
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-black text-sm sm:text-base flex-1 sm:flex-none bg-white hover:bg-gray-50"
            >
              旅
            </button>
            {/* 観光地ページへ */}
            <button 
              onClick={() => onPageChange('sightseeing')}
              className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-l-0 border-black text-sm sm:text-base flex-1 sm:flex-none bg-white hover:bg-gray-50"
            >
              観光地
            </button>
            {/* バス予約：ログイン状況によって挙動を分岐 */}
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
            {/* 会員関連：ログイン済みなら「会員情報」、未ログインなら「会員登録/ログイン」 */}
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