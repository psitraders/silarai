import type { FontPairDef } from '../../core/types';

const font: FontPairDef = {
  id: 'classic-elegant',
  name: 'Classic Elegant',
  heading: { family: 'Playfair Display', fallback: 'serif' },
  body: { family: 'Inter', fallback: 'sans' },
  googleQuery: 'family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500;600;700',
  mood: 'Fashion, beauty',
};

export default font;
