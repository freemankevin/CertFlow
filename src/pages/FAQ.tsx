import { useState, ReactNode } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, BookOpen, ExternalLink, Shield, Settings, Play } from 'lucide-react'
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
    { category: 'certificate', question: '支持哪些证书颁发机构？', answer: <>默认使用 Let's Encrypt，同时也支持 ZeroSSL 和 Buypass。通过修改 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">CA_SERVER</code> 参数切换。</> },
    { category: 'certificate', question: '证书有效期多久？', answer: '90天。脚本会在到期前30天自动续期，如果证书仍然有效则会跳过。' },
    { category: 'certificate', question: '申请频率有限制吗？', answer: "Let's Encrypt 限制每周每域名50个证书。建议合理规划证书申请。" },
    { category: 'config', question: '如何配置多个域名？', answer: <>在 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">DOMAINS</code> 中用逗号分隔：example.com,www.example.com</> },
    { category: 'config', question: '支持泛域名证书吗？', answer: <>支持。设置 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">VERIFY_MODE="dns"</code> 并配置 DNS API。</> },
    { category: 'config', question: '如何切换 CA 机构？', answer: <>修改 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">CA_SERVER</code> 为 letsencrypt / zerossl / buypass。</> },
    { category: 'usage', question: 'Dry-run 模式是什么？', answer: <>测试模式，模拟流程但不实际申请证书：<code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">DRY_RUN=true ./renew-ssl-cert.sh</code></> },
    { category: 'usage', question: '如何查看日志？', answer: <>启用日志：<code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">ENABLE_LOG=true</code>，日志位于 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">${'{BASE_DIR}'}/logs/</code></> },
    { category: 'usage', question: '使用 CDN 时 DNS 检查失败？', answer: <>设置 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">SKIP_DNS_CHECK=true</code> 跳过 DNS 解析验证。</> },
  ] : [
    { category: 'certificate', question: 'Which certificate authorities are supported?', answer: <>Default is Let's Encrypt, also supports ZeroSSL and Buypass. Switch via <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">CA_SERVER</code> parameter.</> },
    { category: 'certificate', question: 'How long is the certificate valid?', answer: '90 days. The script auto-renews 30 days before expiration, skipping if still valid.' },
    { category: 'certificate', question: 'Are there rate limits?', answer: "Let's Encrypt limits 50 certificates per domain per week. Plan accordingly." },
    { category: 'config', question: 'How to configure multiple domains?', answer: <>Use comma separation in <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">DOMAINS</code>: example.com,www.example.com</> },
    { category: 'config', question: 'Does it support wildcard certificates?', answer: <>Yes. Set <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">VERIFY_MODE="dns"</code> and configure DNS API.</> },
    { category: 'config', question: 'How to switch CA?', answer: <>Change <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">CA_SERVER</code> to letsencrypt / zerossl / buypass.</> },
    { category: 'usage', question: 'What is Dry-run mode?', answer: <>Test mode without actual issuance: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">DRY_RUN=true ./renew-ssl-cert.sh</code></> },
    { category: 'usage', question: 'How to view logs?', answer: <>Enable logging: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">ENABLE_LOG=true</code>, logs at <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">${'{BASE_DIR}'}/logs/</code></> },
    { category: 'usage', question: 'DNS check fails with CDN?', answer: <>Set <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-900 font-mono text-xs">SKIP_DNS_CHECK=true</code> to skip DNS verification.</> },
  ]

  const installationSteps: DocSection[] = language === 'zh' ? [
    { title: '前置要求', description: '确保服务器满足以下条件', content: `- Linux服务器（推荐 Ubuntu 20.04+ / CentOS 7+）
- 已安装 Docker 和 Docker Compose
- 域名已解析到服务器公网IP
- 80端口可访问（WebRoot验证模式）`, language: 'plaintext', filename: 'requirements' },
    { title: '下载 CertFlow', description: '获取最新版本', content: `curl -L https://github.com/freemankevin/CertFlow/releases/latest/download/certflow.tar.gz | tar -xz`, language: 'bash', filename: 'Terminal' },
    { title: '配置脚本', description: '编辑 ssl-cert.conf 配置文件', content: `cp ssl-cert.conf.example ssl-cert.conf
nano ssl-cert.conf`, language: 'bash', filename: 'Terminal' },
    { title: '运行脚本', description: '执行并自动安装 acme.sh', content: `chmod +x renew-ssl-cert.sh
./renew-ssl-cert.sh`, language: 'bash', filename: 'Terminal' },
    { title: '设置定时续期', description: '添加 cron 任务', content: `crontab -e
# 添加：每天凌晨2点执行
0 2 * * * /path/to/renew-ssl-cert.sh >> /var/log/ssl-renewal.log 2>&1`, language: 'bash', filename: 'crontab' },
  ] : [
    { title: 'Prerequisites', description: 'Ensure your server meets these requirements', content: `- Linux server (Ubuntu 20.04+ / CentOS 7+ recommended)
- Docker and Docker Compose installed
- Domain DNS resolved to server public IP
- Port 80 accessible (WebRoot verification mode)`, language: 'plaintext', filename: 'requirements' },
    { title: 'Download CertFlow', description: 'Get the latest version', content: `curl -L https://github.com/freemankevin/CertFlow/releases/latest/download/certflow.tar.gz | tar -xz`, language: 'bash', filename: 'Terminal' },
    { title: 'Configure Script', description: 'Edit the ssl-cert.conf config file', content: `cp ssl-cert.conf.example ssl-cert.conf
nano ssl-cert.conf`, language: 'bash', filename: 'Terminal' },
    { title: 'Run Script', description: 'Execute and auto-install acme.sh', content: `chmod +x renew-ssl-cert.sh
./renew-ssl-cert.sh`, language: 'bash', filename: 'Terminal' },
    { title: 'Setup Auto Renewal', description: 'Add cron job', content: `crontab -e
# Add: run daily at 2 AM
0 2 * * * /path/to/renew-ssl-cert.sh >> /var/log/ssl-renewal.log 2>&1`, language: 'bash', filename: 'crontab' },
  ]

  const docLinks = [
    { icon: BookOpen, title: language === 'zh' ? '完整文档' : 'Full Documentation', description: language === 'zh' ? '详细的配置和使用说明' : 'Detailed configuration and usage guide', href: '/' },
    { icon: ExternalLink, title: language === 'zh' ? 'GitHub 仓库' : 'GitHub Repository', description: language === 'zh' ? '源代码和 Issue 追踪' : 'Source code and issue tracking', href: 'https://github.com/freemankevin/CertFlow' },
    { icon: ExternalLink, title: language === 'zh' ? '最新 Release' : 'Latest Release', description: language === 'zh' ? '下载最新版本' : 'Download the latest version', href: 'https://github.com/freemankevin/CertFlow/releases' },
  ]

  const tabs = [
    { id: 'faq', icon: HelpCircle, label: language === 'zh' ? '常见问题' : 'FAQ' },
    { id: 'installation', icon: Play, label: language === 'zh' ? '安装指南' : 'Installation' },
    { id: 'docs', icon: BookOpen, label: language === 'zh' ? '相关链接' : 'Links' },
  ]

  const categories: Record<string, { icon: React.ElementType; label: string }> = language === 'zh' ? {
    certificate: { icon: Shield, label: '证书' },
    config: { icon: Settings, label: '配置' },
    usage: { icon: Play, label: '使用' },
  } : {
    certificate: { icon: Shield, label: 'Certificate' },
    config: { icon: Settings, label: 'Config' },
    usage: { icon: Play, label: 'Usage' },
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      <div className="py-10 lg:py-12">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-3 flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-gray-400" />
            {language === 'zh' ? '帮助中心' : 'Help Center'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            {language === 'zh'
              ? '常见问题解答、安装指南和相关资源链接。'
              : 'FAQ, installation guide, and related resource links.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-black dark:text-gray-400 dark:border-gray-800 dark:hover:bg-gray-900'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="max-w-3xl">
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {faqItems.map((item, index) => {
                const category = categories[item.category]
                const Icon = category.icon
                const isExpanded = expandedFAQ === index
                return (
                  <div
                    key={index}
                    className={cn(
                      'rounded-xl border overflow-hidden transition-all duration-200',
                      isExpanded
                        ? 'border-gray-300 dark:border-gray-700 bg-white dark:bg-black'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:border-gray-300 dark:hover:border-gray-700'
                    )}
                  >
                    <button
                      onClick={() => setExpandedFAQ(isExpanded ? null : index)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.question}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-0">
                        <div className="pl-7 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.answer}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'installation' && (
            <div className="space-y-6">
              {installationSteps.map((step, index) => (
                <div key={index} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <CodeBlock code={step.content} language={step.language} filename={step.filename} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-4">
              {docLinks.map((link, index) => {
                const Icon = link.icon
                const isExternal = link.href.startsWith('http')
                return (
                  <a
                    key={index}
                    href={link.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:border-gray-400 dark:hover:border-gray-600 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {link.description}
                      </p>
                    </div>
                    {isExternal && (
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    )}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
