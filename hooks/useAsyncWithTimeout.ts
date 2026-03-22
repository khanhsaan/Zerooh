import { useState, useCallback } from 'react';
import { ErrorType, ResponseType } from '../types';

interface AsyncState<T> {
  data: T | null;
  error: ErrorType | null;
  loading: boolean;
}

/**
 * useAsyncWithTimeout
 *
 * A generic hook that wraps an async function with optional timeout support.
 * Manages `loading`, `data`, and `error` state, following the ResponseType pattern.
 *
 * @param asyncFn - The async function to execute. Must return a `Promise<ResponseType>`.
 * @param timeoutMs - Optional timeout in milliseconds. Defaults to 10 000 ms.
 * @param isFatal - Whether a timeout error should be flagged as fatal. Defaults to false.
 *
 * @returns `{ data, error, loading, execute }` where `execute()` triggers the async call.
 *
 * Usage:
 *   const { data, error, loading, execute } = useAsyncWithTimeout(getProducts, 8000, false);
 *   useEffect(() => { execute(); }, [execute]);
 */
export function useAsyncWithTimeout<T = any>(
  asyncFn: () => Promise<ResponseType>,
  timeoutMs: number = 10_000,
  isFatal: boolean = false,
): AsyncState<T> & { execute: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true });

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise: Promise<ResponseType> = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([asyncFn(), timeoutPromise]);

      if (timeoutId) clearTimeout(timeoutId);

      if (result.error) {
        setState({ data: null, error: result.error, loading: false });
      } else {
        setState({ data: result.data as T, error: null, loading: false });
      }
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      setState({
        data: null,
        error: { message: err.message ?? 'Unknown error', isFatal },
        loading: false,
      });
    }
  }, [asyncFn, timeoutMs, isFatal]);

  return { ...state, execute };
}
