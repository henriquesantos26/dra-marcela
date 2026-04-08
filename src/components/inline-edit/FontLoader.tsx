import { useEffect } from 'react';

const GOOGLE_FONTS = [
  'Outfit',
  'Inter',
  'Poppins',
  'Montserrat',
  'Playfair Display',
  'Space Grotesk',
  'DM Sans',
  'Roboto',
  'Raleway',
  'Oswald',
];

export const FONT_OPTIONS = GOOGLE_FONTS.map(f => ({ label: f, value: f }));

const FontLoader = () => {
  useEffect(() => {
    const families = GOOGLE_FONTS.map(f => f.replace(/ /g, '+')).join('&family=');
    const href = `https://fonts.googleapis.com/css2?family=${families}:wght@300;400;500;600;700;800;900&display=swap`;

    if (document.querySelector(`link[href="${href}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }, []);

  return null;
};

export default FontLoader;
