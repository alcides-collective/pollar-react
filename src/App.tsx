import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { Toaster, toast } from 'sonner'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Header } from './components/Header'
import { AuthModal, EmailVerificationBanner, ConsentRequiredModal } from './components/auth'
import { ProModal } from './components/ProModal'
import { useAuthStore } from './stores/authStore'
import { useUserStore } from './stores/userStore'
import { useAlertsStore } from './stores/alertsStore'
import { useReadHistoryStore } from './stores/readHistoryStore'
import { NewsGrid } from './components/NewsGrid'
import { Footer } from './components/Footer'
import { CookiePopup } from './components/CookiePopup'
import { ScrollToTop } from './components/ScrollToTop'
import { PageLoader } from './components/common/PageLoader'
import { useEventStream } from './hooks/useEventStream'
import { useAllSectionsReady } from './stores/imageLoadingStore'
import { useLanguage, useSetLanguage, useGeoDetectionPending, type Language } from './stores/languageStore'
import { useResolvedTheme, useThemeStore } from './stores/themeStore'
import { useChartScaleStore } from './stores/chartScaleStore'
import { useContentsquare } from './hooks/useContentsquare'
import { useClarity } from './hooks/useClarity'
import { useCountryRedirect } from './hooks/useCountryRedirect'
import { useSessionTracking } from './hooks/useSessionTracking'
import { initUserAnalytics, clearUserAnalytics, trackPageView, trackNewsletterConfirmed, trackNewsletterConfirmFailed } from './lib/analytics'
import { captureUtmParams } from './lib/utm'
import { API_BASE } from './config/api'
import { useTranslation } from 'react-i18next'
import { getCategoryFromSlug, isValidCategorySlug } from './utils/categorySlug'
import { parseCountrySlugsParam, ALL_COUNTRY_SEGMENTS } from './utils/countrySlug'
import { useUIStore } from './stores/uiStore'

// Lazy load all page components for code splitting
const EventPage = lazy(() => import('./pages/event').then(m => ({ default: m.EventPage })))
const BriefPage = lazy(() => import('./pages/brief').then(m => ({ default: m.BriefPage })))
const FelietonPage = lazy(() => import('./pages/felieton').then(m => ({ default: m.FelietonPage })))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })))
const CookieSettingsPage = lazy(() => import('./pages/CookieSettingsPage').then(m => ({ default: m.CookieSettingsPage })))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })))
const MapPage = lazy(() => import('./pages/mapa').then(m => ({ default: m.MapPage })))
const TerminalPage = lazy(() => import('./pages/terminal').then(m => ({ default: m.TerminalPage })))
const InfoPage = lazy(() => import('./pages/info').then(m => ({ default: m.InfoPage })))
const AsystentPage = lazy(() => import('./pages/asystent').then(m => ({ default: m.AsystentPage })))
const PowiazaniaPage = lazy(() => import('./pages/powiazania').then(m => ({ default: m.PowiazaniaPage })))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))
const NotificationsPage = lazy(() => import('./pages/notifications').then(m => ({ default: m.NotificationsPage })))
const ArchivePage = lazy(() => import('./pages/archiwum').then(m => ({ default: m.ArchivePage })))
const CategoryArchivePage = lazy(() => import('./pages/archiwum').then(m => ({ default: m.CategoryArchivePage })))
const NewsletterPage = lazy(() => import('./pages/newsletter').then(m => ({ default: m.NewsletterPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })))

// Blog
const BlogListPage = lazy(() => import('./pages/blog').then(m => ({ default: m.BlogListPage })))
const BlogPostPage = lazy(() => import('./pages/blog').then(m => ({ default: m.BlogPostPage })))

// Sejm section (heavy - lots of data visualization)
const SejmLayout = lazy(() => import('./pages/sejm').then(m => ({ default: m.SejmLayout })))
const SejmDashboard = lazy(() => import('./pages/sejm').then(m => ({ default: m.SejmDashboard })))
const MPsPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.MPsPage })))
const MPDetailPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.MPDetailPage })))
const VotingsPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.VotingsPage })))
const VotingDetailPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.VotingDetailPage })))
const ClubsPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.ClubsPage })))
const ClubDetailPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.ClubDetailPage })))
const CommitteesPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.CommitteesPage })))
const CommitteeDetailPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.CommitteeDetailPage })))
const ProceedingsPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.ProceedingsPage })))
const ProceedingDetailPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.ProceedingDetailPage })))
const PrintsPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.PrintsPage })))
const PrintDetailPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.PrintDetailPage })))
const ProcessesPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.ProcessesPage })))
const InterpellationsPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.InterpellationsPage })))
const QuestionsPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.QuestionsPage })))
const VideosPage = lazy(() => import('./pages/sejm').then(m => ({ default: m.VideosPage })))

