import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import de from './locales/de.json';
import tr from './locales/tr.json';
import id from './locales/id.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import zh from './locales/zh.json';

const LANG_KEY = 'Silarai_lang';
const savedLang = localStorage.getItem(LANG_KEY) ?? 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ar: { translation: ar },
      es: { translation: es },
      fr: { translation: fr },
      pt: { translation: pt },
      de: { translation: de },
      tr: { translation: tr },
      id: { translation: id },
      bn: { translation: bn },
      ta: { translation: ta },
      zh: { translation: zh },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

/** Persist the chosen language. RTL is intentionally NOT applied — layout is LTR-only. */
export function setAppLanguage(lang: string) {
  i18n.changeLanguage(lang);
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
}

// Apply lang attribute on initial load (dir stays 'ltr')
document.documentElement.lang = savedLang;

export default i18n;

