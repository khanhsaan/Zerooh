import { Session, SupabaseClient } from '@supabase/supabase-js';
import { BusinessProfile, CustomerProfile, ErrorType, ResponseType } from '../types';
import { useCallback, useEffect, useState } from 'react';
import { logErrorAndSetState } from '../utilities/handleError';
import useAuthContext from './useAuthContext';

export const useProfile = (): ResponseType => {
  const [errorState, setErrorState] = useState<ErrorType | null>(null);

  const useAuthContextResponse: ResponseType = useAuthContext();
  const supabase: SupabaseClient | null = useAuthContextResponse.data?.supabase ?? null;
  const session: Session | null = useAuthContextResponse.data?.authSession ?? null;

  useEffect(() => {
    logErrorAndSetState('useAuthContext', useAuthContextResponse.error, setErrorState);
  }, [useAuthContextResponse.error]);

  const getUserFirstName = useCallback(async (): Promise<ResponseType> => {
    if (!session) return { data: null, error: { message: 'Null session', isFatal: true } };
    if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };
    const userId = session.user.id;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('first_name')
      .eq('user_id', userId)
      .single();
    if (error) return { data: null, error: { message: `Error fetching first name: ${error.message}`, isFatal: false } };
    return { data: data?.first_name ?? '', error: null };
  }, [supabase, session]);

  const getUserEmail = useCallback(async (): Promise<ResponseType> => {
    if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };
    const { data, error } = await supabase.auth.getUser();
    if (error) return { data: null, error: { message: `Error fetching user: ${error.message}`, isFatal: false } };
    return { data: data.user.email, error: null };
  }, [supabase]);

  const setUpCustomerProfile = useCallback(
    async (profile: CustomerProfile): Promise<ResponseType> => {
      if (!session) return { data: null, error: { message: 'Null session', isFatal: true } };
      if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };
      const { error } = await supabase
        .from('user_profiles')
        .update({ first_name: profile.firstName, last_name: profile.lastName })
        .eq('user_id', session.user.id);
      if (error) return { data: null, error: { message: `Error updating profile: ${error.message}`, isFatal: false } };
      return { data: { success: true }, error: null };
    },
    [supabase, session],
  );

  const setUpBusinessProfile = useCallback(
    async (profile: BusinessProfile): Promise<ResponseType> => {
      if (!session) return { data: null, error: { message: 'Null session', isFatal: true } };
      if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };
      const { error } = await supabase
        .from('business_profiles')
        .update({
          business_name: profile.businessName,
          phone: profile.phone,
          address: profile.address,
          suburb: profile.suburb,
          postcode: profile.postcode,
        })
        .eq('user_id', session.user.id);
      if (error) return { data: null, error: { message: `Error updating business profile: ${error.message}`, isFatal: false } };
      return { data: { success: true }, error: null };
    },
    [supabase, session],
  );

  if (errorState) return { data: null, error: errorState };
  if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };

  return {
    data: { getUserFirstName, getUserEmail, setUpCustomerProfile, setUpBusinessProfile },
    error: null,
  };
};
