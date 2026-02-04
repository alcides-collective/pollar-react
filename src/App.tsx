import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { Header } from './components/Header'
import { AuthModal, EmailVerificationBanner } from './components/auth'
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

// Lazy load all page components for code splitting
const EventPage = lazy(() => import('./pages/event').then(m => ({ default: m.EventPage })))
const BriefPage = lazy(() => import('./pages/brief').then(m => ({ default: m.BriefPage })))
const FelietonPage = lazy(() => import('./pages/felieton').then(m => ({ default: m.FelietonPage })))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })))
const CookieSettingsPage = lazy(() => import('./pages/CookieSettingsPage').then(m => ({ default: m.CookieSettingsPage })))
const MapPage = lazy(() => import('./pages/mapa').then(m => ({ default: m.MapPage })))
const TerminalPage = lazy(() => import('./pages/terminal').then(m => ({ default: m.TerminalPage })))
const InfoPage = lazy(() => import('./pages/info').then(m => ({ default: m.InfoPage })))
const AsystentPage = lazy(() => import('./pages/asystent').then(m => ({ default: m.AsystentPage })))
const PowiazaniaPage = lazy(() => import('./pages/powiazania').then(m => ({ default: m.PowiazaniaPage })))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const NotificationsPage = lazy(() => import('./pages/notifications').then(m => ({ default: m.NotificationsPage })))
const ArchivePage = lazy(() => import('./pages/archiwum').then(m => ({ default: m.ArchivePage })))
const CategoryArchivePage = lazy(() => import('./pages/archiwum').then(m => ({ default: m.CategoryArchivePage })))

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

function HomePage() {
  return <NewsGrid />
}

// Full-screen routes that don't need Header/Footer
const FULLSCREEN_ROUTES = ['/mapa', '/terminal', '/asystent', '/info', '/graf']

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
          <Route path="/" element={<HomePage />} />
          <Route path="/brief" element={<BriefPage />} />
          <Route path="/felieton/:id" element={<FelietonPage />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route path="/polityka-prywatnosci" element={<PrivacyPolicyPage />} />
          <Route path="/cookies" element={<CookieSettingsPage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/asystent" element={<AsystentPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/powiazania" element={<PowiazaniaPage />} />
          <Route path="/graf" element={<GrafPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/powiadomienia" element={<NotificationsPage />} />
          <Route path="/archiwum" element={<ArchivePage />} />
          <Route path="/archiwum/:category" element={<CategoryArchivePage />} />
          {/* Sejm routes */}
          <Route path="/sejm" element={<SejmLayout />}>
            <Route index element={<SejmDashboard />} />
            <Route path="poslowie" element={<MPsPage />} />
            <Route path="poslowie/:id" element={<MPDetailPage />} />
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
          </Route>
          {/* Dane routes */}
          <Route path="/dane" element={<DaneLayout />}>
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
          </Route>
          {/* Gielda routes */}
          <Route path="/gielda" element={<GieldaLayout />}>
            <Route index element={<GieldaPage />} />
            <Route path="akcje" element={<StocksPage />} />
            <Route path="akcje/:symbol" element={<StockDetailPage />} />
            <Route path="indeksy" element={<IndicesPage />} />
            <Route path="indeksy/:symbol" element={<IndexDetailPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
          </Route>
        </Routes>
      </Suspense>
    </motion.div>
  )
}

function useIsFullscreenRoute() {
  const location = useLocation()
  return FULLSCREEN_ROUTES.some(route => location.pathname === route)
}

function AppContent() {
  const [showFooter, setShowFooter] = useState(false)
  const isFullscreen = useIsFullscreenRoute()
  const location = useLocation()
  const allSectionsReady = useAllSectionsReady()
  const isHomePage = location.pathname === '/'

  // Initialize auth listener
  const initializeAuth = useAuthStore((s) => s.initialize)
  const user = useAuthStore((s) => s.user)
  const fetchProfile = useUserStore((s) => s.fetchProfile)
  const clearProfile = useUserStore((s) => s.clearProfile)
  const clearAlertsStore = useAlertsStore((s) => s.clearStore)
  const clearReadHistoryStore = useReadHistoryStore((s) => s.clearStore)

  useEffect(() => {
    const unsubscribe = initializeAuth()
    return () => unsubscribe()
  }, [initializeAuth])

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile(user.uid)
    } else {
      // Clear all user-related stores on logout
      clearProfile()
      clearAlertsStore()
      clearReadHistoryStore()
    }
  }, [user, fetchProfile, clearProfile, clearAlertsStore, clearReadHistoryStore])

  // Connect to SSE for real-time event notifications
  useEventStream({ enabled: true })

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
        <ScrollToTop />
        <AnimatedRoutes onRouteChange={handleRouteChange} onContentReady={handleContentReady} />
      </>
    )
  }

  // Standard layout with header/footer
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-white">
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
    <SWRConfig value={{
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    }}>
      <BrowserRouter>
        <AppContent />
        <AuthModal />
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
  )
}

export default App
