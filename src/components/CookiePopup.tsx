import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCookieConsentStore } from '@/stores/cookieConsentStore';
import { Link } from 'react-router-dom';

export function CookiePopup() {
  const { hasInteracted, acceptAll, rejectOptional, loadFromStorage } = useCookieConsentStore();

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
        onClick={acceptAll}
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
                    <i className="ri-shield-check-line text-xl text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-base">
                      Twoja prywatność
                    </h3>
                    <p className="text-zinc-500 text-xs">
                      Pollar P.S.A.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                Używamy plików cookie, aby serwis działał prawidłowo, analizować ruch oraz personalizować treści. Prosimy o zgodę na ich wykorzystanie.
              </p>

              {/* Legal text box */}
              <div className="bg-zinc-900 rounded-md p-4 mb-4">
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Administratorem Twoich danych jest Pollar P.S.A. z siedzibą w Krakowie przy ul. Piastowskiej 46/12, 30-067 Kraków, zarejestrowaną w rejestrze przedsiębiorców Krajowego Rejestru Sądowego prowadzonym przez Sąd Rejonowy dla Krakowa - Śródmieścia w Krakowie, XI Wydział Gospodarczy KRS, pod numerem KRS 0001194489, o numerze NIP: 6772540681. Szczegółowe informacje znajdziesz w naszej{' '}
                  <Link to="/polityka-prywatnosci" className="text-zinc-300 underline hover:text-white">
                    Polityce Prywatności
                  </Link>
                  .
                </p>
              </div>

              {/* Cookie categories */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 rounded text-xs text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Niezbędne
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 rounded text-xs text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Analityczne
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 rounded text-xs text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Marketingowe
                </span>
              </div>

              {/* Buttons - equal visual weight for GDPR compliance */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={rejectOptional}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 rounded transition-colors"
                >
                  Tylko niezbędne
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-black bg-zinc-100 hover:bg-white rounded transition-colors"
                >
                  Akceptuj wszystkie
                </button>
              </div>

              {/* Footer note */}
              <p className="text-zinc-600 text-[10px] mt-4 text-center">
                Klikając poza banerem lub przewijając stronę, akceptujesz wszystkie cookies
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
