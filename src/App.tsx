import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { I18nProvider } from './contexts/I18nContext'
import { Header } from './components/Header'
import { DocsPage } from './pages/Docs'

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 transition-colors">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<DocsPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App
