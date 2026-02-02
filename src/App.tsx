import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { Header } from './components/Header'
import { NewsGrid } from './components/NewsGrid'
import { Footer } from './components/Footer'
import { EventPage } from './pages/event'
import { BriefPage } from './pages/brief'
import { FelietonPage } from './pages/felieton'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { ScrollToTop } from './components/ScrollToTop'

function HomePage() {
  return <NewsGrid />
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
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/brief" element={<BriefPage />} />
        <Route path="/felieton/:id" element={<FelietonPage />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/polityka-prywatnosci" element={<PrivacyPolicyPage />} />
      </Routes>
    </motion.div>
  )
}

function App() {
  const [showFooter, setShowFooter] = useState(false)

  const handleRouteChange = useCallback(() => {
    setShowFooter(false)
  }, [])

  const handleContentReady = useCallback(() => {
    setShowFooter(true)
  }, [])

  return (
    <SWRConfig value={{
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    }}>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-white">
          <Header />
          <main className="flex-1">
            <AnimatedRoutes onRouteChange={handleRouteChange} onContentReady={handleContentReady} />
          </main>
          {showFooter && <Footer />}
        </div>
      </BrowserRouter>
    </SWRConfig>
  )
}

export default App
