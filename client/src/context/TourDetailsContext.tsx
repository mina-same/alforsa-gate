import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tourService } from '../services/tourService';
import type { ITourFull } from '../services/tourService';

interface TourDetailsCtx {
  tour: ITourFull | null;
  loading: boolean;
  error: string | null;
  lang: string;
}

const TourDetailsContext = createContext<TourDetailsCtx>({
  tour: null,
  loading: true,
  error: null,
  lang: 'en',
});

export const TourDetailsProvider = ({ children }: { children: ReactNode }) => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  const [tour, setTour] = useState<ITourFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setError('No slug'); setLoading(false); return; }
    setLoading(true);
    setError(null);
    tourService
      .getBySlug(slug)
      .then((data) => { setTour(data); setLoading(false); })
      .catch(() => { setError('Tour not found'); setLoading(false); });
  }, [slug]);

  return (
    <TourDetailsContext.Provider value={{ tour, loading, error, lang }}>
      {children}
    </TourDetailsContext.Provider>
  );
};

export const useTourDetailsCtx = () => useContext(TourDetailsContext);
