import { Session, SupabaseClient } from '@supabase/supabase-js';
import { ErrorType, Order, OrderStatus, ResponseType } from '../types';
import useAuthContext from './useAuthContext';
import { useCallback, useEffect, useState } from 'react';
import { logErrorAndSetState } from '../utilities/handleError';

/**
 * useOrders
 *
 * Exposes order-related operations for the current authenticated user.
 *
 * Returned via `data`:
 *   - `getOrders()` — fetches all orders for the current user (joined with product + images).
 *   - `createOrder(productId, quantity, totalPriceCents, pickupTime?)` — inserts a new order row.
 *   - `updateOrderStatus(orderId, status)` — updates order status (business-side).
 *
 * Error severity:
 *   - `isFatal: true` for null client or missing session.
 *   - `isFatal: false` for Supabase query failures.
 */
export const useOrders = (): ResponseType => {
  const [errorState, setErrorState] = useState<ErrorType | null>(null);
  const useAuthContextResponse = useAuthContext();
  const supabase: SupabaseClient | null = useAuthContextResponse.data?.supabase ?? null;
  const session: Session | null = useAuthContextResponse.data?.authSession ?? null;
  const userId: string | null = session?.user?.id ?? null;

  useEffect(() => {
    logErrorAndSetState('useAuthContext', useAuthContextResponse.error, setErrorState);
  }, [useAuthContextResponse.error]);

  const getOrders = useCallback(async (): Promise<ResponseType> => {
    if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };
    if (!userId) return { data: null, error: { message: 'Not authenticated', isFatal: true } };

    const { data, error } = await supabase
      .from('orders')
      .select('*, product:products(*, images:product_images(*), business:business_profiles(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: { message: `Error fetching orders: ${error.message}`, isFatal: false } };
    return { data: (data as Order[]) ?? [], error: null };
  }, [supabase, userId]);

  const createOrder = useCallback(
    async (
      productId: string,
      quantity: number,
      totalPriceCents: number,
      pickupTime?: string,
    ): Promise<ResponseType> => {
      if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };
      if (!userId) return { data: null, error: { message: 'Not authenticated', isFatal: true } };

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          total_price_cents: totalPriceCents,
          status: 'pending',
          pickup_time: pickupTime ?? null,
        })
        .select()
        .single();

      if (error) return { data: null, error: { message: `Error creating order: ${error.message}`, isFatal: false } };
      return { data, error: null };
    },
    [supabase, userId],
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus): Promise<ResponseType> => {
      if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };

      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

      if (error) return { data: null, error: { message: `Error updating order: ${error.message}`, isFatal: false } };
      return { data, error: null };
    },
    [supabase],
  );

  if (errorState) return { data: null, error: errorState };
  if (!supabase || !session) return { data: null, error: { message: 'Not authenticated', isFatal: true } };

  return { data: { getOrders, createOrder, updateOrderStatus }, error: null };
};
