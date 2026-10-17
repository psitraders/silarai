import type { FontPairDef } from '../../core/types';

const font: FontPairDef = {
  id: 'luxury-serif',
  name: 'Luxury Serif',
  heading: { family: 'Cormorant', fallback: 'serif' },
  body: { family: 'Montserrat', fallback: 'sans' },
  googleQuery: 'family=Cormorant:wght@500;600;700&family=Montserrat:wght@400;500;600;700',
  mood: 'Jewellery, premium',
};

export default font;
