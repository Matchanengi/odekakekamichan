/**
 * サイドバー内で管理するページの型定義
 * 'dashboard' (利用状況) か 'departures' (出発便) のいずれか
 */
type Page = 'dashboard' | 'departures';

/**
 * Sidebarコンポーネントのプロップス定義
 */
interface SidebarProps {
  // 現在アクティブなページ
  currentPage: Page;
  // ボタンクリック時にページを切り替えるためのコールバック関数
  onPageChange: (page: Page) => void;
}

/**
 * サイドバーコンポーネント
 * * 特徴：
 * - モバイル（デフォルト）では全幅、デスクトップ（md以上）では固定幅（w-64）になります。
 * - 現在のページに応じて、ボタンの背景色と枠線色が反転するデザインです。
 */
export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    // aside: 補助的なナビゲーションであることを示すHTMLタグ
    // md:w-64: 画面幅が中サイズ(768px)以上の場合、幅を16rem(約256px)に固定
    <aside className="w-full md:w-64">
      {/* space-y-4: ボタン同士の垂直間隔を空ける */}
      <div className="space-y-4 flex flex-col">
        
        {/* --- ボタン1: 本日の利用状況 --- */}
        <button
          onClick={() => onPageChange('dashboard')}
          className={`w-full py-4 md:py-6 px-4 md:px-6 rounded-2xl border-4 text-center text-lg md:text-xl ${
            // アクティブ時：白背景 ＋ 緑枠 ＋ 黒文字
            // 非アクティブ時：緑背景 ＋ 白枠 ＋ 白文字
            currentPage === 'dashboard' 
              ? 'bg-white text-black border-green-700' 
              : 'bg-green-700 text-white border-white'
          }`}
        >
          {/* leading-tight: 行間を詰め、2行のテキストを一体化して見せる */}
          <div className="leading-tight">本日の</div>
          <div className="leading-tight">利用状況</div>
        </button>

        {/* --- ボタン2: まもなく出発する便 --- */}
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