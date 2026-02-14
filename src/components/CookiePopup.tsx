import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCookieConsentStore } from '@/stores/cookieConsentStore';
import { useLanguage, useLanguageStore, type Language } from '@/stores/languageStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { trackOnboardingSkipped } from '@/lib/analytics';
import { LocalizedLink } from './LocalizedLink';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

const WELCOME_FEATURES = [
  { icon: 'ri-robot-2-line', key: 'ai' },
  { icon: 'ri-layout-grid-line', key: 'categories' },
  { icon: 'ri-bar-chart-box-line', key: 'data' },
] as const;

export function CookiePopup() {
  const { t } = useTranslation('cookies');
  const { t: tOnboarding } = useTranslation('onboarding');
  const { hasInteracted, acceptAll, rejectOptional, loadFromStorage } = useCookieConsentStore();
  const language = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageChange = (newLang: Language) => {
    useLanguageStore.getState().setLanguage(newLang);
    const currentPath = location.pathname.replace(/^\/(en|de)/, '') || '/';
    const newPrefix = newLang !== 'pl' ? `/${newLang}` : '';
    navigate(newPrefix + currentPath + location.search);
  };

  // Save language choice as explicit preference when dismissing popup
  const saveLanguage = () => {
    try { localStorage.setItem('pollar-language', language); } catch {}
  };

  const handleAcceptWithTour = () => {
    saveLanguage();
    acceptAll();
    useOnboardingStore.getState().startTour();
  };

  const handleAcceptWithoutTour = () => {
    saveLanguage();
    acceptAll();
    useOnboardingStore.getState().skipTour();
    trackOnboardingSkipped();
  };

  const handleRejectOptional = () => {
    saveLanguage();
    rejectOptional();
  };

  // Overlay click = accept without tour (clicking outside should not force a tour)
  const handleOverlayClick = () => {
    handleAcceptWithTour();
  };

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <AnimatePresence>
      {!hasInteracted && (
        <>
          {/* Overlay */}
          <motion.div
            key="cookie-overlay"
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Popup */}
          <motion.div
            key="cookie-popup"
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-full max-w-[720px] pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
          <div className="bg-black border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
            {/* Main content */}
            <div className="p-5 md:p-6">
              {/* Welcome header */}
              <div className="mb-4">
                <h3 className="text-white font-semibold text-lg">
                  {tOnboarding('welcome.title')}
                </h3>
                <p className="text-content-subtle text-sm mt-0.5">
                  {tOnboarding('welcome.subtitle')}
                </p>
              </div>

              {/* Feature highlights */}
              <div className="hidden sm:flex sm:flex-row gap-2 mb-4">
                {WELCOME_FEATURES.map(({ icon, key }) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 bg-zinc-900 rounded-md px-3 py-2 flex-1"
                  >
                    <i className={`${icon} text-base text-content-faint shrink-0`} />
                    <span className="text-xs text-content-faint">
                      {tOnboarding(`welcome.features.${key}`)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Language selector — always visible */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 bg-zinc-900 rounded-md p-3 mb-4">
                <div className="flex items-center gap-2 text-content-faint text-xs">
                  <i className="ri-global-line text-base shrink-0" />
                  <span>{t('popup.languageNotice')}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`px-2 py-0.5 text-xs rounded transition-colors ${
                        language === lang.code
                          ? 'bg-zinc-700 text-white font-medium'
                          : 'text-content-faint hover:bg-zinc-800 hover:text-content-subtle'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cookie description */}
              <p className="text-content-faint text-sm leading-snug sm:leading-relaxed mb-4">
                {t('popup.description')}
              </p>

              {/* Legal text box */}
              <div className="bg-zinc-900 rounded-md p-3 mb-4">
                <p className="text-content-faint text-[10px] leading-relaxed">
                  Administratorem Twoich danych jest Pollar P.S.A. z siedzibą w Krakowie przy ul. Piastowskiej 46/12, 30-067 Kraków, zarejestrowaną w rejestrze przedsiębiorców Krajowego Rejestru Sądowego prowadzonym przez Sąd Rejonowy dla Krakowa - Śródmieścia w Krakowie, XI Wydział Gospodarczy KRS, pod numerem KRS 0001194489, o numerze NIP: 6772540681. Szczegółowe informacje znajdziesz w naszej{' '}
                  <LocalizedLink to="/polityka-prywatnosci" className="text-content-faint underline hover:text-white">
                    {t('settings.privacyPolicy')}
                  </LocalizedLink>
                  .
                </p>
              </div>

              {/* Cookie categories */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-zinc-900 rounded text-[10px] sm:text-xs text-content-faint">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t('popup.essential')}
                </span>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-zinc-900 rounded text-[10px] sm:text-xs text-content-faint">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  {t('popup.analytics')}
                </span>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-zinc-900 rounded text-[10px] sm:text-xs text-content-faint">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  {t('popup.marketing')}
                </span>
              </div>

              {/* Buttons - 3 options */}
              {/* Mobile: essential+accept side by side, tour button full-width below */}
              {/* Desktop: all 3 in a row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex flex-row gap-2 sm:contents">
                  <button
                    onClick={handleRejectOptional}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-content-faint bg-zinc-900 hover:bg-zinc-800 rounded transition-colors"
                  >
                    {tOnboarding('cookie.essentialOnly')}
                  </button>
                  <button
                    onClick={handleAcceptWithoutTour}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-content-heading bg-surface hover:bg-background rounded transition-colors"
                  >
                    {tOnboarding('cookie.acceptWithoutTour')}
                  </button>
                </div>
                <button
                  onClick={handleAcceptWithTour}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
                >
                  {tOnboarding('cookie.acceptWithTour')}
                </button>
              </div>

              {/* Footer note */}
              <p className="text-content text-[10px] mt-4 text-center">
                {t('popup.footer')}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
