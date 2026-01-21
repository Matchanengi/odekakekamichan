import { type MainPage } from "../App";

/**
 * Headerコンポーネントのプロップス（引数）の型定義
 */
interface HeaderProps {
  // 現在表示しているメインページの名前（'top', 'contact' など）
  currentMainPage: MainPage;
  // ページを切り替えるための関数。親コンポーネントの状態を更新する
  onMainPageChange: (page: MainPage) => void;
}

/**
 * サイト共通のヘッダーコンポーネント
 * * 役割：
 * 1. ロゴの表示
 * 2. お問い合わせページへのリンク
 * 3. 主要機能（トップ、予約管理、お知らせ、会員情報）のナビゲーション
 */
export function Header({ currentMainPage, onMainPageChange }: HeaderProps) {
  return (
    // 外枠：深緑の背景（bg-green-700）、文字は白、レスポンシブなパディングを設定
    <header className="bg-green-700 text-white px-4 sm:px-8 py-4">
      {/* レイアウトコンテナ：
          - デフォルト（スマホ）では縦並び（flex-col）
          - デスクトップ（sm以上）では横並び（sm:flex-row）かつ両端に配置
      */}
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        
        {/* --- 左側：ロゴエリア --- */}
        <div className="text-2xl">
          <h1 className="leading-tight">おでかけ</h1>
          <h1 className="leading-tight">かみちゃん</h1>
        </div>
        
        {/* --- 右側：リンク・ナビゲーションエリア --- */}
        <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
          
          {/* 上段：お問い合わせリンク */}
          <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-lg">
            <span>→</span>
            <button 
              onClick={() => onMainPageChange('contact')} 
              className="hover:underline"
            >
              お問い合わせ
            </button>
          </div>
          
          {/* 下段：メインナビゲーション（タブ形式のボタン） */}
          <nav className="flex gap-0 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            
            {/* トップボタン */}
            <button 
              onClick={() => onMainPageChange('top')}
              className={`px-3 sm:px-6 py-2 sm:py-3 border-2 border-black text-sm sm:text-lg flex-1 sm:flex-none ${
                // 現在のページが 'top' なら白背景、それ以外は薄グレー
                currentMainPage === 'top' ? 'bg-white text-black' : 'bg-gray-100 text-black'
              }`}
            >
              トップ
            </button>

            {/* 予約管理ボタン */}
            <button 
              onClick={() => onMainPageChange('reservations')}
              className={`px-3 sm:px-6 py-2 sm:py-3 border-2 border-l-0 border-black text-sm sm:text-lg flex-1 sm:flex-none ${
                // border-l-0：左側の枠線を消して隣のボタンとの重複を防ぐ
                currentMainPage === 'reservations' ? 'bg-white text-black' : 'bg-gray-100 text-black'
              }`}
            >
              予約管理
            </button>

            {/* お知らせボタン */}
            <button 
              onClick={() => onMainPageChange('notifications')}
              className={`px-3 sm:px-6 py-2 sm:py-3 border-2 border-l-0 sm:border-l-0 border-t-0 sm:border-t-2 border-black text-sm sm:text-lg flex-1 sm:flex-none ${
                // border-t-0 / sm:border-t-2：スマホでの折り返し時に上の枠線が重ならないよう調整
                currentMainPage === 'notifications' ? 'bg-white text-black' : 'bg-gray-100 text-black'
              }`}
            >
              お知らせ
            </button>

            {/* 会員情報ボタン */}
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