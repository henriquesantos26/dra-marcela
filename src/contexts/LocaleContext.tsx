import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, translations } from '@/lib/translations';
import { useGeolocation } from '@/hooks/useGeolocation';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  city: string;
  country: string;
  loading: boolean;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'pt',
  setLocale: () => {},
  city: '',
  country: '',
  loading: true,
});

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const { geoData, loading } = useGeolocation();
  const [locale, setLocale] = useState<Locale>('pt');
  const [geoApplied, setGeoApplied] = useState(false);

  useEffect(() => {
    if (!loading && !geoApplied) {
      setLocale(geoData.detectedLocale);
      setGeoApplied(true);
    }
  }, [loading, geoApplied, geoData.detectedLocale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, city: geoData.city, country: geoData.country, loading }}>
      {children}
    </LocaleContext.Provider>
  );
};
