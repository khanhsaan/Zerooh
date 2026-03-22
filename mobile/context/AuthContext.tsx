import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { AuthContextObject, ErrorType, ResponseType } from '../types';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { useSupabase } from '../hooks/useSupabase';
import { displayError, logErrorAndSetState } from '../utilities/handleError';
import { restartAppMessage, signOutMessage } from '../constants/errorMessages';

export const AuthContext = createContext<AuthContextObject | undefined>(undefined);

/**
 * AuthContextProvider
 *
 * Root-level context provider that manages the Supabase session globally.
 * - Initialises the session on mount via `getSession()`.
 * - Subscribes to `onAuthStateChange` so all consumers re-render on login/logout.
 * - On fatal error (missing env, bad client) displays a "restart app" Alert.
 * - On non-fatal error displays a "sign out" Alert with a recovery action.
 *
 * Exposes via `AuthContext`:
 *   `{ supabase, authSession, authError, authLoading }`
 */
export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionState, setSessionState] = useState<Session | null>(null);
  const [errorState, setErrorState] = useState<ErrorType | null>(null);
  const [loadingState, setLoadingState] = useState<boolean>(true);

  const useSupabaseResponse: ResponseType = useSupabase();
  const supabase: SupabaseClient | null = useSupabaseResponse.data?.supabase ?? null;

  useEffect(() => {
    if (!errorState) return;
    if (errorState.isFatal || !supabase) {
      displayError(restartAppMessage, true);
    } else {
      displayError(signOutMessage, false, [
        {
          text: 'Sign out',
          onPress: () => {
            supabase.auth.signOut();
          },
        },
      ]);
    }
  }, [errorState, supabase]);

  useEffect(() => {
    if (!supabase) return;
    setLoadingState(true);
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSessionState(data.session);
        setErrorState(null);
      })
      .catch((error) => {
        setErrorState({
          message: `Failed to fetch Supabase session: ${error.message}`,
          isFatal: true,
        });
      })
      .finally(() => setLoadingState(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionState(session);
      setErrorState(null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    logErrorAndSetState('useSupabase', useSupabaseResponse.error, setErrorState);
  }, [useSupabaseResponse.error]);

  const values: AuthContextObject = {
    supabase,
    authSession: sessionState,
    authError: errorState,
    authLoading: loadingState,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