// Dane section (data visualization)
const DaneLayout = lazy(() => import('./pages/dane').then(m => ({ default: m.DaneLayout })))
const DanePage = lazy(() => import('./pages/dane').then(m => ({ default: m.DanePage })))
const PowietrzePage = lazy(() => import('./pages/dane/srodowisko/PowietrzePage').then(m => ({ default: m.PowietrzePage })))
const ImionaPage = lazy(() => import('./pages/dane/spoleczenstwo/ImionaPage').then(m => ({ default: m.ImionaPage })))
const NazwiskaPage = lazy(() => import('./pages/dane/spoleczenstwo/NazwiskaPage').then(m => ({ default: m.NazwiskaPage })))
const EnergiaPage = lazy(() => import('./pages/dane/ekonomia/EnergiaPage').then(m => ({ default: m.EnergiaPage })))
const EurostatPage = lazy(() => import('./pages/dane/ekonomia/EurostatPage').then(m => ({ default: m.EurostatPage })))
const MieszkaniaPage = lazy(() => import('./pages/dane/ekonomia/MieszkaniaPage').then(m => ({ default: m.MieszkaniaPage })))
const KolejPage = lazy(() => import('./pages/dane/transport/KolejPage').then(m => ({ default: m.KolejPage })))
const PortyPage = lazy(() => import('./pages/dane/transport/PortyPage').then(m => ({ default: m.PortyPage })))
const PrzestepczoscPage = lazy(() => import('./pages/dane/bezpieczenstwo/PrzestepczoscPage').then(m => ({ default: m.PrzestepczoscPage })))

// Gielda section (heavy - Chart.js)
const GieldaLayout = lazy(() => import('./pages/gielda').then(m => ({ default: m.GieldaLayout })))
const GieldaPage = lazy(() => import('./pages/gielda').then(m => ({ default: m.GieldaPage })))
const StocksPage = lazy(() => import('./pages/gielda').then(m => ({ default: m.StocksPage })))
const IndicesPage = lazy(() => import('./pages/gielda').then(m => ({ default: m.IndicesPage })))
const WatchlistPage = lazy(() => import('./pages/gielda').then(m => ({ default: m.WatchlistPage })))
const StockDetailPage = lazy(() => import('./pages/gielda').then(m => ({ default: m.StockDetailPage })))
const IndexDetailPage = lazy(() => import('./pages/gielda').then(m => ({ default: m.IndexDetailPage })))

// Graf page (network visualization)
const GrafPage = lazy(() => import('./pages/graf').then(m => ({ default: m.GrafPage })))

// Pogoda page
const PogodaPage = lazy(() => import('./pages/pogoda').then(m => ({ default: m.PogodaPage })))

// Sources page
const SourcesPage = lazy(() => import('./pages/sources').then(m => ({ default: m.SourcesPage })))

// RSS page
const RssPage = lazy(() => import('./pages/rss').then(m => ({ default: m.RssPage })))

// 404 page
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

function HomePage() {
  const setSelectedCategory = useUIStore((s) => s.setSelectedCategory)
  const clearCountriesDisplay = useUIStore((s) => s.clearCountriesDisplay)
  useEffect(() => {
    setSelectedCategory(null)
    clearCountriesDisplay()
  }, [setSelectedCategory, clearCountriesDisplay])
  return <NewsGrid />
}

function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const location = useLocation()
  const language: Language = (location.pathname.match(/^\/(en|de)/)?.[1] as Language) || 'pl'
  const setSelectedCategory = useUIStore((s) => s.setSelectedCategory)
  const clearCountriesDisplay = useUIStore((s) => s.clearCountriesDisplay)

  const polishCategory = categorySlug ? getCategoryFromSlug(categorySlug, language) : null

  useEffect(() => {
    if (polishCategory) {
      setSelectedCategory(polishCategory)
    }
    clearCountriesDisplay()
  }, [polishCategory, setSelectedCategory, clearCountriesDisplay])

  if (!polishCategory) {
    return <Navigate to="/" replace />
  }

  return <NewsGrid />
}

