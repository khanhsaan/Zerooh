import { SupabaseClient } from '@supabase/supabase-js';
import { ErrorType, Product, ResponseType } from '../types';
import { useCallback, useEffect, useState } from 'react';
import { logErrorAndSetState } from '../utilities/handleError';
import useAuthContext from './useAuthContext';

export const useProducts = (): ResponseType => {
  const [errorState, setErrorState] = useState<ErrorType | null>(null);
  const useAuthContextResponse = useAuthContext();
  const supabase: SupabaseClient | null = useAuthContextResponse.data?.supabase ?? null;

  useEffect(() => {
    logErrorAndSetState('useAuthContext', useAuthContextResponse.error, setErrorState);
  }, [useAuthContextResponse.error]);

  const getProducts = useCallback(async (): Promise<ResponseType> => {
    if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        category:product_categories(*),
        business:business_profiles!products_user_id_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: { message: `Error fetching products: ${error.message}`, isFatal: false } };
    if (!data || data.length === 0) return { data: [], error: null };

    const products: Product[] = data.map((p) => ({
      id: p.id,
      user_id: p.user_id,
      category_id: p.category_id,
      status_id: p.status_id,
      product_name: p.product_name,
      short_description: p.short_description,
      long_description: p.long_description,
      original_price_cents: p.original_price_cents,
      discounted_price_cents: p.discounted_price_cents,
      stock: p.stock,
      pickup_start: p.pickup_start,
      pickup_end: p.pickup_end,
      created_at: p.created_at,
      updated_at: p.updated_at,
      images: p.images ?? [],
      category: p.category ?? null,
      business: p.business ?? null,
    }));

    return { data: products, error: null };
  }, [supabase]);

  const getProductById = useCallback(
    async (productId: string): Promise<ResponseType> => {
      if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          category:product_categories(*),
          business:business_profiles!products_user_id_fkey(*)
        `)
        .eq('id', productId)
        .single();

      if (error) return { data: null, error: { message: `Error fetching product: ${error.message}`, isFatal: false } };
      return { data, error: null };
    },
    [supabase],
  );

  const createProduct = useCallback(
    async (product: Partial<Product>): Promise<ResponseType> => {
      if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };

      const { data, error } = await supabase.from('products').insert(product).select().single();

      if (error) return { data: null, error: { message: `Error creating product: ${error.message}`, isFatal: false } };
      return { data, error: null };
    },
    [supabase],
  );

  const updateProduct = useCallback(
    async (productId: string, updates: Partial<Product>): Promise<ResponseType> => {
      if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };

      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', productId)
        .select()
        .single();

      if (error) return { data: null, error: { message: `Error updating product: ${error.message}`, isFatal: false } };
      return { data, error: null };
    },
    [supabase],
  );

  const getBusinessProducts = useCallback(async (): Promise<ResponseType> => {
    if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: { message: 'Not authenticated', isFatal: false } };

    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*), category:product_categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: { message: `Error fetching business products: ${error.message}`, isFatal: false } };
    return { data: data ?? [], error: null };
  }, [supabase]);

  if (errorState) return { data: null, error: errorState };
  if (!supabase) return { data: null, error: { message: 'Null Supabase client', isFatal: true } };

  return { data: { getProducts, getProductById, createProduct, updateProduct, getBusinessProducts }, error: null };
};
