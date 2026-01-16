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

export type UserPage = 'home' | 'travel' | 'sightseeing' | 'booking' | 'login' | 'map' | 'contact' | 'member' | 'route-map' | 'itinerary' | 'register' | 'register-confirm' | 'password-reset' | 'one-time-password' | 'new-password' | 'bus-results' | 'booking-confirm' | 'booking-complete';
export type MainPage = 'top' | 'reservations' | 'new-reservation' | 'notifications' | 'member' | 'contact';

export default function App() {
  const { user, role, signOut, loading: authLoading } = useAuth();
  
  // ★ 自動判定：roleがadminなら管理者として扱う
  const isAdmin = role === 'admin';

  const [currentMainPage, setCurrentMainPage] = useState<MainPage>('top');
  const [currentUserPage, setCurrentUserPage] = useState<UserPage>('home');
  const [loginMessage, setLoginMessage] = useState<string>('');
  const [registerData, setRegisterData] = useState<any>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [busSearchData, setBusSearchData] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);

  // セキュリティ監視（これがないと5分放置しても画面が切り替わりません）
  useEffect(() => {
    const protectedPages: UserPage[] = ['member', 'booking', 'bus-results', 'booking-confirm', 'booking-complete'];
    if (!user && protectedPages.includes(currentUserPage)) {
      setCurrentUserPage('home');
    }
  }, [user, currentUserPage]);

  // 最新のログイン成功時の処理
  const handleLoginAsUser = () => {
    setCurrentUserPage('home');
    setLoginMessage('');
  };

  // 最新のログアウト処理
  const handleLogout = async () => {
    await signOut();
    setCurrentUserPage('home');
    setCurrentMainPage('top');
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      <p className="text-blue-900 font-bold tracking-widest">おでかけかみちゃん 起動中...</p>
    </div>
  );

  // --- 描画ロジック：管理者の場合は管理者用レイアウトを表示 ---
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

  // --- 描画ロジック：一般ユーザー・ゲスト ---
  return (
    <div>
      <UserHeader 
        currentPage={currentUserPage} 
        onPageChange={(page) => {
          if (page === 'login') setLoginMessage('');
          const registrationFlow: UserPage[] = ['register', 'register-confirm'];
          if (!registrationFlow.includes(page)) setRegisterData(null);
          setCurrentUserPage(page);
        }}
        isLoggedIn={!!user}
        onBusBookingRequireLogin={() => {
          setLoginMessage('バス予約は会員のみの機能です。ログインしてください。');
          setCurrentUserPage('login');
        }}
      />
      
      <main>
        {currentUserPage === 'home' && <UserLandingPage onNavigate={setCurrentUserPage} />}
        {currentUserPage === 'login' && (
          <LoginPage 
            onLoginAsUser={() => setCurrentUserPage('home')}
            //onLoginAsAdmin={() => {}} // 自動判別されるため空関数でOK
            onShowRegister={() => setCurrentUserPage('register')}
            onShowPasswordReset={() => setCurrentUserPage('password-reset')}
            message={loginMessage}
          />
        )}

        {currentUserPage === 'register' && (
          <RegisterPage initialData={registerData} onShowConfirm={(data) => { setRegisterData(data); setCurrentUserPage('register-confirm'); }} />
        )}
        {currentUserPage === 'register-confirm' && registerData && (
          <RegisterConfirmPage data={registerData} onBack={() => setCurrentUserPage('register')} onConfirm={() => { setLoginMessage('登録完了！ログインしてください。'); setCurrentUserPage('login'); setRegisterData(null); }} />
        )}

        {currentUserPage === 'password-reset' && <PasswordResetPage onBack={() => setCurrentUserPage('login')} onSendEmail={(email) => { setResetEmail(email); setCurrentUserPage('one-time-password'); }} />}
        {currentUserPage === 'one-time-password' && <OneTimePasswordPage email={resetEmail} onBack={() => setCurrentUserPage('password-reset')} onConfirm={(otp) => { setResetOtp(otp); setCurrentUserPage('new-password'); }} />}
        {currentUserPage === 'new-password' && <NewPasswordPage email={resetEmail} otp={resetOtp} onComplete={() => { setLoginMessage('パスワードを更新しました。'); setCurrentUserPage('login'); }} />}

        {currentUserPage === 'member' && user && <MemberInfoPage onLogout={handleLogout} isAdmin={false} />}
        
        {/* バス予約フロー */}
        {currentUserPage === 'booking' && user && <UserBusBookingPage onShowRouteMap={() => setCurrentUserPage('route-map')} onShowBusResults={(data) => { setBusSearchData(data); setCurrentUserPage('bus-results'); }} />}
        {currentUserPage === 'bus-results' && user && busSearchData && <BusResultsPage searchData={busSearchData} onBack={() => setCurrentUserPage('booking')} onConfirm={(data) => { setBookingData(data); setCurrentUserPage('booking-confirm'); }} />}
        {currentUserPage === 'booking-confirm' && user && bookingData && <BookingConfirmPage bookingData={bookingData} onBack={() => setCurrentUserPage('bus-results')} onConfirm={() => setCurrentUserPage('booking-complete')} />}
        {currentUserPage === 'booking-complete' && user && <BookingCompletePage onComplete={() => setCurrentUserPage('home')} />}

        {currentUserPage === 'map' && <MapPage />}
        {currentUserPage === 'contact' && <ContactPage onBack={() => setCurrentUserPage('home')} isAdmin={false} />}
        {/* 会員ページ（user && を追加） */}
        {currentUserPage === 'member' && user && (
          <MemberInfoPage onLogout={handleLogout} isAdmin={false} />
        )}

        {/* バス予約（user && を追加し、GitHubの initialData も残す） */}
        {currentUserPage === 'booking' && user && (
          <UserBusBookingPage 
            initialData={busSearchData} 
            onShowRouteMap={() => setCurrentUserPage('route-map')}
            onShowBusResults={(data) => {
              setBusSearchData(data);
              setCurrentUserPage('bus-results');
            }}
          />
        )}
        {currentUserPage === 'route-map' && <RouteMapPage onBack={() => setCurrentUserPage('booking')} />}
        {currentUserPage === 'travel' && <TravelPlanPage onShowItinerary={() => setCurrentUserPage('itinerary')} />}
        {currentUserPage === 'itinerary' && <ItineraryPage />}
        {currentUserPage === 'sightseeing' && <SightseeingPage />}
      </main>
    </div>
  );
}