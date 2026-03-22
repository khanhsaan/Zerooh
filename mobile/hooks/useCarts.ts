import { Session, SupabaseClient } from '@supabase/supabase-js';
import { CartItem, ErrorType, ResponseType } from '../types';
import useAuthContext from './useAuthContext';
import { useCallback, useEffect, useState } from 'react';
import { logErrorAndSetState } from '../utilities/handleError';

export const useCarts = (): ResponseType => {
  const [errorState, setErrorState] = useState<ErrorType | null>(null);
  const useAuthContextResponse = useAuthContext();
  const supabase: SupabaseClient | null = useAuthContextResponse.data?.supabase ?? null;
  const session: Session | null = useAuthContextResponse.data?.authSession ?? null;
  const userId: string | null = session?.user?.id ?? null;

  useEffect(() => {
    logErrorAndSetState('useAuthContext', useAuthContextResponse.error, setErrorState);
  }, [useAuthContextResponse.error]);

  const getAllItems = useCallback(async (): Promise<ResponseType> => {
    if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };
    if (!userId) return { data: null, error: { message: 'Not authenticated', isFatal: true } };

    const { data, error } = await supabase
      .from('carts')
      .select('*, product:products(*, images:product_images(*), business:business_profiles(*))')
      .eq('user_id', userId);

    if (error) return { data: null, error: { message: `Error fetching cart: ${error.message}`, isFatal: false } };
    return { data: (data as CartItem[]) ?? [], error: null };
  }, [supabase, userId]);

  const addItem = useCallback(
    async (productId: string, quantity: number = 1): Promise<ResponseType> => {
      if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };
      if (!userId) return { data: null, error: { message: 'Not authenticated', isFatal: true } };

      // Check if item already in cart
      const { data: existing } = await supabase
        .from('carts')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('carts')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) return { data: null, error: { message: `Error updating cart: ${error.message}`, isFatal: false } };
        return { data, error: null };
      }

      const { data, error } = await supabase
        .from('carts')
        .insert({ user_id: userId, product_id: productId, quantity })
        .select()
        .single();

      if (error) return { data: null, error: { message: `Error adding to cart: ${error.message}`, isFatal: false } };
      return { data, error: null };
    },
    [supabase, userId],
  );

  const removeItem = useCallback(
    async (cartItemId: string): Promise<ResponseType> => {
      if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };

      const { error } = await supabase.from('carts').delete().eq('id', cartItemId);
      if (error) return { data: null, error: { message: `Error removing item: ${error.message}`, isFatal: false } };
      return { data: { success: true }, error: null };
    },
    [supabase],
  );

  const clearCart = useCallback(async (): Promise<ResponseType> => {
    if (!supabase || !userId) return { data: null, error: { message: 'Missing client or user', isFatal: true } };

    const { error } = await supabase.from('carts').delete().eq('user_id', userId);
    if (error) return { data: null, error: { message: `Error clearing cart: ${error.message}`, isFatal: false } };
    return { data: { success: true }, error: null };
  }, [supabase, userId]);

  if (errorState) return { data: null, error: errorState };
  if (!supabase || !session) return { data: null, error: { message: 'Not authenticated', isFatal: true } };

  return { data: { getAllItems, addItem, removeItem, clearCart }, error: null };
};
