import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { Toaster } from 'sonner'
import { Header } from './components/Header'
import { AuthModal, EmailVerificationBanner } from './components/auth'
import { ProModal } from './components/ProModal'
import { useAuthStore } from './stores/authStore'
import { useUserStore } from './stores/userStore'
import { NewsGrid } from './components/NewsGrid'
import { Footer } from './components/Footer'
import { CookiePopup } from './components/CookiePopup'
import { EventPage } from './pages/event'
import { BriefPage } from './pages/brief'
import { FelietonPage } from './pages/felieton'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { MapPage } from './pages/mapa'
import { TerminalPage } from './pages/terminal'
import { ScrollToTop } from './components/ScrollToTop'
import {
  SejmLayout,
  SejmDashboard,
  MPsPage,
  MPDetailPage,
  VotingsPage,
  VotingDetailPage,
  ClubsPage,
  ClubDetailPage,
  CommitteesPage,
  CommitteeDetailPage,
  ProceedingsPage,
  ProceedingDetailPage,
  PrintsPage,
  PrintDetailPage,
  ProcessesPage,
  InterpellationsPage,
  QuestionsPage,
  VideosPage,
} from './pages/sejm'
import { DaneLayout, DanePage } from './pages/dane'
import { PowietrzePage } from './pages/dane/srodowisko/PowietrzePage'
import { ImionaPage } from './pages/dane/spoleczenstwo/ImionaPage'
import { NazwiskaPage } from './pages/dane/spoleczenstwo/NazwiskaPage'
import { EnergiaPage } from './pages/dane/ekonomia/EnergiaPage'
import { EurostatPage } from './pages/dane/ekonomia/EurostatPage'
import { MieszkaniaPage } from './pages/dane/ekonomia/MieszkaniaPage'
import { KolejPage } from './pages/dane/transport/KolejPage'
import { PortyPage } from './pages/dane/transport/PortyPage'
import { PrzestepczoscPage } from './pages/dane/bezpieczenstwo/PrzestepczoscPage'
import { PowiazaniaPage } from './pages/powiazania'
import { ProfilePage } from './pages/profile/ProfilePage'
import { useEventStream } from './hooks/useEventStream'

function HomePage() {
  return <NewsGrid />
}

// Full-screen routes that don't need Header/Footer
const FULLSCREEN_ROUTES = ['/mapa', '/terminal']

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
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/brief" element={<BriefPage />} />
        <Route path="/felieton/:id" element={<FelietonPage />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/polityka-prywatnosci" element={<PrivacyPolicyPage />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/terminal" element={<TerminalPage />} />
        <Route path="/powiazania" element={<PowiazaniaPage />} />
        <Route path="/profil" element={<ProfilePage />} />
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
      </Routes>
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

  // Initialize auth listener
  const initializeAuth = useAuthStore((s) => s.initialize)
  const user = useAuthStore((s) => s.user)
  const fetchProfile = useUserStore((s) => s.fetchProfile)
  const clearProfile = useUserStore((s) => s.clearProfile)

  useEffect(() => {
    const unsubscribe = initializeAuth()
    return () => unsubscribe()
  }, [initializeAuth])

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile(user.uid)
    } else {
      clearProfile()
    }
  }, [user, fetchProfile, clearProfile])

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
        {showFooter && <Footer />}
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
        <Toaster position="bottom-right" richColors closeButton />
      </BrowserRouter>
    </SWRConfig>
  )
}

export default App
