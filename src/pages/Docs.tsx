import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useI18n } from '../contexts/I18nContext'
import { CodeBlock } from '../components/CodeBlock'
import { cn } from '../lib/utils'
import { Menu, ChevronRight, Cloud, Server, Bell, Code, Info, AlertTriangle, Lightbulb } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloudflare, faAws, faSlack, faDiscord, faWeixin } from '@fortawesome/free-brands-svg-icons'

/* ──────────────── 数据：导航结构（支持 i18n） ──────────────── */

interface NavItem {
  id: string
  label: string
  children?: NavItem[]
}

function useNavData(isZh: boolean): NavItem[] {
  return useMemo(
    () => [
      {
        id: 'overview',
        label: isZh ? '概览' : 'Overview',
        children: [
          { id: 'features', label: isZh ? '功能特性' : 'Features' },
          { id: 'prerequisites', label: isZh ? '前置要求' : 'Prerequisites' },
        ],
      },
      {
        id: 'quickstart',
        label: isZh ? '快速开始' : 'Quick Start',
        children: [
          { id: 'download', label: isZh ? '下载安装' : 'Download & Install' },
          { id: 'config', label: isZh ? '配置文件' : 'Configuration' },
          { id: 'run', label: isZh ? '执行脚本' : 'Run Script' },
        ],
      },
      {
        id: 'configuration',
        label: isZh ? '配置说明' : 'Configuration',
        children: [
          { id: 'core-config', label: isZh ? '核心配置' : 'Core Config' },
          { id: 'verify-config', label: isZh ? '验证模式' : 'Verification' },
          { id: 'advanced-config', label: isZh ? '高级选项' : 'Advanced' },
        ],
      },
      {
        id: 'verification',
        label: isZh ? '验证模式' : 'Verification Modes',
        children: [
          { id: 'webroot-mode', label: isZh ? 'WebRoot 验证' : 'WebRoot' },
          { id: 'dns-mode', label: isZh ? 'DNS-API 验证' : 'DNS-API' },
          { id: 'dns-providers', label: isZh ? 'DNS 提供商' : 'DNS Providers' },
        ],
      },
      {
        id: 'webhook',
        label: isZh ? 'Webhook 通知' : 'Webhook',
        children: [
          { id: 'webhook-config', label: isZh ? '配置方法' : 'Setup' },
          { id: 'webhook-types', label: isZh ? '通知类型' : 'Types' },
        ],
      },
      {
        id: 'docker',
        label: isZh ? 'Docker 部署' : 'Docker',
        children: [
          { id: 'docker-install', label: isZh ? '环境安装' : 'Installation' },
          { id: 'docker-download', label: isZh ? '下载配置' : 'Download Config' },
          { id: 'docker-compose', label: isZh ? 'Compose 配置' : 'Compose' },
          { id: 'nginx-config', label: isZh ? 'Nginx 配置' : 'Nginx Config' },
        ],
      },
      {
        id: 'faq',
        label: isZh ? '常见问题' : 'FAQ',
        children: [
          { id: 'faq-cert', label: isZh ? '证书申请' : 'Certificates' },
          { id: 'faq-config', label: isZh ? '配置相关' : 'Configuration' },
          { id: 'faq-usage', label: isZh ? '使用问题' : 'Usage' },
        ],
      },
    ],
    [isZh]
  )
}

/* ──────────────── 数据：代码示例 ──────────────── */

const CODE_DOWNLOAD = `curl -L https://github.com/freemankevin/CertFlow/releases/latest/download/certflow.tar.gz | tar -xz

cd certflow
chmod +x renew-ssl-cert.sh`

const CODE_CONFIG = `cp ssl-cert.conf.example ssl-cert.conf
nano ssl-cert.conf`