function CountryPage() {
  const { countrySlugs } = useParams<{ countrySlugs: string }>()
  const location = useLocation()
  const language: Language = (location.pathname.match(/^\/(en|de)/)?.[1] as Language) || 'pl'
  const setSelectedCountries = useUIStore((s) => s.setSelectedCountries)
  const setSelectedCategory = useUIStore((s) => s.setSelectedCategory)

  const countries = countrySlugs ? parseCountrySlugsParam(countrySlugs, language) : []

  useEffect(() => {
    setSelectedCategory(null)
    if (countrySlugs) {
      setSelectedCountries(parseCountrySlugsParam(countrySlugs, language))
    }
  }, [countrySlugs, language, setSelectedCountries, setSelectedCategory])

  if (countries.length === 0) {
    return <Navigate to="/" replace />
  }

  return <NewsGrid />
}

function CategoryCountryPage() {
  const { categorySlug, countrySlugs } = useParams<{ categorySlug: string; countrySlugs: string }>()
  const location = useLocation()
  const language: Language = (location.pathname.match(/^\/(en|de)/)?.[1] as Language) || 'pl'
  const setSelectedCategory = useUIStore((s) => s.setSelectedCategory)
  const setSelectedCountries = useUIStore((s) => s.setSelectedCountries)

  const polishCategory = categorySlug ? getCategoryFromSlug(categorySlug, language) : null
  const countries = countrySlugs ? parseCountrySlugsParam(countrySlugs, language) : []

  useEffect(() => {
    if (polishCategory) {
      setSelectedCategory(polishCategory)
    }
    if (countrySlugs) {
      setSelectedCountries(parseCountrySlugsParam(countrySlugs, language))
    }
  }, [categorySlug, countrySlugs, language, polishCategory, setSelectedCategory, setSelectedCountries])

  if (!polishCategory || countries.length === 0) {
    return <Navigate to="/" replace />
  }

  return <NewsGrid />
}

// Full-screen routes that don't need Header/Footer
const FULLSCREEN_ROUTES = ['/mapa', '/terminal', '/asystent', '/info', '/graf']

// Language route handler - syncs URL language prefix with language store
function LanguageRouteHandler() {
  const location = useLocation()
  const navigate = useNavigate()
  const setLanguage = useSetLanguage()
  const storeLanguage = useLanguage()
  const geoDetectionPending = useGeoDetectionPending()

  useEffect(() => {
    const match = location.pathname.match(/^\/(en|de)(\/|$)/)
    const urlLang: Language = match ? (match[1] as Language) : 'pl'

    // Auto-detect redirect: first visit to default (no-prefix) URL with detected non-Polish language
    // Wait for geo detection to finish before redirecting
    const hasStoredLang = (() => {
      try { return !!localStorage.getItem('pollar-language') }
      catch { return false }
    })()
    if (!hasStoredLang && urlLang === 'pl' && storeLanguage !== 'pl' && !geoDetectionPending) {
      const newPrefix = `/${storeLanguage}`
      navigate(newPrefix + location.pathname + location.search, { replace: true })
      return
    }

    if (urlLang !== storeLanguage && !geoDetectionPending) {
      setLanguage(urlLang)
    }

    // Redirect /pl/... -> /... (Polish is default without prefix)
    if (location.pathname.startsWith('/pl/') || location.pathname === '/pl') {
      const newPath = location.pathname.replace(/^\/pl/, '') || '/'
      navigate(newPath, { replace: true })
    }
  }, [location.pathname, storeLanguage, setLanguage, navigate, geoDetectionPending])

  return null
}

