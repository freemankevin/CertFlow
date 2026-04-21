import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { I18nProvider } from './contexts/I18nContext'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HomePage } from './pages/Home'
import { DocsPage } from './pages/Docs'
import { ScriptPage } from './pages/Script'
import { FAQPage } from './pages/FAQ'

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/script" element={<ScriptPage />} />
                <Route path="/faq" element={<FAQPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App