import { useState, useEffect } from 'react';
import { Locale, COUNTRY_TO_LOCALE } from '@/lib/translations';

interface GeoData {
  city: string;
  country: string;
  countryCode: string;
  detectedLocale: Locale;
}

export const useGeolocation = () => {
  const [geoData, setGeoData] = useState<GeoData>({
    city: '',
    country: '',
    countryCode: '',
    detectedLocale: 'pt',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGeo = async () => {
      try {
        const res = await fetch('https://ip-api.com/json/?fields=city,country,countryCode');
        if (res.ok) {
          const data = await res.json();
          const locale = COUNTRY_TO_LOCALE[data.countryCode] || 'en';
          setGeoData({
            city: data.city || '',
            country: data.country || '',
            countryCode: data.countryCode || '',
            detectedLocale: locale,
          });
        }
      } catch {
        // Fallback to Portuguese
      } finally {
        setLoading(false);
      }
    };
    fetchGeo();
  }, []);

  return { geoData, loading };
};
