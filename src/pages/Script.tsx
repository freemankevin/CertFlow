import { useState, useEffect } from 'react'
import { Download, Copy, Check, ArrowUp } from 'lucide-react'
import { useI18n } from '../contexts/I18nContext'
import { CodeBlock } from '../components/CodeBlock'

const fullScriptUrl = 'https://raw.githubusercontent.com/freemankevin/CertFlow/main/renew-ssl-cert.sh'

export function ScriptPage() {
  const { t, language } = useI18n()
  const [copied, setCopied] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scriptContent, setScriptContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const loadScript = async () => {
      try {
        const response = await fetch(fullScriptUrl)
        const text = await response.text()
        setScriptContent(text)
      } catch {
        setScriptContent('')
      }
      setLoading(false)
    }
    loadScript()
  }, [])

  const handleDownload = async () => {
    try {
      const response = await fetch(fullScriptUrl)
      const text = await response.text()
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'renew-ssl-cert.sh'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      const a = document.createElement('a')
      a.href = fullScriptUrl
      a.download = 'renew-ssl-cert.sh'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(scriptContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="animate-fade-in">
      <section className="py-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container-custom">
          <div className="flex items-start justify-between gap-6 max-w-5xl">
            <div>
              <h1 className={`text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                {t.script.title}
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopyAll}
                disabled={loading || !scriptContent}
                className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? (language === 'zh' ? '已复制' : 'Copied') : t.script.copy}
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t.script.download}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="container-custom">
          <div className="max-w-5xl relative">
            <div className="glass-card rounded-lg overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ssl-blue"></div>
                  <span className={`ml-4 text-gray-600 dark:text-gray-400 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                    {language === 'zh' ? '加载脚本内容...' : 'Loading script content...'}
                  </span>
                </div>
              ) : (
                <CodeBlock 
                  code={scriptContent}
                  filename="renew-ssl-cert.sh"
                  showLineNumbers={true}
                />
              )}
            </div>
            {showScrollTop && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed right-8 bottom-8 p-3 rounded-full bg-ssl-blue dark:bg-blue-500 text-white shadow-lg hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors z-50"
                title={language === 'zh' ? '回到顶部' : 'Back to top'}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}