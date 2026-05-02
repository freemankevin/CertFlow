import { Link } from 'react-router-dom'
import { useI18n } from '../contexts/I18nContext'
import { ArrowRight } from 'lucide-react'

export function HomePage() {
  const { language } = useI18n()
  const isZh = language === 'zh'

  const features = isZh
    ? [
        '单文件脚本，零依赖开箱即用',
        'WebRoot / DNS-API 双验证模式',
        '智能续期：仅到期前 30 天申请',
        '多域名批量处理',
        'Docker / Nginx 自动重载',
        'Webhook 通知（微信/钉钉/Slack/Discord）',
        '证书自动备份',
        '彩色结构化日志输出',
      ]
    : [
        'Single-file script, zero dependencies',
        'WebRoot / DNS-API dual verification',
        'Smart renewal: only 30 days before expiry',
        'Multi-domain batch processing',
        'Docker / Nginx auto reload',
        'Webhook notifications (WeChat/DingTalk/Slack/Discord)',
        'Automatic certificate backup',
        'Colored structured log output',
      ]

  return (
    <div className="bg-white dark:bg-[#0B0F19] transition-colors">
      {/* Hero */}
      <section className="border-b border-gray-200 dark:border-gray-800/40 transition-colors">
        <div className="max-w-5xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6 transition-colors">
              CertFlow
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8 transition-colors">
              {isZh
                ? 'CertFlow 是一个基于 acme.sh 的自动化 SSL 证书续期工具，支持 WebRoot 和 DNS-API 双验证模式，专为服务器运维场景设计。'
                : 'CertFlow is an automated SSL certificate renewal tool built on acme.sh, supporting both WebRoot and DNS-API verification modes, designed for server operations.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-300 transition-colors"
              >
                {isZh ? '阅读文档' : 'Read Docs'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/freemankevin/CertFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700/50 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-2 h-1 w-1 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0" />
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick start teaser */}
      <section className="border-t border-gray-200 dark:border-gray-800/40 bg-gray-50 dark:bg-white/[0.02] transition-colors">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors">
            {isZh ? '快速开始' : 'Quick Start'}
          </h2>
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-700">
              <span className="text-xs text-gray-500 font-medium">Terminal</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
                <code>curl -L https://github.com/freemankevin/CertFlow/releases/latest/download/certflow.tar.gz | tar -xz</code>
              </pre>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/docs"
              className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 underline underline-offset-2 transition-colors"
            >
              {isZh ? '查看完整文档 →' : 'View full documentation →'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
