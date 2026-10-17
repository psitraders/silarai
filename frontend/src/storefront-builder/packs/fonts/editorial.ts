import type { FontPairDef } from '../../core/types';

const font: FontPairDef = {
  id: 'editorial',
  name: 'Editorial',
  heading: { family: 'Cormorant', fallback: 'serif' },
  body: { family: 'Inter', fallback: 'sans' },
  googleQuery: 'family=Cormorant:wght@500;600;700&family=Inter:wght@400;500;600;700',
  mood: 'Lookbooks, editorial',
};

export default font;
