import { SupabaseClient } from '@supabase/supabase-js';
import { ErrorType, ResponseType } from '../types';
import { useSupabase } from './useSupabase';
import { useCallback, useEffect, useState } from 'react';
import { logErrorAndSetState } from '../utilities/handleError';

export const useAuth = (): ResponseType => {
  const [errorState, setErrorState] = useState<ErrorType | null>(null);
  const useSupabaseResponse = useSupabase();

  useEffect(() => {
    logErrorAndSetState('useSupabase', useSupabaseResponse.error, setErrorState);
  }, [useSupabaseResponse.error]);

  const supabase: SupabaseClient | null = useSupabaseResponse.data?.supabase ?? null;

  const signInHandle = useCallback(
    async ({ userEmail, userPassword }: { userEmail: string; userPassword: string }): Promise<ResponseType> => {
      if (!supabase) {
        return { data: null, error: { message: 'Null Supabase Client', isFatal: true } };
      }
      if (!userEmail || !userPassword) {
        return { data: null, error: { message: 'Email or password is empty', isFatal: false } };
      }
      const response = await supabase.auth.signInWithPassword({ email: userEmail, password: userPassword });
      if (response.error) {
        return { data: null, error: { message: `Sign-in failed: ${response.error.message}`, isFatal: false } };
      }
      return { data: response.data, error: null };
    },
    [supabase],
  );

  const signUpHandle = useCallback(
    async ({
      userEmail,
      userPassword,
      userConfirmPassword,
      userMetadata,
    }: {
      userEmail: string;
      userPassword: string;
      userConfirmPassword?: string;
      userMetadata?: Record<string, boolean>;
    }): Promise<ResponseType> => {
      if (!supabase) {
        return { data: null, error: { message: 'Null Supabase Client', isFatal: true } };
      }
      if (!userEmail || !userPassword || !userConfirmPassword) {
        return { data: null, error: { message: 'Please fill in all fields', isFatal: false } };
      }
      if (userConfirmPassword !== userPassword) {
        return { data: null, error: { message: 'Passwords do not match', isFatal: false } };
      }
      const response = await supabase.auth.signUp({
        email: userEmail,
        password: userPassword,
        options: { data: userMetadata },
      });
      if (response.error) {
        return { data: null, error: { message: `Sign-up failed: ${response.error.message}`, isFatal: false } };
      }
      return { data: response.data, error: null };
    },
    [supabase],
  );

  const signOutHandle = useCallback(async (): Promise<ResponseType> => {
    if (!supabase) {
      return { data: null, error: { message: 'Null Supabase Client', isFatal: true } };
    }
    const response = await supabase.auth.signOut();
    if (response.error) {
      return { data: null, error: { message: `Sign-out failed: ${response.error.message}`, isFatal: false } };
    }
    return { data: { message: 'Signed out successfully' }, error: null };
  }, [supabase]);

  if (errorState) {
    return { data: null, error: errorState };
  }
  if (!supabase) {
    return { data: null, error: { message: 'Null Supabase Client', isFatal: true } };
  }

  return { data: { signInHandle, signUpHandle, signOutHandle }, error: null };
};

export default useAuth;