// Helper to generate routes with optional language prefix
function getAppRoutes(prefix = '') {
  return [
    <Route key={`${prefix}-home`} path={`${prefix}/`} element={<HomePage />} />,
    <Route key={`${prefix}-brief`} path={`${prefix}/brief`} element={<BriefPage />} />,
    <Route key={`${prefix}-felieton`} path={`${prefix}/felieton/:id/:slug?`} element={<FelietonPage />} />,
    <Route key={`${prefix}-event`} path={`${prefix}/event/:id/:slug?`} element={<EventPage />} />,
    <Route key={`${prefix}-privacy`} path={`${prefix}/polityka-prywatnosci`} element={<PrivacyPolicyPage />} />,
    <Route key={`${prefix}-terms`} path={`${prefix}/regulamin`} element={<TermsOfServicePage />} />,
    <Route key={`${prefix}-cookies`} path={`${prefix}/cookies`} element={<CookieSettingsPage />} />,
    <Route key={`${prefix}-mapa`} path={`${prefix}/mapa`} element={<MapPage />} />,
    <Route key={`${prefix}-terminal`} path={`${prefix}/terminal`} element={<TerminalPage />} />,
    <Route key={`${prefix}-asystent`} path={`${prefix}/asystent`} element={<AsystentPage />} />,
    <Route key={`${prefix}-info`} path={`${prefix}/info`} element={<InfoPage />} />,
    <Route key={`${prefix}-powiazania`} path={`${prefix}/powiazania`} element={<PowiazaniaPage />} />,
    <Route key={`${prefix}-graf`} path={`${prefix}/graf`} element={<GrafPage />} />,
    <Route key={`${prefix}-profil`} path={`${prefix}/profil`} element={<ProfilePage />} />,
    <Route key={`${prefix}-powiadomienia`} path={`${prefix}/powiadomienia`} element={<NotificationsPage />} />,
    <Route key={`${prefix}-newsletter`} path={`${prefix}/newsletter`} element={<NewsletterPage />} />,
    <Route key={`${prefix}-archiwum`} path={`${prefix}/archiwum`} element={<ArchivePage />} />,
    <Route key={`${prefix}-archiwum-cat`} path={`${prefix}/archiwum/:category`} element={<CategoryArchivePage />} />,
    <Route key={`${prefix}-kontakt`} path={`${prefix}/kontakt`} element={<ContactPage />} />,
    <Route key={`${prefix}-blog`} path={`${prefix}/blog`} element={<BlogListPage />} />,
    <Route key={`${prefix}-blog-post`} path={`${prefix}/blog/:slug`} element={<BlogPostPage />} />,
    <Route key={`${prefix}-pogoda`} path={`${prefix}/pogoda`} element={<PogodaPage />} />,
    <Route key={`${prefix}-sources`} path={`${prefix}/sources`} element={<SourcesPage />} />,
    <Route key={`${prefix}-rss`} path={`${prefix}/rss`} element={<RssPage />} />,
    /* Sejm routes */
    <Route key={`${prefix}-sejm`} path={`${prefix}/sejm`} element={<SejmLayout />}>
      <Route index element={<SejmDashboard />} />
      <Route path="poslowie" element={<MPsPage />} />
      <Route path="poslowie/:id/:slug?" element={<MPDetailPage />} />
      <Route path="kluby" element={<ClubsPage />} />
      <Route path="kluby/:id" element={<ClubDetailPage />} />
      <Route path="glosowania" element={<VotingsPage />} />
      <Route path="glosowania/:sitting/:number" element={<VotingDetailPage />} />
      <Route path="komisje" element={<CommitteesPage />} />
      <Route path="komisje/:code" element={<CommitteeDetailPage />} />
      <Route path="posiedzenia" element={<ProceedingsPage />} />
      <Route path="posiedzenia/:number" element={<ProceedingDetailPage />} />
      <Route path="druki" element={<PrintsPage />} />
      <Route path="druki/:number" element={<PrintDetailPage />} />
      <Route path="procesy" element={<ProcessesPage />} />
      <Route path="interpelacje" element={<InterpellationsPage />} />
      <Route path="zapytania" element={<QuestionsPage />} />
      <Route path="transmisje" element={<VideosPage />} />
    </Route>,
    /* Dane routes */
    <Route key={`${prefix}-dane`} path={`${prefix}/dane`} element={<DaneLayout />}>
      <Route index element={<DanePage />} />
      <Route path="srodowisko/powietrze" element={<PowietrzePage />} />
      <Route path="spoleczenstwo/imiona" element={<ImionaPage />} />
      <Route path="spoleczenstwo/nazwiska" element={<NazwiskaPage />} />
      <Route path="ekonomia/energia" element={<EnergiaPage />} />
      <Route path="ekonomia/eurostat" element={<EurostatPage />} />
      <Route path="ekonomia/mieszkania" element={<MieszkaniaPage />} />
      <Route path="transport/kolej" element={<KolejPage />} />
      <Route path="transport/porty" element={<PortyPage />} />
      <Route path="bezpieczenstwo/przestepczosc" element={<PrzestepczoscPage />} />
    </Route>,
    /* Gielda routes */
    <Route key={`${prefix}-gielda`} path={`${prefix}/gielda`} element={<GieldaLayout />}>
      <Route index element={<GieldaPage />} />
      <Route path="akcje" element={<StocksPage />} />
      <Route path="akcje/:symbol" element={<StockDetailPage />} />
      <Route path="indeksy" element={<IndicesPage />} />
      <Route path="indeksy/:symbol" element={<IndexDetailPage />} />
      <Route path="watchlist" element={<WatchlistPage />} />
    </Route>,
    /* Country filter routes (segment translated: kraj/country/land) */
    ...ALL_COUNTRY_SEGMENTS.flatMap(seg => [
      <Route key={`${prefix}-country-${seg}`} path={`${prefix}/${seg}/:countrySlugs`} element={<CountryPage />} />,
      <Route key={`${prefix}-cat-country-${seg}`} path={`${prefix}/:categorySlug/${seg}/:countrySlugs`} element={<CategoryCountryPage />} />,
    ]),
    /* Category page (dynamic slug — React Router ranks static paths higher) */
    <Route key={`${prefix}-category`} path={`${prefix}/:categorySlug`} element={<CategoryPage />} />,
    /* 404 catch-all */
    <Route key={`${prefix}-404`} path={`${prefix}/*`} element={<NotFoundPage />} />,
  ]
}

