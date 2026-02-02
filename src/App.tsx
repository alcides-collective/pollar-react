import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { NewsGrid } from './components/NewsGrid'
import { Footer } from './components/Footer'
import { CategoryProvider } from './context/CategoryContext'
import { EventPage } from './pages/event'

function HomePage() {
  return <NewsGrid />
}

function App() {
  return (
    <BrowserRouter>
      <CategoryProvider>
        <div className="min-h-screen flex flex-col bg-white">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/event/:id" element={<EventPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CategoryProvider>
    </BrowserRouter>
  )
}

export default App
