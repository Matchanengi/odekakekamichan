import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './components/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

const logger = {
  info: (msg: string, data?: any) => console.log(`%c 🔐 [Auth] ${msg}`, 'background: #3b82f6; color: white; padding: 2px 4px; border-radius: 4px;', data || ''),
  db: (msg: string, data?: any) => console.log(`%c 💾 [Database] ${msg}`, 'background: #10b981; color: white; padding: 2px 4px; border-radius: 4px;', data || ''),
  success: (msg: string) => console.log(`%c ✅ ${msg}`, 'color: #10b981; font-weight: bold;'),
  error: (msg: string, err?: any) => console.log(`%c ❌ [Error] ${msg}`, 'background: #ef4444; color: white; padding: 2px 4px; border-radius: 4px;', err || ''),
  warn: (msg: string) => console.log(`%c ⏳ [Timeout] ${msg}`, 'background: #f59e0b; color: white; padding: 2px 4px; border-radius: 4px;')
};

type UserRole = 'user' | 'admin' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, profile: null, role: null, loading: true, signOut: async () => { },
});

const INACTIVITY_LIMIT = 2 * 60 * 1000; // 5分　今は2分

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const syncProfileAndRole = async (currentUser: User) => {
    if (!currentUser.email) return;
    try {
      const { data: adminData } = await supabase.from('管理者').select('*').eq('email', currentUser.email).maybeSingle();
      if (adminData) {
        setProfile(adminData);
        setRole('admin');
        logger.success(`管理者として認証: ${adminData.name}`);
        return;
      }
      const { data: userData } = await supabase.from('ユーザ').select('*').eq('email', currentUser.email).maybeSingle();
      if (userData) {
        setProfile(userData);
        setRole('user');
        logger.success(`一般ユーザーとして認証: ${userData.name}`);
      } else {
        const newName = currentUser.user_metadata.full_name || currentUser.email.split('@')[0];
        const { data: created } = await supabase.from('ユーザ').insert({ name: newName, email: currentUser.email, password_hash: 'managed_by_auth' }).select().single();
        if (created) {
          setProfile(created);
          setRole('user');
          logger.success(`新規作成完了: ${created.name}`);
        }
      }
    } catch (err) {
      logger.error('同期失敗', err);
    }
  };

  const signOut = async () => {
    logger.info('ログアウト処理を実行...');
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
    setRole(null);
  };

  // --- ★ タイムアウト監視ロジック（強化版） ---
  useEffect(() => {
    // ログインしていない、またはロード中は何もしない
    if (!user || loading) return;

    let timerId: number | undefined;

    const resetTimer = () => {
      // 既存のタイマーをクリア
      if (timerId) window.clearTimeout(timerId);

      // 新しいタイマーをセット
      timerId = window.setTimeout(() => {
        // タイマー実行時にまだユーザーがログインしている場合のみ実行
        if (user) {
          logger.warn('無操作タイムアウト：ログアウトを実行します');
          alert('安全のため、一定時間操作がなかったためログアウトしました。');
          signOut();
        }
      }, INACTIVITY_LIMIT);
    };

    // 検知するイベントを増強
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click'
    ];

    // イベント登録
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // 初回タイマー開始
    resetTimer();

    // クリーンアップ（ここが重要：イベントとタイマーを確実に消す）
    return () => {
      if (timerId) window.clearTimeout(timerId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, loading]); // userが変わったとき、またはロード完了時に再セット

  // --- 初期化ロジック ---
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          const currentUser = session?.user ?? null;
          setSession(session);
          setUser(currentUser);
          setLoading(false);
          if (currentUser) syncProfileAndRole(currentUser);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      logger.info(`状態変化: ${event}`);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setSession(session);
      setLoading(false);
      if (!currentUser) {
        setProfile(null);
        setRole(null);
      } else {
        syncProfileAndRole(currentUser);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, signOut }}>
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="text-blue-900 font-bold tracking-widest">おでかけかみちゃん 起動中...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);