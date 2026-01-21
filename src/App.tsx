import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Layout } from './components/Layout';
import { TopPage } from './components/TopPage';
import { ReservationManagementPage } from './components/ReservationManagementPage';
import { NewReservationPage } from './components/NewReservationPage';
import { NotificationsPage } from './components/NotificationsPage';
import { ContactPage } from './components/ContactPage';
import { MemberInfoPage } from './components/MemberInfoPage';
import { UserLandingPage } from './components/UserLandingPage';
import { UserHeader } from './components/UserHeader';
import { LoginPage } from './components/LoginPage';
import { MapPage } from './components/MapPage';
import { UserBusBookingPage } from './components/UserBusBookingPage';
import { RouteMapPage } from './components/RouteMapPage';
import { TravelPlanPage } from './components/TravelPlanPage';
import { ItineraryPage } from './components/ItineraryPage';
import { SightseeingPage } from './components/SightseeingPage';
import { RegisterPage } from './components/RegisterPage';
import { RegisterConfirmPage } from './components/RegisterConfirmPage';
import { PasswordResetPage } from './components/PasswordResetPage';
import { OneTimePasswordPage } from './components/OneTimePasswordPage';
import { NewPasswordPage } from './components/NewPasswordPage';
import { BookingConfirmPage } from './components/BookingConfirmPage';
import { BookingCompletePage } from './components/BookingCompletePage';
import { BusResultsPage } from './components/BusResultsPage';
import './App.css';

/**
 * ページの型定義
 * UserPage: 一般ユーザー・ゲスト向けのページ遷移
 * MainPage: 管理者向けのサイドメニュー/メインコンテンツ遷移
 */
export type UserPage = 'home' | 'travel' | 'sightseeing' | 'booking' | 'login' | 'map' | 'contact' | 'member' | 'route-map' | 'itinerary' | 'register' | 'register-confirm' | 'password-reset' | 'one-time-password' | 'new-password' | 'bus-results' | 'booking-confirm' | 'booking-complete';
export type MainPage = 'top' | 'reservations' | 'new-reservation' | 'notifications' | 'member' | 'contact';

