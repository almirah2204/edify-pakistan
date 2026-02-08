import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_approved: boolean;
  avatar_url?: string;
  phone?: string;
  language_pref: 'en' | 'ur';
  created_at: string;
  school_id?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  profileLoaded: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: UserRole }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Fetch profile - use maybeSingle to avoid error when no rows
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      if (!profileData) {
        console.log('No profile found for user:', userId);
        return null;
      }

      // Fetch role from user_roles table - use maybeSingle
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return null;
      }

      if (!roleData) {
        console.log('No role found for user:', userId);
        return null;
      }

      return {
        id: profileData.id,
        email: profileData.email || '',
        full_name: profileData.full_name,
        role: roleData.role as UserRole,
        is_approved: profileData.is_approved || false,
        avatar_url: profileData.avatar_url,
        phone: profileData.phone,
        language_pref: (profileData.language_pref as 'en' | 'ur') || 'en',
        created_at: profileData.created_at,
        school_id: profileData.school_id || undefined,
      };
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const fetchProfileWithRetry = async (
    userId: string,
    opts: { retries?: number; delayMs?: number } = {}
  ): Promise<UserProfile | null> => {
    const retries = opts.retries ?? 8;
    const delayMs = opts.delayMs ?? 250;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const p = await fetchProfile(userId);
      if (p) return p;
      if (attempt < retries) await sleep(delayMs);
    }

    return null;
  };

  const refreshProfile = async () => {
    if (user) {
      setProfileLoaded(false);
      const profileData = await fetchProfileWithRetry(user.id);
      setProfile(profileData);
      setProfileLoaded(true);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setProfileLoaded(false);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setIsLoading(true);
          setProfileLoaded(false);
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfileWithRetry(session.user.id).then((p) => {
              setProfile(p);
              setProfileLoaded(true);
              setIsLoading(false);
            });
          }, 0);
        } else {
          setProfile(null);
          setProfileLoaded(true);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setIsLoading(true);
        setProfileLoaded(false);
        fetchProfileWithRetry(session.user.id).then((p) => {
          setProfile(p);
          setProfileLoaded(true);
          setIsLoading(false);
        });
      } else {
        setProfile(null);
        setProfileLoaded(true);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null; role?: UserRole }> => {
    setIsLoading(true);
    setProfileLoaded(false);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
      setProfileLoaded(true);
      return { error };
    }

    if (data.user) {
      console.log('Login success, fetching profile for user:', data.user.id);
      const profileData = await fetchProfileWithRetry(data.user.id);
      
      if (profileData) {
        console.log('Profile fetched, role:', profileData.role);
        setProfile(profileData);
        setProfileLoaded(true);
        setIsLoading(false);
        return { error: null, role: profileData.role };
      } else {
        console.error('Failed to fetch profile after login');
        setProfileLoaded(true);
        setIsLoading(false);
        return { error: new Error('Failed to fetch user profile') };
      }
    }

    setProfileLoaded(true);
    setIsLoading(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    setIsLoading(true);
    setProfileLoaded(false);
    const redirectUrl = `${window.location.origin}/`;
    
    // Sign up the user - the database trigger will create profile and role
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      setProfileLoaded(true);
      return { error };
    }

    // Wait briefly for the trigger to complete, then fetch profile with retry
    if (data.user) {
      await sleep(300);
      const profileData = await fetchProfileWithRetry(data.user.id, { retries: 12, delayMs: 300 });
      setProfile(profileData);
    }

    setProfileLoaded(true);
    setIsLoading(false);
    
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileLoaded(true);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name,
        phone: updates.phone,
        avatar_url: updates.avatar_url,
        language_pref: updates.language_pref,
      })
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
    }
    
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      profileLoaded,
      isLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
