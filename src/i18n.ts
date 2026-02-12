import i18n, { type PostProcessorModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useLanguageStore } from './stores/languageStore';
import { preventWidows } from './utils/text';

// Polish translations
import plCommon from './locales/pl/common.json';
import plAuth from './locales/pl/auth.json';
import plErrors from './locales/pl/errors.json';
import plProfile from './locales/pl/profile.json';
import plNotifications from './locales/pl/notifications.json';
import plSearch from './locales/pl/search.json';
import plCookies from './locales/pl/cookies.json';
import plActions from './locales/pl/actions.json';
import plAi from './locales/pl/ai.json';
import plSejm from './locales/pl/sejm.json';
import plGielda from './locales/pl/gielda.json';
import plDashboard from './locales/pl/dashboard.json';
import plBrief from './locales/pl/brief.json';
import plEvent from './locales/pl/event.json';
import plDane from './locales/pl/dane.json';
import plGraf from './locales/pl/graf.json';
import plInfo from './locales/pl/info.json';
import plNewsletter from './locales/pl/newsletter.json';
import plPrivacy from './locales/pl/privacy.json';
import plContact from './locales/pl/contact.json';
import plTerminal from './locales/pl/terminal.json';
import plPowiazania from './locales/pl/powiazania.json';

// English translations
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enErrors from './locales/en/errors.json';
import enProfile from './locales/en/profile.json';
import enNotifications from './locales/en/notifications.json';
import enSearch from './locales/en/search.json';
import enCookies from './locales/en/cookies.json';
import enActions from './locales/en/actions.json';
import enAi from './locales/en/ai.json';
import enSejm from './locales/en/sejm.json';
import enGielda from './locales/en/gielda.json';
import enDashboard from './locales/en/dashboard.json';
import enBrief from './locales/en/brief.json';
import enEvent from './locales/en/event.json';
import enDane from './locales/en/dane.json';
import enGraf from './locales/en/graf.json';
import enInfo from './locales/en/info.json';
import enNewsletter from './locales/en/newsletter.json';
import enPrivacy from './locales/en/privacy.json';
import enContact from './locales/en/contact.json';
import enTerminal from './locales/en/terminal.json';
import enPowiazania from './locales/en/powiazania.json';

// German translations
import deCommon from './locales/de/common.json';
import deAuth from './locales/de/auth.json';
import deErrors from './locales/de/errors.json';
import deProfile from './locales/de/profile.json';
import deNotifications from './locales/de/notifications.json';
import deSearch from './locales/de/search.json';
import deCookies from './locales/de/cookies.json';
import deActions from './locales/de/actions.json';
import deAi from './locales/de/ai.json';
import deSejm from './locales/de/sejm.json';
import deGielda from './locales/de/gielda.json';
import deDashboard from './locales/de/dashboard.json';
import deBrief from './locales/de/brief.json';
import deEvent from './locales/de/event.json';
import deDane from './locales/de/dane.json';
import deGraf from './locales/de/graf.json';
import deInfo from './locales/de/info.json';
import deNewsletter from './locales/de/newsletter.json';
import dePrivacy from './locales/de/privacy.json';
import deContact from './locales/de/contact.json';
import deTerminal from './locales/de/terminal.json';
import dePowiazania from './locales/de/powiazania.json';

const resources = {
  pl: {
    common: plCommon,
    auth: plAuth,
    errors: plErrors,
    profile: plProfile,
    notifications: plNotifications,
    search: plSearch,
    cookies: plCookies,
    actions: plActions,
    ai: plAi,
    sejm: plSejm,
    gielda: plGielda,
    dashboard: plDashboard,
    brief: plBrief,
    event: plEvent,
    dane: plDane,
    graf: plGraf,
    info: plInfo,
    newsletter: plNewsletter,
    privacy: plPrivacy,
    contact: plContact,
    terminal: plTerminal,
    powiazania: plPowiazania,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    errors: enErrors,
    profile: enProfile,
    notifications: enNotifications,
    search: enSearch,
    cookies: enCookies,
    actions: enActions,
    ai: enAi,
    sejm: enSejm,
    gielda: enGielda,
    dashboard: enDashboard,
    brief: enBrief,
    event: enEvent,
    dane: enDane,
    graf: enGraf,
    info: enInfo,
    newsletter: enNewsletter,
    privacy: enPrivacy,
    contact: enContact,
    terminal: enTerminal,
    powiazania: enPowiazania,
  },
  de: {
    common: deCommon,
    auth: deAuth,
    errors: deErrors,
    profile: deProfile,
    notifications: deNotifications,
    search: deSearch,
    cookies: deCookies,
    actions: deActions,
    ai: deAi,
    sejm: deSejm,
    gielda: deGielda,
    dashboard: deDashboard,
    brief: deBrief,
    event: deEvent,
    dane: deDane,
    graf: deGraf,
    info: deInfo,
    newsletter: deNewsletter,
    privacy: dePrivacy,
    contact: deContact,
    terminal: deTerminal,
    powiazania: dePowiazania,
  },
};

const preventWidowsPostProcessor: PostProcessorModule = {
  type: 'postProcessor',
  name: 'preventWidows',
  process(value: string) {
    return preventWidows(value);
  },
};

i18n
  .use(initReactI18next)
  .use(preventWidowsPostProcessor)
  .init({
    resources,
    lng: useLanguageStore.getState().language,
    fallbackLng: 'pl',
    defaultNS: 'common',
    postProcess: ['preventWidows'],
    interpolation: {
      escapeValue: false,
    },
  });

// Sync with languageStore
useLanguageStore.subscribe((state) => {
  i18n.changeLanguage(state.language);
});

export default i18n;
