import { Header } from './components/Header'
import { MarketTicker } from './components/MarketTicker'
import { NewsGrid } from './components/NewsGrid'
import { Footer } from './components/Footer'
import { CategoryProvider } from './context/CategoryContext'

function App() {
  return (
    <CategoryProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <MarketTicker />
        <main className="flex-1">
          <NewsGrid />
        </main>
        <Footer />
      </div>
    </CategoryProvider>
  )
}

export default App
