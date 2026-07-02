import { useState, useEffect } from 'react';
import { destinationService } from '../services/destinationService';
import type { IDestination } from '../services/destinationService';

interface UseDestinationResult {
  destination: IDestination | null;
  loading: boolean;
  error: string | null;
}

export function useDestination(slug: string): UseDestinationResult {
  const [destination, setDestination] = useState<IDestination | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    destinationService
      .getBySlug(slug)
      .then((data) => {
        if (!cancelled) setDestination(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load destination');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  return { destination, loading, error };
}
