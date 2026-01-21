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
  const { user, role, profile, signOut, loading: authLoading } = useAuth();

  const isAdmin = role === 'admin';

  const [currentMainPage, setCurrentMainPage] = useState<MainPage>('top');
  const [currentUserPage, setCurrentUserPage] = useState<UserPage>('home');
  const [loginMessage, setLoginMessage] = useState<string>('');
  const [registerData, setRegisterData] = useState<any>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [busSearchData, setBusSearchData] = useState<any>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [mapSpots, setMapSpots] = useState<any[]>([]);

  // セキュリティ監視
  useEffect(() => {
    const protectedPages: UserPage[] = ['member', 'booking', 'bus-results', 'booking-confirm', 'booking-complete'];
    if (!user && protectedPages.includes(currentUserPage)) {
      setCurrentUserPage('home');
    }
  }, [user, currentUserPage]);

  const handleLoginAsUser = () => {
    setCurrentUserPage('home');
    setLoginMessage('');
  };

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

  // --- 管理者ビュー ---
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
            onLoginAsUser={handleLoginAsUser}
            onShowRegister={() => setCurrentUserPage('register')}
            onShowPasswordReset={() => setCurrentUserPage('password-reset')}
            message={loginMessage}
          />
        )}

        {/* 登録・パスワードリセット */}
        {currentUserPage === 'register' && (
          <RegisterPage initialData={registerData} onShowConfirm={(data: any) => { setRegisterData(data); setCurrentUserPage('register-confirm'); }} />
        )}
        {currentUserPage === 'register-confirm' && registerData && (
          <RegisterConfirmPage data={registerData} onBack={() => setCurrentUserPage('register')} onConfirm={() => { setLoginMessage('登録完了！ログインしてください。'); setCurrentUserPage('login'); setRegisterData(null); }} />
        )}
        {currentUserPage === 'password-reset' && <PasswordResetPage onBack={() => setCurrentUserPage('login')} onSendEmail={(email) => { setResetEmail(email); setCurrentUserPage('one-time-password'); }} />}
        {currentUserPage === 'one-time-password' && <OneTimePasswordPage email={resetEmail} onBack={() => setCurrentUserPage('password-reset')} onConfirm={(otp) => { setResetOtp(otp); setCurrentUserPage('new-password'); }} />}
        {currentUserPage === 'new-password' && <NewPasswordPage email={resetEmail} otp={resetOtp} onComplete={() => { setLoginMessage('パスワードを更新しました。'); setCurrentUserPage('login'); }} />}

        {/* ★会員ページ：重複を削除し一本化 */}
        {currentUserPage === 'member' && user && (
          <MemberInfoPage onLogout={handleLogout} isAdmin={false} />
        )}

        {/* ★バス予約：GitHub側の initialData 保持機能も統合して一本化 */}
        {currentUserPage === 'booking' && user && (
          <UserBusBookingPage
            initialData={busSearchData}
            onShowRouteMap={() => setCurrentUserPage('route-map')}
            onShowBusResults={(data) => { setBusSearchData(data); setCurrentUserPage('bus-results'); }}
          />
        )}

        {/* 予約確認フロー */}
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
            userId={profile?.user_id || profile?.id} //profile から ID を渡す
            bookingData={bookingData}
            onBack={() => setCurrentUserPage('bus-results')}
            onConfirm={() => {
              setBookingData(null);
              setBusSearchData(null);
              setCurrentUserPage('booking-complete');
            }}
          />
        )}
        {currentUserPage === 'booking-complete' && user && <BookingCompletePage onComplete={() => setCurrentUserPage('home')} />}

        {/* 公開ページ */}
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