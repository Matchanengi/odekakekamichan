import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './components/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

/**
 * カスタムロガー
 * 認証の状態やデータベースの同期状況をコンソールに色付きで出力します。
 */
const logger = {
  info: (msg: string, data?: any) => console.log(`%c 🔐 [Auth] ${msg}`, 'background: #3b82f6; color: white; padding: 2px 4px; border-radius: 4px;', data || ''),
  db: (msg: string, data?: any) => console.log(`%c 💾 [Database] ${msg}`, 'background: #10b981; color: white; padding: 2px 4px; border-radius: 4px;', data || ''),
  success: (msg: string) => console.log(`%c ✅ ${msg}`, 'color: #10b981; font-weight: bold;'),
  error: (msg: string, err?: any) => console.log(`%c ❌ [Error] ${msg}`, 'background: #ef4444; color: white; padding: 2px 4px; border-radius: 4px;', err || ''),
  warn: (msg: string) => console.log(`%c ⏳ [Timeout] ${msg}`, 'background: #f59e0b; color: white; padding: 2px 4px; border-radius: 4px;')
};

// ユーザーの役割（管理者、一般ユーザー、または未設定）
type UserRole = 'user' | 'admin' | null;

/**
 * Contextで共有するデータの型定義
 */
interface AuthContextType {
  user: User | null;      // Supabaseの認証ユーザー情報
  session: Session | null; // 現在のセッション
  profile: any | null;     // DB（管理者/ユーザテーブル）から取得した詳細プロフィール
  role: UserRole;          // ユーザーの役割
  loading: boolean;        // 初期化中フラグ
  signOut: () => Promise<void>; // ログアウト関数
}

// コンテキストの初期化
const AuthContext = createContext<AuthContextType>({
  user: null, session: null, profile: null, role: null, loading: true, signOut: async () => { },
});

// 無操作タイムアウトの時間設定（2分）
const INACTIVITY_LIMIT = 2 * 60 * 1000; 

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Supabase Authのユーザー情報を元に、DB内の管理者/ユーザテーブルと同期する関数
   */
  const syncProfileAndRole = async (currentUser: User) => {
    if (!currentUser.email) return;
    try {
      // 1. まず「管理者」テーブルを検索
      const { data: adminData } = await supabase.from('管理者').select('*').eq('email', currentUser.email).maybeSingle();
      if (adminData) {
        setProfile(adminData);
        setRole('admin');
        logger.success(`管理者として認証: ${adminData.name}`);
        return;
      }

      // 2. 次に「ユーザ」テーブルを検索
      const { data: userData } = await supabase.from('ユーザ').select('*').eq('email', currentUser.email).maybeSingle();
      if (userData) {
        setProfile(userData);
        setRole('user');
        logger.success(`一般ユーザーとして認証: ${userData.name}`);
      } else {
        // 3. どちらにも存在しない場合は新規ユーザーとして「ユーザ」テーブルに登録
        const newName = currentUser.user_metadata.full_name || currentUser.email.split('@')[0];
        const { data: created } = await supabase.from('ユーザ').insert({ 
          name: newName, 
          email: currentUser.email, 
          password_hash: 'managed_by_auth' 
        }).select().single();

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

  /**
   * ログアウト処理
   */
  const signOut = async () => {
    logger.info('ログアウト処理を実行...');
    await supabase.auth.signOut();
    // 各種状態をリセット
    setProfile(null);
    setUser(null);
    setSession(null);
    setRole(null);
  };

  /**
   * タイムアウト監視ロジック
   * ユーザーが操作を行わない場合に自動的にログアウトさせます。
   */
  useEffect(() => {
    // 未ログインまたはロード中は監視しない
    if (!user || loading) return;

    let timerId: number | undefined;

    // タイマーをリセットし、再カウントを開始する関数
    const resetTimer = () => {
      if (timerId) window.clearTimeout(timerId);

      timerId = window.setTimeout(() => {
        if (user) {
          logger.warn('無操作タイムアウト：ログアウトを実行します');
          alert('安全のため、一定時間操作がなかったためログアウトしました。');
          signOut();
        }
      }, INACTIVITY_LIMIT);
    };

    // 操作を検知するイベント一覧
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click'
    ];

    // 各イベントにリスナーを登録
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // 初期タイマー起動
    resetTimer();

    // クリーンアップ処理：コンポーネントが消える時や再実行時に古いタイマーやリスナーを削除
    return () => {
      if (timerId) window.clearTimeout(timerId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, loading]); // ユーザーの状態が変わるたびに監視を再設定

  /**
   * 初期化ロジック
   * アプリ起動時のセッション確認および状態変化の監視を行います。
   */
  useEffect(() => {
    let mounted = true;

    // 起動時に現在のセッション（ログイン状態）を取得
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

    // ログイン・ログアウトなどの認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      logger.info(`状態変化: ${event}`);
      const currentUser = session?.user ?? null;
      
      setUser(currentUser);
      setSession(session);
      setLoading(false);

      if (!currentUser) {
        // ログアウト時
        setProfile(null);
        setRole(null);
      } else {
        // ログイン時またはセッション更新時
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
      {/* ロード中（初期チェック中）はスプラッシュ画面を表示 */}
      {!loading ? children : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          <p className="text-blue-900 font-bold tracking-widest">おでかけかみちゃん 起動中...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};

/**
 * 認証情報を利用するためのカスタムフック
 */
export const useAuth = () => useContext(AuthContext);