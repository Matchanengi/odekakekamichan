import { useState } from 'react';
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

type MainPage = 'top' | 'reservations' | 'new-reservation' | 'notifications' | 'member' | 'contact';
type UserPage = 'home' | 'travel' | 'sightseeing' | 'booking' | 'login' | 'map' | 'contact' | 'member' | 'route-map' | 'itinerary' | 'register' | 'register-confirm' | 'password-reset' | 'one-time-password' | 'new-password' | 'bus-results' | 'booking-confirm' | 'booking-complete';
type UserType = 'guest' | 'user' | 'admin';

export default function App() {
  const [userType, setUserType] = useState<UserType>('guest');
  const [currentMainPage, setCurrentMainPage] = useState<MainPage>('top');
  const [currentUserPage, setCurrentUserPage] = useState<UserPage>('home');
  const [loginMessage, setLoginMessage] = useState<string>('');
  const [registerData, setRegisterData] = useState<{
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    googleLinked: boolean;
  } | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [busSearchData, setBusSearchData] = useState<{
    line: string;
    departure: string;
    arrival: string;
    tripType: '片道' | '往復';
    outboundDate: string;
    outboundTime: string;
    returnDate?: string;
    returnTime?: string;
    adults: number;
    children: number;
  } | null>(null);
  const [bookingData, setBookingData] = useState<{
    line?: string;
    departure: string;
    arrival: string;
    tripType: '片道' | '往復';
    date: string;
    time: string;
    departureTime?: string;
    arrivalTime?: string;
    returnDate?: string;
    returnTime?: string;
    returnDepartureTime?: string;
    returnArrivalTime?: string;
    adults: number;
    children: number;
  } | null>(null);

  const handleLoginAsUser = () => {
    setUserType('user');
    setCurrentUserPage('home');
    setLoginMessage('');
  };

  const handleLoginAsAdmin = () => {
    setUserType('admin');
    setCurrentMainPage('top');
    setLoginMessage('');
  };

  const handleLogout = () => {
    setUserType('guest');
    setCurrentUserPage('home');
  };

  // Guest/User view
  if (userType === 'guest' || userType === 'user') {
    return (
      <div>
        <UserHeader 
          currentPage={currentUserPage} 
          onPageChange={(page) => {
            if (page === 'login' && loginMessage) {
              // ログインページに遷移する際、既にメッセージがある場合はクリア
              setLoginMessage('');
            }
            setCurrentUserPage(page);
          }}
          isLoggedIn={userType === 'user'}
          onBusBookingRequireLogin={() => {
            setLoginMessage('バス予約は会員のみの機能です。ログインしてください。');
            setCurrentUserPage('login');
          }}
        />
        {currentUserPage === 'home' && <UserLandingPage onNavigate={setCurrentUserPage} />}
        {currentUserPage === 'login' && (
          <LoginPage 
            onLoginAsUser={handleLoginAsUser}
            onLoginAsAdmin={handleLoginAsAdmin}
            onShowRegister={() => setCurrentUserPage('register')}
            onShowPasswordReset={() => setCurrentUserPage('password-reset')}
            message={loginMessage}
          />
        )}
        {currentUserPage === 'map' && <MapPage />}
        {currentUserPage === 'contact' && <ContactPage onBack={() => setCurrentUserPage('home')} isAdmin={false} />}
        {currentUserPage === 'member' && <MemberInfoPage onLogout={handleLogout} isAdmin={false} />}
        {currentUserPage === 'booking' && (
          <UserBusBookingPage 
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
        {currentUserPage === 'register' && (
          <RegisterPage 
            onShowConfirm={(data) => {
              setRegisterData(data);
              setCurrentUserPage('register-confirm');
            }}
          />
        )}
        {currentUserPage === 'register-confirm' && registerData && (
          <RegisterConfirmPage 
            data={registerData}
            onConfirm={() => setCurrentUserPage('login')}
          />
        )}
        {currentUserPage === 'password-reset' && (
          <PasswordResetPage 
            onBack={() => setCurrentUserPage('login')}
            onSendEmail={(email) => {
              setResetEmail(email);
              setCurrentUserPage('one-time-password');
            }}
          />
        )}
        {currentUserPage === 'one-time-password' && (
          <OneTimePasswordPage 
            email={resetEmail}
            onBack={() => setCurrentUserPage('password-reset')}
            onConfirm={() => setCurrentUserPage('new-password')}
          />
        )}
        {currentUserPage === 'new-password' && (
          <NewPasswordPage 
            onComplete={() => setCurrentUserPage('login')}
          />
        )}
        {currentUserPage === 'booking-confirm' && bookingData && (
          <BookingConfirmPage 
            bookingData={bookingData}
            onBack={() => setCurrentUserPage('bus-results')}
            onConfirm={() => setCurrentUserPage('booking-complete')}
          />
        )}
        {currentUserPage === 'booking-complete' && (
          <BookingCompletePage 
            onComplete={() => setCurrentUserPage('home')}
          />
        )}
        {currentUserPage === 'bus-results' && busSearchData && (
          <BusResultsPage 
            searchData={busSearchData}
            onBack={() => setCurrentUserPage('booking')}
            onConfirm={(data) => {
              setBookingData(data);
              setCurrentUserPage('booking-confirm');
            }}
          />
        )}
      </div>
    );
  }

  // Admin view
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