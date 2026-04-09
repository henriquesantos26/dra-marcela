import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean | null;
  userRole: string | null;
  allowedPages: string[];
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: null,
  userRole: null,
  allowedPages: [],
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [allowedPages, setAllowedPages] = useState<string[]>([]);

  const fetchAccessInfo = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_info', {
        _user_id: userId,
      });

      if (error) {
        console.error('Error fetching role:', error);
        return { role: 'none', allowed_pages: [] };
      }
      
      const role = data?.role || 'none';
      const allowed_pages = data?.allowed_pages || [];

      return { role, allowed_pages };
    } catch (err) {
      console.error('Access info exception:', err);
      return { role: 'none', allowed_pages: [] };
    }
  };

  useEffect(() => {
    let isMounted = true;

    const handleAuthStateUpdate = async (session: Session | null) => {
      const currentUser = session?.user ?? null;
      if (isMounted) {
        setSession(session);
        setUser(currentUser);
      }

      if (currentUser) {
        if (isMounted) setIsAdmin(null);
        const accessInfo = await fetchAccessInfo(currentUser.id);
        if (isMounted) {
          const isUserAdmin = accessInfo.role === 'admin';
          setIsAdmin(isUserAdmin);
          setUserRole(accessInfo.role);
          setAllowedPages(isUserAdmin ? ['*'] : accessInfo.allowed_pages);
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setIsAdmin(false);
          setUserRole('none');
          setAllowedPages([]);
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      handleAuthStateUpdate(session);
    });

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        handleAuthStateUpdate(session);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, userRole, allowedPages, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