export default function App() {
  // AuthContextからユーザー情報と認証状態を取得
  const { user, role, profile, signOut, loading: authLoading } = useAuth();

  // 現在のユーザーが管理者かどうかを判定
  const isAdmin = role === 'admin';

  /** * 画面制御のためのステート（状態）管理
   */
  const [currentMainPage, setCurrentMainPage] = useState<MainPage>('top'); // 管理者用ページ
  const [currentUserPage, setCurrentUserPage] = useState<UserPage>('home'); // ユーザー用ページ
  const [loginMessage, setLoginMessage] = useState<string>(''); // ログイン画面に表示する通知
  const [registerData, setRegisterData] = useState<any>(null); // 新規登録の一時データ
  const [resetEmail, setResetEmail] = useState(''); // パスワード再設定用メールアドレス
  const [resetOtp, setResetOtp] = useState(''); // パスワード再設定用ワンタイムパスワード
  const [busSearchData, setBusSearchData] = useState<any>(null); // バス検索条件の保持
  const [bookingData, setBookingData] = useState<any>(null); // 選択された予約内容の保持
  const [mapSpots, setMapSpots] = useState<any[]>([]); // マップに表示するスポットデータ

  /**
   * セキュリティ監視（ガード機能）
   * 未ログイン時に会員専用ページへアクセスしようとした場合、強制的にホームへ戻す
   */
  useEffect(() => {
    const protectedPages: UserPage[] = ['member', 'booking', 'bus-results', 'booking-confirm', 'booking-complete'];
    if (!user && protectedPages.includes(currentUserPage)) {
      setCurrentUserPage('home');
    }
  }, [user, currentUserPage]);

  /**
   * ログイン成功時のハンドラ
   */
  const handleLoginAsUser = () => {
    setCurrentUserPage('home');
    setLoginMessage('');
  };

  /**
   * ログアウト実行ハンドラ
   */
  const handleLogout = async () => {
    await signOut();
    // ログアウト後は各状態を初期ページに戻す
    setCurrentUserPage('home');
    setCurrentMainPage('top');
  };

  /**
   * 認証チェック中のスプラッシュ画面
   */
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      <p className="text-blue-900 font-bold tracking-widest">おでかけかみちゃん 起動中...</p>
    </div>
  );

  // --- 管理者ビュー (adminロールを持つログイン済みユーザー) ---
  if (user && isAdmin) {
    return (
      <Layout currentMainPage={currentMainPage} onMainPageChange={setCurrentMainPage}>
        {currentMainPage === 'top' && <TopPage />}
        {currentMainPage === 'reservations' && <ReservationManagementPage onNavigate={setCurrentMainPage} />}
        {currentMainPage === 'new-reservation' && <NewReservationPage onNavigate={setCurrentMainPage} />}
        {currentMainPage === 'notifications' && <NotificationsPage />}
        {currentMainPage === 'member' && <MemberInfoPage onLogout={handleLogout} isAdmin={true} />}
        {currentMainPage === 'contact' && <ContactPage onBack={() => setCurrentMainPage('top')} isAdmin={true} />}
      </Layout>
    );
  }

  // --- 一般ユーザー・ゲストビュー ---
  return (
    <div>
      {/* 共通ヘッダー：ログイン状態やページ遷移を管理 */}
      <UserHeader
        currentPage={currentUserPage}
        onPageChange={(page) => {
          if (page === 'login') setLoginMessage('');
          // 登録フロー以外に移動した場合は登録用データを破棄
          const registrationFlow: UserPage[] = ['register', 'register-confirm'];
          if (!registrationFlow.includes(page)) setRegisterData(null);
          setCurrentUserPage(page);
        }}
        isLoggedIn={!!user}
        onBusBookingRequireLogin={() => {
          // 未ログインでバス予約を押した際の処理
          setLoginMessage('バス予約は会員のみの機能です。ログインしてください。');
          setCurrentUserPage('login');
        }}
      />

      <main>
        {/* ホーム/ランディングページ */}
        {currentUserPage === 'home' && <UserLandingPage onNavigate={setCurrentUserPage} />}
        
        {/* 認証関連：ログイン */}
        {currentUserPage === 'login' && (
          <LoginPage
            onLoginAsUser={handleLoginAsUser}
            onShowRegister={() => setCurrentUserPage('register')}
            onShowPasswordReset={() => setCurrentUserPage('password-reset')}
            message={loginMessage}
          />
        )}

        {/* 認証関連：新規会員登録フロー */}
        {currentUserPage === 'register' && (
          <RegisterPage initialData={registerData} onShowConfirm={(data: any) => { setRegisterData(data); setCurrentUserPage('register-confirm'); }} />
        )}
        {currentUserPage === 'register-confirm' && registerData && (
          <RegisterConfirmPage data={registerData} onBack={() => setCurrentUserPage('register')} onConfirm={() => { setLoginMessage('登録完了！ログインしてください。'); setCurrentUserPage('login'); setRegisterData(null); }} />
        )}

        {/* 認証関連：パスワードリセットフロー */}
        {currentUserPage === 'password-reset' && <PasswordResetPage onBack={() => setCurrentUserPage('login')} onSendEmail={(email) => { setResetEmail(email); setCurrentUserPage('one-time-password'); }} />}
        {currentUserPage === 'one-time-password' && <OneTimePasswordPage email={resetEmail} onBack={() => setCurrentUserPage('password-reset')} onConfirm={(otp) => { setResetOtp(otp); setCurrentUserPage('new-password'); }} />}
        {currentUserPage === 'new-password' && <NewPasswordPage email={resetEmail} otp={resetOtp} onComplete={() => { setLoginMessage('パスワードを更新しました。'); setCurrentUserPage('login'); }} />}

        {/* 会員情報ページ（ログイン必須） */}
        {currentUserPage === 'member' && user && (
          <MemberInfoPage onLogout={handleLogout} isAdmin={false} />
        )}

        {/* バス予約フロー（ログイン必須） */}
        {currentUserPage === 'booking' && user && (
          <UserBusBookingPage
            initialData={busSearchData}
            onShowRouteMap={() => setCurrentUserPage('route-map')}
            onShowBusResults={(data) => { setBusSearchData(data); setCurrentUserPage('bus-results'); }}
          />
        )}

        {/* 予約ステップ：検索結果 -> 内容確認 -> 完了 */}
        {currentUserPage === 'bus-results' && user && busSearchData && (
          <BusResultsPage
            searchData={busSearchData}
            onBack={() => setCurrentUserPage('booking')}
            onConfirm={(data) => {
              setBookingData(data);
              setCurrentUserPage('booking-confirm');
            }}
          />
        )}
        {currentUserPage === 'booking-confirm' && user && bookingData && (
          <BookingConfirmPage
            userId={profile?.user_id || profile?.id} // データベース側のユーザー識別子を優先
            bookingData={bookingData}
            onBack={() => setCurrentUserPage('bus-results')}
            onConfirm={() => {
              // 予約完了後はデータをクリア
              setBookingData(null);
              setBusSearchData(null);
              setCurrentUserPage('booking-complete');
            }}
          />
        )}
        {currentUserPage === 'booking-complete' && user && <BookingCompletePage onComplete={() => setCurrentUserPage('home')} />}

        {/* 一般公開・観光情報ページ */}
        {currentUserPage === 'map' && (<MapPage spots={mapSpots} />)}
        {currentUserPage === 'contact' && <ContactPage onBack={() => setCurrentUserPage('home')} isAdmin={false} />}
        {currentUserPage === 'route-map' && <RouteMapPage onBack={() => setCurrentUserPage('booking')} />}
        {currentUserPage === 'travel' && (
          <TravelPlanPage
            onShowItinerary={() => setCurrentUserPage('itinerary')}
            setMapSpots={setMapSpots}
            setCurrentUserPage={setCurrentUserPage}
          />
        )}
        {currentUserPage === 'itinerary' && <ItineraryPage />}
        {currentUserPage === 'sightseeing' && <SightseeingPage />}
      </main>
    </div>
  );
}