import { useState, ReactNode } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, BookOpen, FolderOpen, ExternalLink } from 'lucide-react'
import { useI18n } from '../contexts/I18nContext'
import { CodeBlock } from '../components/CodeBlock'
import { cn } from '../lib/utils'

interface FAQItem {
  question: string
  answer: ReactNode
  category: string
}

interface DocSection {
  title: string
  description: string
  content: string
  language: string
  filename: string
}

export function FAQPage() {
  const { language } = useI18n()
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'faq' | 'installation' | 'docs'>('faq')

  const faqItems: FAQItem[] = language === 'zh' ? [
    {
      category: 'certificate',
      question: '支持哪些证书颁发机构？',
      answer: '默认 Let\'s Encrypt，也支持 ZeroSSL、Buypass。',
    },
    {
      category: 'certificate',
      question: '证书有效期多久？',
      answer: '90天，脚本会在到期前30天自动续期。',
    },
    {
      category: 'certificate',
      question: '申请频率有限制吗？',
      answer: 'Let\'s Encrypt 限制每周每域名50个证书。',
    },
    {
      category: 'config',
      question: '如何配置多个域名？',
      answer: <>在配置文件中用逗号分隔：<code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">DOMAINS</code>="example.com,www.example.com"</>,
    },
    {
      category: 'config',
      question: '支持泛域名证书吗？',
      answer: '支持，需使用 DNS API 模式配置。',
    },
    {
      category: 'usage',
      question: 'Dry-run 模式是什么？',
      answer: '测试模式，不实际申请证书：DRY_RUN=true ./renew-ssl-cert.sh',
    },
    {
      category: 'usage',
      question: '如何查看日志？',
      answer: <>启用日志：<code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">ENABLE_LOG</code>=true，日志位于 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">{'${BASE_DIR}'}</code>/logs/</>,
    },
  ] : [
    {
      category: 'certificate',
      question: 'Which certificate authorities are supported?',
      answer: 'Default is Let\'s Encrypt, also supports ZeroSSL and Buypass.',
    },
    {
      category: 'certificate',
      question: 'How long is the certificate valid?',
      answer: '90 days, the script auto-renews 30 days before expiration.',
    },
    {
      category: 'certificate',
      question: 'Are there rate limits?',
      answer: 'Let\'s Encrypt limits 50 certificates per domain per week.',
    },
    {
      category: 'config',
      question: 'How to configure multiple domains?',
      answer: <>Use comma separation in config: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">DOMAINS</code>="example.com,www.example.com"</>,
    },
    {
      category: 'config',
      question: 'Does it support wildcard certificates?',
      answer: 'Yes, requires DNS API mode configuration.',
    },
    {
      category: 'usage',
      question: 'What is Dry-run mode?',
      answer: 'Test mode without actual certificate issuance: DRY_RUN=true ./renew-ssl-cert.sh',
    },
    {
      category: 'usage',
      question: 'How to view logs?',
      answer: <>Enable logging: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">ENABLE_LOG</code>=true, logs located at <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">{'${BASE_DIR}'}</code>/logs/</>,
    },
  ]

  const installationSteps: DocSection[] = language === 'zh' ? [
    {
      title: '前置要求',
      description: '确保服务器满足以下条件',
      content: `- Linux服务器（推荐 Ubuntu 20.04+ / CentOS 7+）
- 已安装 Docker 和 Docker Compose
- 域名已解析到服务器公网IP
- 80端口可访问（WebRoot验证模式）`,
      language: 'plaintext',
      filename: 'requirements',
    },
    {
      title: '下载 CertFlow',
      description: '获取最新版本',
      content: `curl -L https://github.com/freemankevin/CertFlow/releases/latest/download/certflow.tar.gz | tar -xz`,
      language: 'bash',
      filename: 'Terminal',
    },
    {
      title: '配置脚本',
      description: '编辑 renew-ssl-cert.sh 顶部配置区域',
      content: `DOMAIN="your.domain.com"
BASE_DIR="/data/opt/installmiddleware"
RELOAD_CMD="docker restart nginx"`,
      language: 'bash',
      filename: 'renew-ssl-cert.sh',
    },
    {
      title: '运行脚本',
      description: '执行并自动安装 acme.sh',
      content: `chmod +x renew-ssl-cert.sh
./renew-ssl-cert.sh`,
      language: 'bash',
      filename: 'Terminal',
    },
    {
      title: '设置定时续期',
      description: '添加 cron 任务',
      content: `crontab -e
# 添加：每天凌晨2点执行
0 2 * * * /path/to/renew-ssl-cert.sh >> /var/log/ssl-renewal.log 2>&1`,
      language: 'bash',
      filename: 'crontab',
    },
  ] : [
    {
      title: 'Prerequisites',
      description: 'Ensure your server meets these requirements',
      content: `- Linux server (Ubuntu 20.04+ / CentOS 7+ recommended)
- Docker and Docker Compose installed
- Domain DNS resolved to server public IP
- Port 80 accessible (WebRoot verification mode)`,
      language: 'plaintext',
      filename: 'requirements',
    },
    {
      title: 'Download CertFlow',
      description: 'Get the latest version',
      content: `curl -L https://github.com/freemankevin/CertFlow/releases/latest/download/certflow.tar.gz | tar -xz`,
      language: 'bash',
      filename: 'Terminal',
    },
    {
      title: 'Configure Script',
      description: 'Edit the config section at the top of renew-ssl-cert.sh',
      content: `DOMAIN="your.domain.com"
BASE_DIR="/data/opt/installmiddleware"
RELOAD_CMD="docker restart nginx"`,
      language: 'bash',
      filename: 'renew-ssl-cert.sh',
    },
    {
      title: 'Run Script',
      description: 'Execute and auto-install acme.sh',
      content: `chmod +x renew-ssl-cert.sh
./renew-ssl-cert.sh`,
      language: 'bash',
      filename: 'Terminal',
    },
    {
      title: 'Setup Auto Renewal',
      description: 'Add cron job',
      content: `crontab -e
# Add: run daily at 2 AM
0 2 * * * /path/to/renew-ssl-cert.sh >> /var/log/ssl-renewal.log 2>&1`,
      language: 'bash',
      filename: 'crontab',
    },
  ]

  const docLinks = [
    {
      icon: BookOpen,
      title: language === 'zh' ? '安装指南' : 'Installation Guide',
      description: language === 'zh' ? '详细的安装部署步骤' : 'Detailed installation steps',
      href: '#installation',
    },
    {
      icon: HelpCircle,
      title: language === 'zh' ? 'FAQ' : 'FAQ',
      description: language === 'zh' ? '常见问题解答' : 'Frequently asked questions',
      href: '#faq',
    },
    {
      icon: FolderOpen,
      title: language === 'zh' ? 'docs 目录' : 'docs Directory',
      description: language === 'zh' ? '本地文档文件' : 'Local documentation files',
      href: '/docs',
    },
  ]

  const tabs = [
    { id: 'faq', icon: HelpCircle, label: language === 'zh' ? '常见问题' : 'FAQ' },
    { id: 'installation', icon: BookOpen, label: language === 'zh' ? '安装指南' : 'Installation' },
    { id: 'docs', icon: FolderOpen, label: language === 'zh' ? '文档目录' : 'Docs Index' },
  ]

  return (
    <div className="animate-fade-in">
      <section className="py-12 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container-custom">
          <h1 className={`text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
            {language === 'zh' ? '帮助与文档' : 'Help & Documentation'}
          </h1>
          <p className={`text-gray-600 dark:text-gray-400 max-w-2xl ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
            {language === 'zh' ? '常见问题解答、安装指南和完整文档' : 'FAQ, installation guide, and complete documentation'}
          </p>
        </div>
      </section>

      <section className="py-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-ssl-blue text-white shadow-lg shadow-ssl-blue/25'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="container-custom">
          {activeTab === 'faq' && (
              <div className="space-y-4 animate-fade-in">
                {faqItems.map((item, index) => (
                  <div
                    key={index}
                    className="glass-card rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <span className={`text-base font-medium text-gray-900 dark:text-white ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                        {item.question}
                      </span>
                      {expandedFAQ === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-200/50 dark:border-gray-700/50">
                        <p className={`text-gray-700 dark:text-gray-300 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'installation' && (
              <div className="space-y-8 animate-fade-in">
                {installationSteps.map((step, index) => (
                  <div key={index} className="glass-card rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ssl-blue/10 dark:bg-ssl-blue/20 text-ssl-blue flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                        {step.title}
                      </h3>
                    </div>
                    <p className={`text-sm text-gray-600 dark:text-gray-400 mb-4 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                      {step.description}
                    </p>
                    <CodeBlock
                      code={step.content}
                      language={step.language}
                      filename={step.filename}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="space-y-6 animate-fade-in">
                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-6 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '文档目录' : 'Documentation Index'}
                  </h2>
                  <div className="grid gap-4">
                    {docLinks.map((link, index) => {
                      const Icon = link.icon
                      return (
                        <a
                          key={index}
                          href={link.href}
                          className="flex items-center gap-4 p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-ssl-blue/50 dark:hover:border-ssl-blue/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all group"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-ssl-blue/10 dark:bg-ssl-blue/20 flex items-center justify-center group-hover:bg-ssl-blue/20 dark:group-hover:bg-ssl-blue/30 transition-colors">
                            <Icon className="h-5 w-5 text-ssl-blue" />
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-base font-medium text-gray-900 dark:text-white ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                              {link.title}
                            </h3>
                            <p className={`text-sm text-gray-600 dark:text-gray-400 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                              {link.description}
                            </p>
                          </div>
                          <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-ssl-blue transition-colors" />
                        </a>
                      )
                    })}
                  </div>
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-6 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '外部链接' : 'External Links'}
                  </h2>
                  <div className="grid gap-3">
                    <a
                      href="https://github.com/freemankevin/CertFlow"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-ssl-blue hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className={language === 'zh' ? 'font-body-zh' : 'font-body'}>
                        {language === 'zh' ? 'GitHub 仓库' : 'GitHub Repository'}
                      </span>
                    </a>
                    <a
                      href="https://github.com/freemankevin/CertFlow/releases"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-ssl-blue hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className={language === 'zh' ? 'font-body-zh' : 'font-body'}>
                        {language === 'zh' ? '最新 Release' : 'Latest Release'}
                      </span>
                    </a>
                    <a
                      href="https://github.com/freemankevin/CertFlow/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-ssl-blue hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className={language === 'zh' ? 'font-body-zh' : 'font-body'}>
                        {language === 'zh' ? '问题反馈' : 'Issue Tracker'}
                      </span>
                    </a>
                  </div>
                </div>
              </div>
)}
        </div>
      </section>
    </div>
  )
}