function AnimatedRoutes({ onRouteChange, onContentReady }: { onRouteChange: () => void; onContentReady: () => void }) {
  const location = useLocation()

  // Hide footer immediately when route changes
  useEffect(() => {
    onRouteChange()
  }, [location.pathname, onRouteChange])

  // Show footer after content animation completes
  useEffect(() => {
    const timer = setTimeout(onContentReady, 250)
    return () => clearTimeout(timer)
  }, [location.pathname, onContentReady])

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          {/* Polish routes (default, no prefix) */}
          {getAppRoutes()}
          {/* English routes */}
          {getAppRoutes('/en')}
          {/* German routes */}
          {getAppRoutes('/de')}
        </Routes>
      </Suspense>
    </motion.div>
  )
}

function useIsFullscreenRoute() {
  const location = useLocation()
  // Remove language prefix for comparison
  const pathWithoutLang = location.pathname.replace(/^\/(en|de)/, '') || '/'
  return FULLSCREEN_ROUTES.some(route => pathWithoutLang === route)
}

function AppContent() {
  // Capture UTM params from URL before anything else
  captureUtmParams()

  const [showFooter, setShowFooter] = useState(false)
  const isFullscreen = useIsFullscreenRoute()
  const location = useLocation()
  const allSectionsReady = useAllSectionsReady()
  const language = useLanguage()
  const pathWithoutLang = location.pathname.replace(/^\/(en|de)/, '') || '/'
  const categorySlug = pathWithoutLang.replace(/^\//, '')
  const isHomePage = pathWithoutLang === '/' || isValidCategorySlug(categorySlug, language) || ALL_COUNTRY_SEGMENTS.some(seg => pathWithoutLang.startsWith(`/${seg}/`) || new RegExp(`^/[^/]+/${seg}/`).test(pathWithoutLang))

  // Initialize auth listener
  const initializeAuth = useAuthStore((s) => s.initialize)
  const user = useAuthStore((s) => s.user)
  const fetchProfile = useUserStore((s) => s.fetchProfile)
  const clearProfile = useUserStore((s) => s.clearProfile)
  const clearAlertsStore = useAlertsStore((s) => s.clearStore)
  const clearReadHistoryStore = useReadHistoryStore((s) => s.clearStore)

  // Theme
  const resolvedTheme = useResolvedTheme()
  const onSystemThemeChange = useThemeStore((s) => s._onSystemThemeChange)
  const resetTheme = useThemeStore((s) => s.reset)
  const resetChartScale = useChartScaleStore((s) => s.reset)

  useEffect(() => {
    const unsubscribe = initializeAuth()
    return () => unsubscribe()
  }, [initializeAuth])

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolvedTheme])

  // Update RSS autodiscovery links in <head> based on language
  useEffect(() => {
    const langPrefix = language !== 'pl' ? `/${language}` : ''
    const base = 'https://pollar.news'
    const mainLink = document.querySelector('link[title="Pollar News RSS"]') as HTMLLinkElement
    const blogLink = document.querySelector('link[title="Pollar News Blog RSS"]') as HTMLLinkElement
    if (mainLink) mainLink.href = `${base}${langPrefix}/feed.xml`
    if (blogLink) blogLink.href = `${base}${langPrefix}/blog/feed.xml`
  }, [language])

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => onSystemThemeChange()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [onSystemThemeChange])

  // Newsletter confirmation — handle ?confirm_token= from email link
  const { t: tNewsletter } = useTranslation('newsletter')
  const navigate = useNavigate()
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const confirmToken = params.get('confirm_token')
    if (!confirmToken) return

    params.delete('confirm_token')
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true })

    fetch(`${API_BASE}/newsletter/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: confirmToken }),
    })
      .then((res) => {
        if (res.ok) {
          toast.success(tNewsletter('confirmToast.success'))
          trackNewsletterConfirmed()
        } else {
          toast.error(tNewsletter('confirmToast.error'))
          trackNewsletterConfirmFailed()
        }
      })
      .catch(() => {
        toast.error(tNewsletter('confirmToast.error'))
        trackNewsletterConfirmFailed()
      })
  }, [location.search, tNewsletter, navigate, location.pathname])

  // Track whether user was ever logged in — so we only reset on actual logout,
  // not on cold start where user is null from the beginning.
  const wasLoggedInRef = useRef(false)

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      wasLoggedInRef.current = true
      fetchProfile(user.uid).then(() => {
        const profile = useUserStore.getState().profile
        if (profile?.preferences?.theme) {
          useThemeStore.getState().syncFromProfile(profile.preferences.theme)
        }
        if (profile?.preferences?.smartScale !== undefined) {
          useChartScaleStore.getState().syncFromProfile(profile.preferences.smartScale)
        }
        if (profile?.preferences?.selectedCountries) {
          useUIStore.getState().syncCountriesFromProfile(profile.preferences.selectedCountries)
        }
        // Initialize analytics user identity for registered user tracking
        initUserAnalytics(user, profile, language)
      })
    } else {
      // Only clear stores on actual logout (user was logged in before),
      // not on initial mount where user starts as null — that would wipe
      // URL-derived state (selectedCountries from /kraj/polska routes).
      if (wasLoggedInRef.current) {
        clearProfile()
        clearAlertsStore()
        clearReadHistoryStore()
        resetTheme()
        resetChartScale()
        useUIStore.getState().resetCountries()
        clearUserAnalytics()
      }
    }
  }, [user, fetchProfile, clearProfile, clearAlertsStore, clearReadHistoryStore, resetTheme, resetChartScale, language])

  // Redirect to persisted country URL when landing on '/'
  useCountryRedirect()

  // Connect to SSE for real-time event notifications
  useEventStream({ enabled: true })

  // Load Contentsquare/Hotjar analytics when consent granted
  useContentsquare()
  useClarity()

  // Track session-level engagement for registered users
  useSessionTracking()

  // Track SPA page views in GA4 on every route change
  useEffect(() => {
    trackPageView(document.title, {
      page_path: location.pathname,
      page_location: window.location.href,
    })
  }, [location.pathname])

  const handleRouteChange = useCallback(() => {
    setShowFooter(false)
  }, [])

  const handleContentReady = useCallback(() => {
    setShowFooter(true)
  }, [])

  // Full-screen layout (no header/footer)
  if (isFullscreen) {
    return (
      <>
        <LanguageRouteHandler />
        <ScrollToTop />
        <AnimatedRoutes onRouteChange={handleRouteChange} onContentReady={handleContentReady} />
      </>
    )
  }

  // Standard layout with header/footer
  return (
    <>
      <LanguageRouteHandler />
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <EmailVerificationBanner />
        <main className="flex-1">
          <AnimatedRoutes onRouteChange={handleRouteChange} onContentReady={handleContentReady} />
        </main>
        {(isHomePage ? allSectionsReady : showFooter) && <Footer />}
      </div>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <SWRConfig value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000,
        keepPreviousData: true,
      }}>
        <BrowserRouter>
          <AppContent />
          <AuthModal />
          <ConsentRequiredModal />
          <ProModal />
          <CookiePopup />
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: 'grid grid-cols-[1fr_auto] items-start gap-2',
                actionButton: 'col-start-2 row-start-2 self-end',
              },
            }}
          />
        </BrowserRouter>
      </SWRConfig>
    </ErrorBoundary>
  )
}

export default App
