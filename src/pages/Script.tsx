import { useState, useEffect } from 'react'
import { Download, Copy, Check, ArrowUp, FileCode, ExternalLink } from 'lucide-react'
import { useI18n } from '../contexts/I18nContext'
import { CodeBlock } from '../components/CodeBlock'

const fullScriptUrl = 'https://raw.githubusercontent.com/freemankevin/CertFlow/main/renew-ssl-cert.sh'

export function ScriptPage() {
  const { language } = useI18n()
  const [copied, setCopied] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scriptContent, setScriptContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > window.innerHeight)
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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="py-10 lg:py-12">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-8 mb-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3 flex items-center gap-3">
                <FileCode className="h-8 w-8 text-gray-400" />
                {language === 'zh' ? '脚本源码' : 'Script Source'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                {language === 'zh'
                  ? 'renew-ssl-cert.sh 的完整源码。可直接复制使用或下载到本地。'
                  : 'Complete source code of renew-ssl-cert.sh. Copy directly or download to use locally.'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleCopyAll}
                disabled={loading || !scriptContent}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? (language === 'zh' ? '已复制' : 'Copied') : (language === 'zh' ? '复制' : 'Copy')}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                <Download className="h-4 w-4" />
                {language === 'zh' ? '下载' : 'Download'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm">
            <a
              href="https://github.com/freemankevin/CertFlow/blob/main/renew-ssl-cert.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {language === 'zh' ? '在 GitHub 上查看' : 'View on GitHub'}
            </a>
          </div>
        </div>

        {/* Script Content */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-white rounded-full animate-spin" />
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                {language === 'zh' ? '加载中...' : 'Loading...'}
              </span>
            </div>
          ) : (
            <CodeBlock code={scriptContent} filename="renew-ssl-cert.sh" showLineNumbers={true} />
          )}
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-6 bottom-6 p-3 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg hover:shadow-xl transition-all z-50"
          title={language === 'zh' ? '回到顶部' : 'Back to top'}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
