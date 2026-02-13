import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCookieConsentStore } from '@/stores/cookieConsentStore';
import { useLanguage, useWasAutoDetected, useLanguageStore, type Language } from '@/stores/languageStore';
import { LocalizedLink } from './LocalizedLink';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

export function CookiePopup() {
  const { t } = useTranslation('cookies');
  const { hasInteracted, acceptAll, rejectOptional, loadFromStorage } = useCookieConsentStore();
  const language = useLanguage();
  const wasAutoDetected = useWasAutoDetected();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageChange = (newLang: Language) => {
    useLanguageStore.getState().setLanguage(newLang);
    const currentPath = location.pathname.replace(/^\/(en|de)/, '') || '/';
    const newPrefix = newLang !== 'pl' ? `/${newLang}` : '';
    navigate(newPrefix + currentPath + location.search);
  };

  // When dismissing popup, save auto-detected language as explicit preference
  const handleAcceptAll = () => {
    if (wasAutoDetected) {
      try { localStorage.setItem('pollar-language', language); } catch {}
    }
    acceptAll();
  };

  const handleRejectOptional = () => {
    if (wasAutoDetected) {
      try { localStorage.setItem('pollar-language', language); } catch {}
    }
    rejectOptional();
  };

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (hasInteracted) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleAcceptAll}
        aria-hidden="true"
      />

      {/* Popup */}
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-full max-w-[720px] pointer-events-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-black border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
            {/* Main content */}
            <div className="p-5 md:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-zinc-900 flex items-center justify-center shrink-0">
                    <i className="ri-shield-check-line text-xl text-content-faint" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base">
                      {t('popup.title')}
                    </h3>
                    <p className="text-content-subtle text-xs">
                      Pollar P.S.A.
                    </p>
                  </div>
                </div>
              </div>

              {/* Language auto-detection notice */}
              <AnimatePresence>
                {wasAutoDetected && language !== 'pl' && (
                  <motion.div
                    initial={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-3 bg-zinc-900 rounded-md p-3">
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Description */}
              <p className="text-content-faint text-sm leading-relaxed mb-4">
                {t('popup.description')}
              </p>

              {/* Legal text box */}
              <div className="bg-zinc-900 rounded-md p-4 mb-4">
                <p className="text-content-faint text-xs leading-relaxed">
                  Administratorem Twoich danych jest Pollar P.S.A. z siedzibą w Krakowie przy ul. Piastowskiej 46/12, 30-067 Kraków, zarejestrowaną w rejestrze przedsiębiorców Krajowego Rejestru Sądowego prowadzonym przez Sąd Rejonowy dla Krakowa - Śródmieścia w Krakowie, XI Wydział Gospodarczy KRS, pod numerem KRS 0001194489, o numerze NIP: 6772540681. Szczegółowe informacje znajdziesz w naszej{' '}
                  <LocalizedLink to="/polityka-prywatnosci" className="text-content-faint underline hover:text-white">
                    {t('settings.privacyPolicy')}
                  </LocalizedLink>
                  .
                </p>
              </div>

              {/* Cookie categories */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 rounded text-xs text-content-faint">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t('popup.essential')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 rounded text-xs text-content-faint">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  {t('popup.analytics')}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 rounded text-xs text-content-faint">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  {t('popup.marketing')}
                </span>
              </div>

              {/* Buttons - equal visual weight for GDPR compliance */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleRejectOptional}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-content-faint bg-zinc-900 hover:bg-zinc-800 rounded transition-colors"
                >
                  {t('popup.essentialOnly')}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-content-heading bg-surface hover:bg-background rounded transition-colors"
                >
                  {t('popup.acceptAll')}
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
  );
}
