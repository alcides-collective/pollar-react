import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { Header } from './components/Header'
import { NewsGrid } from './components/NewsGrid'
import { Footer } from './components/Footer'
import { CategoryProvider } from './context/CategoryContext'
import { EventsProvider } from './context/EventsContext'
import { EventPage } from './pages/event'
import { BriefPage } from './pages/brief'
import { FelietonPage } from './pages/felieton'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'
import { ScrollToTop } from './components/ScrollToTop'

function HomePage() {
  return <NewsGrid />
}

function App() {
  return (
    <SWRConfig value={{
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    }}>
      <EventsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <CategoryProvider>
            <div className="min-h-screen flex flex-col bg-white">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/brief" element={<BriefPage />} />
                  <Route path="/felieton/:id" element={<FelietonPage />} />
                  <Route path="/event/:id" element={<EventPage />} />
                  <Route path="/polityka-prywatnosci" element={<PrivacyPolicyPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CategoryProvider>
        </BrowserRouter>
      </EventsProvider>
    </SWRConfig>
  )
}

export default App