const CODE_CONFIG_EXAMPLE = `#==============================================
# 核心配置（必填）
#==============================================

# 域名配置（支持多域名，逗号或空格分隔）
DOMAINS="example.com,www.example.com"

# 基础路径
BASE_DIR="/data/opt/installmiddleware"

# acme.sh 路径
ACME_SH="\${HOME}/.acme.sh/acme.sh"

# 证书更新后执行的命令
RELOAD_CMD="docker restart nginx"

#==============================================
# 验证模式配置
#==============================================

# 验证模式: "webroot" 或 "dns"
VERIFY_MODE="webroot"

# DNS API 提供商（VERIFY_MODE=dns 时必填）
DNS_API_PROVIDER="dns_cf"

# DNS API 密钥
DNS_API_KEY="your_api_key"
DNS_API_SECRET="your_api_secret"

#==============================================
# 通知配置（可选）
#==============================================

# Webhook 通知 URL
WEBHOOK_URL=""

# Webhook 类型: wechat / dingtalk / slack / discord / custom
WEBHOOK_TYPE="wechat"`

const CODE_RUN = `# 首次运行（自动安装 acme.sh）
./renew-ssl-cert.sh

# 测试模式（不实际申请证书）
DRY_RUN=true ./renew-ssl-cert.sh

# 设置定时任务（每日自动检查）
crontab -e
# 添加: 0 2 * * * /path/to/renew-ssl-cert.sh`

const CODE_WEBROOT_NGINX = `server {
    listen 80;
    server_name example.com www.example.com;

    location /.well-known/acme-challenge/ {
        root /data/opt/installmiddleware/html;
    }
}`

const CODE_DOCKER_INSTALL = `# 获取最新版本
VERSION=$(curl -s https://api.github.com/repos/freemankevin/docker-offline/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\\1/')

# 下载离线安装包
wget https://github.com/freemankevin/docker-offline/releases/download/\${VERSION}/docker-offline-\${VERSION}.tar.gz

# 解压并安装
tar -xzf docker-offline-\${VERSION}.tar.gz
cd docker-offline-\${VERSION}
sudo bash packages/scripts/install.sh`

const CODE_DOCKER_DOWNLOAD = `# 创建项目目录
mkdir -p installnginx/conf && cd installnginx

# 下载 docker-compose.yml 和 Nginx 配置
curl -L -o docker-compose.yml https://github.com/freemankevin/CertFlow/raw/main/docker-compose.yml
curl -L -o conf/web.conf https://github.com/freemankevin/CertFlow/raw/main/conf/web.conf

# 修改域名占位符（将 example.com 替换为你的实际域名）
sed -i 's/your.domain.com/example.com/g' conf/web.conf

# 根据实际业务修改 upstream 和 location 路由规则
nano conf/web.conf`

const CODE_DOCKER_COMPOSE = `docker compose up -d

# 查看状态
docker compose ps`

/* ──────────────── 组件：左侧导航 ──────────────── */

