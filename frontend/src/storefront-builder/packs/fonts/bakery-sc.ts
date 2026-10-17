import type { FontPairDef } from '../../core/types';

const font: FontPairDef = {
  id: 'bakery-sc',
  name: 'Bakery',
  heading: { family: 'Playfair Display SC', fallback: 'serif' },
  body: { family: 'Karla', fallback: 'sans' },
  googleQuery: 'family=Playfair+Display+SC:wght@400;700&family=Karla:wght@400;500;600;700',
  mood: 'Bakery, café',
};

export default font;
