import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResponseType } from '../types';
import { useEffect, useMemo } from 'react';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

export const useSupabase = (): ResponseType => {
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or Supabase Key is missing');
      return null;
    }
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventPerSeconds: 10,
        },
      },
    });
  }, []);

  useEffect(() => {
    if (!supabase || Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => subscription.remove();
  }, [supabase]);

  if (!supabase) {
    return {
      data: null,
      error: {
        message: 'Supabase client is null — check .env',
        isFatal: true,
      },
    };
  }

  return {
    data: { supabase },
    error: null,
  };
};