function Sidebar({
  activeId,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  navData,
}: {
  activeId: string
  onNavigate: (id: string) => void
  mobileOpen: boolean
  onCloseMobile: () => void
  navData: NavItem[]
}) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(navData.map((n) => n.id))
  )

  const toggleGroup = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-14 left-0 bottom-0 z-40 w-64',
          'bg-white dark:bg-[#0B0F19] border-r border-gray-200 dark:border-gray-800/40',
          'overflow-y-auto scrollbar-thin transition-transform duration-200',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="px-4 py-5">
          <ul className="space-y-1">
            {navData.map((group) => (
              <li key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center w-full px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 mr-1.5 text-gray-400 dark:text-gray-600 transition-transform',
                      expanded.has(group.id) && 'rotate-90'
                    )}
                  />
                  {group.label}
                </button>
                {expanded.has(group.id) && group.children && (
                  <ul className="mt-1 ml-5 space-y-0.5 border-l border-gray-200 dark:border-gray-800/40 pl-2">
                    {group.children.map((child) => (
                      <li key={child.id}>
                        <button
                          onClick={() => {
                            onNavigate(child.id)
                            onCloseMobile()
                          }}
                          className={cn(
                            'block w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors',
                            activeId === child.id
                              ? 'bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-gray-100 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5'
                          )}
                        >
                          {child.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

/* ──────────────── 组件：内容区块 ──────────────── */

function Section({
  id,
  title,
  children,
  level = 2,
}: {
  id: string
  title: string
  children: React.ReactNode
  level?: 1 | 2 | 3
}) {
  const Tag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3'
  const titleClass =
    level === 1
      ? 'text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6'
      : level === 2
      ? 'text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mt-14 mb-4'
      : 'text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100 mt-8 mb-3'

  return (
    <section id={id} className="scroll-mt-24">
      <Tag className={titleClass}>{title}</Tag>
      {children}
    </section>
  )
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
      {children}
    </p>
  )
}

function Callout({
  type = 'note',
  children,
}: {
  type?: 'note' | 'tip' | 'important' | 'warning' | 'caution'
  children: React.ReactNode
}) {
  const styles = {
    note: {
      border: 'border-l-blue-400 dark:border-l-blue-600',
      icon: <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />,
      title: 'Note',
      text: 'text-blue-900 dark:text-blue-100',
    },
    tip: {
      border: 'border-l-green-400 dark:border-l-green-600',
      icon: <Lightbulb className="h-4 w-4 text-green-500 dark:text-green-400" />,
      title: 'Tip',
      text: 'text-green-900 dark:text-green-100',
    },
    important: {
      border: 'border-l-purple-400 dark:border-l-purple-600',
      icon: <Info className="h-4 w-4 text-purple-500 dark:text-purple-400" />,
      title: 'Important',
      text: 'text-purple-900 dark:text-purple-100',
    },
    warning: {
      border: 'border-l-amber-400 dark:border-l-amber-600',
      icon: <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />,
      title: 'Warning',
      text: 'text-amber-900 dark:text-amber-100',
    },
    caution: {
      border: 'border-l-red-400 dark:border-l-red-600',
      icon: <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />,
      title: 'Caution',
      text: 'text-red-900 dark:text-red-100',
    },
  }

  const s = styles[type]

  return (
    <div
      className={cn(
        'rounded-r-md border-y border-r border-gray-200 dark:border-gray-800/60',
        'bg-gray-50/50 dark:bg-gray-900/30',
        'border-l-4 mb-6',
        s.border
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          {s.icon}
          <span className={cn('text-xs font-semibold uppercase tracking-wide', s.text)}>
            {s.title}
          </span>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

function Table({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800/40">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-gray-100 dark:border-gray-800/30 last:border-0"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="py-2.5 px-3 text-gray-700 dark:text-gray-300 align-top"
                >
                  {ci === 0 ? (
                    <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 font-mono text-xs text-gray-800 dark:text-gray-200">
                      {cell}
                    </code>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LogoGrid({
  items,
}: {
  items: {
    icon: React.ReactNode
    name: string
    value: string
    detail: string
  }[]
}) {
  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800/30">
      {items.map((item, index) => (
        <div
          key={item.value}
          className={cn(
            'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/20',
            index !== items.length - 1 && 'border-b border-gray-100 dark:border-gray-800/30'
          )}
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {item.icon}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[100px] sm:min-w-[140px]">
            {item.name}
          </span>
          <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs text-gray-600 dark:text-gray-400">
            {item.value}
          </code>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto hidden sm:inline">
            {item.detail}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ──────────────── 主页面 ──────────────── */

export function DocsPage() {
  const { language } = useI18n()
  const isZh = language === 'zh'
  const navData = useNavData(isZh)

  const [activeId, setActiveId] = useState('features')
  const [mobileOpen, setMobileOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const allIds = useMemo(
    () => navData.flatMap((g) => (g.children ? g.children.map((c) => c.id) : [])),
    [navData]
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  /* IntersectionObserver for active nav tracking */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )

    allIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [allIds])

  const handleNavigate = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] transition-colors">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-14 z-30 bg-white dark:bg-[#0B0F19] border-b border-gray-200 dark:border-gray-800/40 px-4 py-3 flex items-center gap-3 transition-colors">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {navData
            .flatMap((g) => g.children || [])
            .find((c) => c.id === activeId)?.label || (isZh ? '文档' : 'Docs')}
        </span>
      </div>

      <Sidebar
        activeId={activeId}
        onNavigate={handleNavigate}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        navData={navData}
      />

      {/* Main content */}
      <main ref={contentRef} className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-6 py-10 lg:py-16">
          {/* ─── 概览 ─── */}
          <Section
            id="features"
            title={isZh ? '功能特性' : 'Features'}
            level={1}
          >
            <Paragraph>
              {isZh
                ? 'CertFlow 是一个基于 acme.sh 的自动化 SSL 证书续期工具，支持 WebRoot 和 DNS-API 双验证模式，专为服务器运维场景设计。'
                : 'CertFlow is an automated SSL certificate renewal tool built on acme.sh, supporting both WebRoot and DNS-API verification modes, designed for server operations.'}
            </Paragraph>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                isZh ? '单文件脚本，零依赖开箱即用' : 'Single-file script, zero dependencies',
                isZh ? 'WebRoot / DNS-API 双验证模式' : 'WebRoot / DNS-API dual verification',
                isZh ? '智能续期：仅到期前 30 天申请' : 'Smart renewal: only 30 days before expiry',
                isZh ? '多域名批量处理' : 'Multi-domain batch processing',
                isZh ? 'Docker / Nginx 自动重载' : 'Docker / Nginx auto reload',
                isZh ? 'Webhook 通知（微信/钉钉/Slack/Discord）' : 'Webhook notifications',
                isZh ? '证书自动备份' : 'Automatic certificate backup',
                isZh ? '彩色结构化日志输出' : 'Colored structured log output',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-900 dark:bg-gray-100 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            id="prerequisites"
            title={isZh ? '前置要求' : 'Prerequisites'}
          >
            <ul className="list-disc list-outside ml-5 mb-6 space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                {isZh
                  ? 'Linux 服务器（推荐 Ubuntu 20.04+ / Debian 11+ / CentOS 7+）'
                  : 'Linux server (Ubuntu 20.04+ / Debian 11+ / CentOS 7+ recommended)'}
              </li>
              <li>
                {isZh
                  ? '已安装 curl、openssl'
                  : 'curl and openssl installed'}
              </li>
              <li>
                {isZh
                  ? '域名已解析到服务器公网 IP（WebRoot 模式）'
                  : 'Domain resolved to server public IP (WebRoot mode)'}
              </li>
              <li>
                {isZh
                  ? '80 端口可访问（WebRoot 验证需要）'
                  : 'Port 80 accessible (WebRoot verification required)'}
              </li>
              <li>
                {isZh
                  ? 'Docker & Docker Compose（如使用容器部署）'
                  : 'Docker & Docker Compose (if using container deployment)'}
              </li>
            </ul>
          </Section>

          {/* ─── 快速开始 ─── */}
          <Section
            id="download"
            title={isZh ? '下载安装' : 'Download & Install'}
            level={2}
          >
            <Paragraph>
              {isZh
                ? '从 GitHub Releases 下载最新版本并解压到目标目录。'
                : 'Download the latest release from GitHub and extract to your target directory.'}
            </Paragraph>
            <CodeBlock code={CODE_DOWNLOAD} language="bash" filename="Terminal" />
          </Section>

          <Section id="config" title={isZh ? '配置文件' : 'Configuration'}>
            <Paragraph>
              {isZh
                ? '复制配置文件模板并修改核心参数。必填项仅有 DOMAINS、BASE_DIR、RELOAD_CMD 三个。'
                : 'Copy the config template and modify core parameters. Only DOMAINS, BASE_DIR, and RELOAD_CMD are required.'}
            </Paragraph>
            <CodeBlock code={CODE_CONFIG} language="bash" filename="Terminal" />
            <div className="mt-4">
              <CodeBlock
                code={CODE_CONFIG_EXAMPLE}
                language="bash"
                filename="ssl-cert.conf"
              />
            </div>
          </Section>

          <Section id="run" title={isZh ? '执行脚本' : 'Run Script'}>
            <Paragraph>
              {isZh
                ? '首次运行会自动安装 acme.sh（如未安装），并申请证书。'
                : 'First run will auto-install acme.sh (if not installed) and request certificates.'}
            </Paragraph>
            <Callout type="note">
              {isZh
                ? 'acme.sh 无需预先安装，脚本首次运行时会自动检测并安装。'
                : 'acme.sh does not need to be pre-installed; the script auto-installs it on first run.'}
            </Callout>
            <CodeBlock code={CODE_RUN} language="bash" filename="Terminal" />
          </Section>

          {/* ─── 配置说明 ─── */}
          <Section
            id="core-config"
            title={isZh ? '核心配置' : 'Core Configuration'}
            level={2}
          >
            <Paragraph>
              {isZh
                ? '以下三个配置项为必填项，其他均为可选项。'
                : 'The following three settings are required; all others are optional.'}
            </Paragraph>
            <Table
              headers={[
                isZh ? '配置项' : 'Variable',
                isZh ? '说明' : 'Description',
                isZh ? '示例' : 'Example',
              ]}
              rows={[
                [
                  'DOMAINS',
                  isZh ? '待续期的域名列表' : 'Domains to renew',
                  'example.com,www.example.com',
                ],
                [
                  'BASE_DIR',
                  isZh ? '基础工作目录' : 'Base working directory',
                  '/data/opt/installmiddleware',
                ],
                [
                  'RELOAD_CMD',
                  isZh ? '证书更新后执行的命令' : 'Command after cert update',
                  'docker restart nginx',
                ],
                [
                  'CERT_DIR',
                  isZh ? '证书存放目录' : 'Certificate directory',
                  '${BASE_DIR}/certs',
                ],
                [
                  'WEBROOT_DIR',
                  isZh ? 'WebRoot 验证目录' : 'WebRoot directory',
                  '${BASE_DIR}/html',
                ],
                [
                  'ACME_SH',
                  isZh ? 'acme.sh 路径' : 'acme.sh path',
                  '${HOME}/.acme.sh/acme.sh',
                ],
              ]}
            />
          </Section>

          <Section
            id="verify-config"
            title={isZh ? '验证模式配置' : 'Verification Mode'}
          >
            <Paragraph>
              {isZh
                ? 'CertFlow 支持两种验证模式，根据你的网络环境选择合适的方式。'
                : 'CertFlow supports two verification modes; choose based on your network environment.'}
            </Paragraph>
            <Table
              headers={[
                isZh ? '配置项' : 'Variable',
                isZh ? '说明' : 'Description',
                isZh ? '可选值' : 'Options',
              ]}
              rows={[
                [
                  'VERIFY_MODE',
                  isZh ? '验证模式' : 'Verification mode',
                  'webroot / dns',
                ],
                [
                  'DNS_API_PROVIDER',
                  isZh ? 'DNS API 提供商' : 'DNS API provider',
                  'dns_ali / dns_cf / dns_dp / dns_aws',
                ],
                [
                  'DNS_API_KEY',
                  isZh ? 'DNS API 密钥' : 'DNS API key',
                  'your_api_key',
                ],
                [
                  'DNS_API_SECRET',
                  isZh ? 'DNS API 密钥/Secret' : 'DNS API secret',
                  'your_api_secret',
                ],
              ]}
            />
          </Section>

          <Section
            id="advanced-config"
            title={isZh ? '高级选项' : 'Advanced Options'}
          >
            <Table
              headers={[
                isZh ? '配置项' : 'Variable',
                isZh ? '说明' : 'Description',
                isZh ? '默认值' : 'Default',
              ]}
              rows={[
                ['CERT_KEY_LENGTH', isZh ? '证书密钥长度' : 'Key length', '2048'],
                [
                  'CA_SERVER',
                  isZh ? '证书颁发机构' : 'Certificate authority',
                  'letsencrypt',
                ],
                [
                  'RENEW_THRESHOLD_DAYS',
                  isZh ? '续期阈值天数' : 'Renewal threshold days',
                  '30',
                ],
                [
                  'ENABLE_LOG',
                  isZh ? '是否启用日志文件' : 'Enable log file',
                  'false',
                ],
                [
                  'LOG_DIR',
                  isZh ? '日志目录' : 'Log directory',
                  '${BASE_DIR}/logs',
                ],
                [
                  'DRY_RUN',
                  isZh ? '测试模式' : 'Dry run mode',
                  'false',
                ],
                [
                  'SKIP_DNS_CHECK',
                  isZh ? '跳过域名解析检查' : 'Skip DNS check',
                  'false',
                ],
                [
                  'AUTO_UPDATE_NGINX_DOMAIN',
                  isZh ? '自动更新 Nginx 配置域名' : 'Auto update Nginx domain',
                  'false',
                ],
                [
                  'NGINX_CONF_PATH',
                  isZh ? 'Nginx 配置文件路径' : 'Nginx config path',
                  '',
                ],
              ]}
            />
          </Section>

          {/* ─── 验证模式 ─── */}
          <Section
            id="webroot-mode"
            title={isZh ? 'WebRoot 验证' : 'WebRoot Verification'}
            level={2}
          >
            <Paragraph>
              {isZh
                ? 'WebRoot 验证是最常用的方式，通过在你的 Web 服务器上创建一个特定文件来证明你对域名的控制权。要求 80 端口可访问，且 Nginx 已配置 ACME 验证路径。'
                : 'WebRoot is the most common method. It proves domain ownership by serving a specific file via your web server. Requires port 80 to be accessible.'}
            </Paragraph>
            <Callout type="note">
              {isZh
                ? '脚本会自动创建 /.well-known/acme-challenge/ 目录并测试验证路径是否可达。'
                : 'The script auto-creates the /.well-known/acme-challenge/ directory and tests if the verification path is accessible.'}
            </Callout>
            <CodeBlock
              code={CODE_WEBROOT_NGINX}
              language="nginx"
              filename="nginx.conf"
            />
          </Section>

          <Section
            id="dns-mode"
            title={isZh ? 'DNS-API 验证' : 'DNS-API Verification'}
          >
            <Paragraph>
              {isZh
                ? 'DNS 验证通过 API 自动添加 DNS TXT 记录来证明域名所有权，适合内网服务、泛域名证书或无法开放 80 端口的场景。'
                : 'DNS verification proves ownership by automatically adding DNS TXT records via API. Suitable for internal services, wildcard certificates, or when port 80 is unavailable.'}
            </Paragraph>
            <Paragraph>
              {isZh
                ? '配置 VERIFY_MODE="dns" 后，脚本会根据 DNS_API_PROVIDER 设置对应的环境变量，并调用 acme.sh 的 DNS 验证流程。'
                : 'After setting VERIFY_MODE="dns", the script sets environment variables based on DNS_API_PROVIDER and invokes acme.sh DNS verification.'}
            </Paragraph>
          </Section>

          <Section
            id="dns-providers"
            title={isZh ? '支持的 DNS 提供商' : 'Supported DNS Providers'}
          >
            <LogoGrid
              items={[
                {
                  icon: <Cloud className="h-5 w-5 text-[#FF6A00]" />,
                  name: isZh ? '阿里云' : 'Alibaba Cloud',
                  value: 'dns_ali',
                  detail: 'Ali_Key / Ali_Secret',
                },
                {
                  icon: <FontAwesomeIcon icon={faCloudflare} className="text-[#F38020] text-lg" />,
                  name: 'Cloudflare',
                  value: 'dns_cf',
                  detail: 'CF_Key / CF_Email',
                },
                {
                  icon: <Server className="h-5 w-5 text-[#0052D9]" />,
                  name: 'DNSPod',
                  value: 'dns_dp',
                  detail: 'DP_Id / DP_Key',
                },
                {
                  icon: <FontAwesomeIcon icon={faAws} className="text-[#FF9900] text-lg" />,
                  name: 'AWS Route53',
                  value: 'dns_aws',
                  detail: 'AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY',
                },
              ]}
            />
          </Section>

          {/* ─── Webhook 通知 ─── */}
          <Section
            id="webhook-config"
            title={isZh ? 'Webhook 配置' : 'Webhook Configuration'}
            level={2}
          >
            <Paragraph>
              {isZh
                ? '配置 WEBHOOK_URL 后，每次证书申请、安装、失败时都会自动发送通知。'
                : 'When WEBHOOK_URL is configured, notifications are automatically sent on certificate issuance, installation, or failure.'}
            </Paragraph>
            <CodeBlock
              code={`WEBHOOK_URL="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
WEBHOOK_TYPE="wechat"`}
              language="bash"
              filename="ssl-cert.conf"
            />
          </Section>

          <Section
            id="webhook-types"
            title={isZh ? '支持的通知类型' : 'Supported Notification Types'}
          >
            <LogoGrid
              items={[
                {
                  icon: <FontAwesomeIcon icon={faWeixin} className="text-[#07C160] text-lg" />,
                  name: 'WeChat',
                  value: 'wechat',
                  detail: isZh ? '企业微信 / 微信群机器人' : 'WeChat Work / group bot',
                },
                {
                  icon: <Bell className="h-5 w-5 text-[#3370FF]" />,
                  name: 'DingTalk',
                  value: 'dingtalk',
                  detail: isZh ? '钉钉群机器人' : 'DingTalk group bot',
                },
                {
                  icon: <FontAwesomeIcon icon={faSlack} className="text-[#E01E5A] text-lg" />,
                  name: 'Slack',
                  value: 'slack',
                  detail: 'Slack Incoming Webhook',
                },
                {
                  icon: <FontAwesomeIcon icon={faDiscord} className="text-[#5865F2] text-lg" />,
                  name: 'Discord',
                  value: 'discord',
                  detail: 'Discord Webhook',
                },
                {
                  icon: <Code className="h-5 w-5 text-gray-500 dark:text-gray-400" />,
                  name: isZh ? '自定义' : 'Custom',
                  value: 'custom',
                  detail: isZh ? '自定义 JSON 格式' : 'Custom JSON format',
                },
              ]}
            />
          </Section>

          {/* ─── Docker 部署 ─── */}
          <Section
            id="docker-install"
            title={isZh ? 'Docker 环境安装' : 'Docker Installation'}
            level={2}
          >
            <Paragraph>
              {isZh
                ? '如果服务器尚未安装 Docker，可以使用离线安装包快速部署。'
                : 'If Docker is not installed on your server, you can use the offline package for quick deployment.'}
            </Paragraph>
            <CodeBlock
              code={CODE_DOCKER_INSTALL}
              language="bash"
              filename="Terminal"
            />
          </Section>

          <Section
            id="docker-download"
            title={isZh ? '下载配置文件' : 'Download Configuration Files'}
          >
            <Paragraph>
              {isZh
                ? '在启动 Nginx 之前，需要先下载 docker-compose.yml 和 Nginx 配置文件，并根据实际域名和业务路由进行修改。'
                : 'Before starting Nginx, download docker-compose.yml and the Nginx config, then update the domain and routing rules.'}
            </Paragraph>
            <Callout type="note">
              {isZh
                ? 'conf/web.conf 中的 upstream、server_name、location 路由规则都需要根据你的实际业务环境进行调整。'
                : 'The upstream, server_name, and location rules in conf/web.conf must be adjusted to match your actual environment.'}
            </Callout>
            <Callout type="warning">
              {isZh
                ? '首次部署时，如果 Nginx 配置文件中的 server_name 还是 your.domain.com 占位符，可设置 AUTO_UPDATE_NGINX_DOMAIN=true 让脚本自动替换。'
                : 'On first deployment, if server_name is still a placeholder, set AUTO_UPDATE_NGINX_DOMAIN=true to auto-replace it.'}
            </Callout>
            <CodeBlock
              code={CODE_DOCKER_DOWNLOAD}
              language="bash"
              filename="Terminal"
            />
          </Section>

          <Section
            id="docker-compose"
            title={isZh ? '启动服务' : 'Start Services'}
          >
            <Paragraph>
              {isZh
                ? '配置文件准备完成后，使用 docker-compose.yml 启动 Nginx 容器，证书目录通过卷挂载到容器内。'
                : 'After preparing the configuration files, start the Nginx container using docker-compose.yml, with certificate directories mounted via volumes.'}
            </Paragraph>
            <CodeBlock
              code={CODE_DOCKER_COMPOSE}
              language="bash"
              filename="Terminal"
            />
          </Section>

          <Section
            id="nginx-config"
            title={isZh ? 'Nginx 配置要点' : 'Nginx Configuration'}
          >
            <Paragraph>
              {isZh
                ? '部署时需确保 Nginx 配置包含 ACME 验证路径，且 server_name 与 DOMAINS 一致。'
                : 'Ensure your Nginx config includes the ACME verification path and server_name matches DOMAINS.'}
            </Paragraph>
          </Section>

          {/* ─── FAQ ─── */}
          <Section
            id="faq-cert"
            title={isZh ? '证书申请相关' : 'Certificate Application'}
            level={2}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isZh ? '支持哪些证书颁发机构？' : 'Which CAs are supported?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {isZh
                    ? "默认使用 Let's Encrypt，也支持 ZeroSSL、Buypass。通过 CA_SERVER 配置切换。"
                    : "Default is Let's Encrypt, also supports ZeroSSL and Buypass. Switch via CA_SERVER config."}
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isZh ? '证书有效期多久？' : 'How long is the certificate valid?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {isZh
                    ? '90 天。脚本会在到期前 30 天自动续期，无需人工干预。'
                    : '90 days. The script auto-renews 30 days before expiry.'}
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isZh ? '申请频率有限制吗？' : 'Is there a rate limit?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {isZh
                    ? "Let's Encrypt 限制每周每域名 50 个证书。CertFlow 的智能续期策略已考虑此限制。"
                    : "Let's Encrypt limits 50 certificates per domain per week. CertFlow's smart renewal accounts for this."}
                </p>
              </div>
            </div>
          </Section>

          <Section
            id="faq-config"
            title={isZh ? '配置相关' : 'Configuration'}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isZh ? '如何配置多个域名？' : 'How to configure multiple domains?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {isZh
                    ? '在 ssl-cert.conf 中用逗号或空格分隔：DOMAINS="example.com,www.example.com,api.example.com"'
                    : 'Use comma or space-separated values: DOMAINS="example.com,www.example.com,api.example.com"'}
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isZh ? '支持泛域名证书吗？' : 'Does it support wildcard certificates?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {isZh
                    ? '支持！设置 VERIFY_MODE="dns" 并配置 DNS API 提供商即可申请 *.example.com 泛域名证书。'
                    : 'Yes! Set VERIFY_MODE="dns" and configure a DNS API provider to request *.example.com wildcard certificates.'}
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isZh ? 'BASE_DIR 路径如何设置？' : 'How to set BASE_DIR?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {isZh
                    ? '默认为 /data/opt/installmiddleware，需与 Docker 卷挂载路径保持一致。'
                    : 'Default is /data/opt/installmiddleware, must match the Docker volume mount path.'}
                </p>
              </div>
            </div>
          </Section>

          <Section id="faq-usage" title={isZh ? '使用问题' : 'Usage'}>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isZh ? '自动续期如何工作？' : 'How does auto renewal work?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {isZh
                    ? 'acme.sh 内置 cron 任务管理，脚本首次运行时会自动添加定时续期任务。'
                    : 'acme.sh includes built-in cron management. The script auto-adds a renewal task on first run.'}
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isZh ? 'Dry-run 模式是什么？' : 'What is dry-run mode?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {isZh
                    ? '测试模式，不实际申请证书。用于验证配置是否正确：DRY_RUN=true ./renew-ssl-cert.sh'
                    : 'Test mode that does not actually request certificates. Use to verify config: DRY_RUN=true ./renew-ssl-cert.sh'}
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isZh ? '如何查看日志？' : 'How to view logs?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {isZh
                    ? '设置 ENABLE_LOG=true，日志文件将保存在 LOG_DIR 目录下，按日期命名。'
                    : 'Set ENABLE_LOG=true. Log files are saved in LOG_DIR, named by date.'}
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {isZh ? 'acme.sh 未安装怎么办？' : 'What if acme.sh is not installed?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {isZh
                    ? '无需担心！脚本首次运行时会自动检测并安装 acme.sh，全程自动化。'
                    : 'No worries! The script auto-detects and installs acme.sh on first run, fully automatic.'}
                </p>
              </div>
            </div>
          </Section>

        </div>
      </main>
    </div>
  )
}
