"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';

interface SessionContextType {
  session: Session | null;
  supabase: SupabaseClient;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setSession(currentSession);
        if (currentSession && location.pathname === '/login') {
          navigate('/'); // Redirect to dashboard if already logged in and on login page
          showSuccess('Vous êtes connecté !');
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        if (location.pathname !== '/login') {
          navigate('/login'); // Redirect to login if signed out and not already on login page
          showSuccess('Vous avez été déconnecté.');
        }
      } else if (event === 'USER_UPDATED') {
        setSession(currentSession);
        showSuccess('Votre profil a été mis à jour.');
      } else if (event === 'PASSWORD_RECOVERY') {
        showSuccess('Veuillez vérifier votre e-mail pour réinitialiser votre mot de passe.');
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
      }
      setLoading(false);
    });

    // Initial check for session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setLoading(false);
      if (initialSession && location.pathname === '/login') {
        navigate('/');
      } else if (!initialSession && location.pathname !== '/login') {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <SessionContext.Provider value={{ session, supabase, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-300">Chargement de la session...</p>
      </div>
    );
  }

  return <>{children}</>;
};