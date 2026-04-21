import { useState } from 'react'
import { FileCode, CheckCircle2, HelpCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDocker } from '@fortawesome/free-brands-svg-icons'
import { useI18n } from '../contexts/I18nContext'
import { CodeBlock } from '../components/CodeBlock'
import { cn } from '../lib/utils'

const DockerIcon = () => <FontAwesomeIcon icon={faDocker} className="h-4 w-4" />

const configExample = `#==============================================
# 核心配置（必填）
#==============================================

# 域名配置（支持多域名，空格或逗号分隔）
# 示例: "example.com" 或 "example.com,www.example.com"
DOMAINS="your.domain.com"

# 路径配置
BASE_DIR="/data/opt/installmiddleware"
CERT_DIR="\${BASE_DIR}/certs"
WEBROOT_DIR="\${BASE_DIR}/html"

# acme.sh 路径
ACME_SH="\${HOME}/.acme.sh/acme.sh"

#==============================================
# 验证模式配置
#==============================================

# 验证模式: "webroot" 或 "dns"
VERIFY_MODE="webroot"

#==============================================
# 重载配置
#==============================================

# 证书更新后执行的命令
RELOAD_CMD="docker restart nginx"

#==============================================
# 通知配置（可选）
#==============================================

# Webhook 通知 URL（留空则不发送）
WEBHOOK_URL=""`

const dockerOfflineInstall = `# 下载 Docker 离线安装包
wget https://github.com/freemankevin/docker-offline/releases/download/v29.4.1/docker-offline-v29.4.1.tar.gz

# 解压并安装
tar -xzf docker-offline-v29.4.1.tar.gz
cd docker-offline-v29.4.1
sudo bash packages/scripts/install.sh`

const createDirs = `# 创建部署目录
mkdir -p /data/opt/installmiddleware

# 进入目录
cd /data/opt/installmiddleware

# 创建子目录
# conf     - Nginx 配置文件目录
# certs    - SSL 证书存放目录
# html     - WebRoot 验证目录（ACME 验证文件）
# data     - Nginx 日志等数据目录
mkdir -p conf certs html data/nginx/logs`

const downloadConfigFiles = `# 下载 docker-compose.yml
curl -o docker-compose.yml https://raw.githubusercontent.com/freemankevin/CertFlow/main/docker-compose.yml

# 下载 Nginx 配置文件
curl -o conf/web.conf https://raw.githubusercontent.com/freemankevin/CertFlow/main/conf/web.conf`

export function DocsPage() {
  const { t, language } = useI18n()
  const [activeTab, setActiveTab] = useState<'overview' | 'docker' | 'faq'>('overview')

  const tabs = [
    { id: 'overview', icon: FileCode, label: t.docs.tabs.overview },
    { id: 'docker', icon: DockerIcon, label: language === 'zh' ? 'Docker' : 'Docker' },
    { id: 'faq', icon: HelpCircle, label: language === 'zh' ? 'FAQ' : 'FAQ' },
  ]

  return (
    <div className="animate-fade-in">
      <section className="py-12 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container-custom">
          <h1 className={`text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
            {t.docs.title}
          </h1>
        </div>
      </section>

      <section className="py-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isCustomIcon = typeof tab.icon === 'function' && tab.icon.name === 'DockerIcon'
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
                  {isCustomIcon ? <tab.icon /> : <tab.icon className="h-4 w-4" />}
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="container-custom">
          <div className="max-w-4xl">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '前置要求' : 'Prerequisites'}
                  </h2>
                  <div className="space-y-4">
                    {[
                      language === 'zh' ? 'Linux 服务器（推荐 Ubuntu 20.04+ / Debian 11+）' : 'Linux server (Ubuntu 20.04+ / Debian 11+ recommended)',
                      language === 'zh' ? '已安装 Docker 和 Docker Compose' : 'Docker and Docker Compose installed',
                      language === 'zh' ? '域名已解析到服务器公网 IP' : 'Domain resolved to server public IP',
                      language === 'zh' ? '80 端口可访问（WebRoot 验证模式）' : 'Port 80 accessible (WebRoot verification mode)',
                    ].map((req, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-ssl-green flex-shrink-0 mt-0.5" />
                        <p className={`text-gray-700 dark:text-gray-300 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          {req}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-lg p-6 border-l-4 border-l-ssl-blue bg-blue-50/50 dark:bg-blue-900/20">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-ssl-blue/10 dark:bg-ssl-blue/20 flex items-center justify-center">
                      <DockerIcon />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                        {language === 'zh' ? '需要 Docker 环境？' : 'Need Docker Environment?'}
                      </h3>
                      <p className={`text-gray-600 dark:text-gray-400 mb-4 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                        {language === 'zh'
                          ? '如果服务器尚未安装 Docker，可以查看 Docker 部署指南，使用离线安装包快速部署环境。'
                          : 'If Docker is not installed, check the Docker deployment guide for offline installation.'}
                      </p>
                      <button
                        onClick={() => setActiveTab('docker')}
                        className="inline-flex items-center gap-2 text-ssl-blue hover:text-blue-600 font-medium"
                      >
                        <span>{language === 'zh' ? '查看 Docker 部署指南' : 'View Docker Deployment Guide'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '快速开始' : 'Quick Start'}
                  </h2>
                  <div className="space-y-4">
                    {[
                      language === 'zh' ? '下载并解压脚本到目标目录' : 'Download and extract script to target directory',
                      language === 'zh' 
                        ? <>修改 3 个核心变量: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">DOMAINS</code>, <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">BASE_DIR</code>, <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">RELOAD_CMD</code></>
                        : <>Modify 3 core variables: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">DOMAINS</code>, <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">BASE_DIR</code>, <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">RELOAD_CMD</code></>,
                      language === 'zh' ? '执行脚本，首次运行自动安装 acme.sh 并设置定时续期' : 'Execute script, auto installs acme.sh and sets up cron on first run',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-ssl-blue text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className={`text-gray-700 dark:text-gray-300 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '下载命令' : 'Download Command'}
                  </h2>
                  <CodeBlock 
                    code="curl -L https://github.com/freemankevin/CertFlow/archive/refs/heads/main.tar.gz | tar -xz && cd CertFlow-main"
                    language="bash"
                    filename="Terminal"
                  />
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '配置文件' : 'Configuration File'}
                  </h2>
                  <p className={`text-gray-700 dark:text-gray-300 mb-4 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                    {language === 'zh' 
                      ? '复制配置文件模板，修改核心配置项即可快速上手。'
                      : 'Copy the config template and modify core settings.'}
                  </p>
                  <p className={`text-gray-700 dark:text-gray-300 mb-4 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                    {language === 'zh' 
                      ? <>必填项仅 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">DOMAINS</code>、<code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">BASE_DIR</code>、<code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">RELOAD_CMD</code> 三个，其他高级配置按需设置。</>
                      : <>Only <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">DOMAINS</code>, <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">BASE_DIR</code>, and <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">RELOAD_CMD</code> are required. Advanced options are optional.</>}
                  </p>
                  <CodeBlock 
                    code={`cp ssl-cert.conf.example ssl-cert.conf
nano ssl-cert.conf`}
                    language="bash"
                    filename="Terminal"
                  />
                  <div className="mt-4">
                    <CodeBlock 
                      code={configExample}
                      language="bash"
                      filename="ssl-cert.conf"
                    />
                  </div>
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '执行脚本' : 'Execute Script'}
                  </h2>
                  <CodeBlock 
                    code={`chmod +x renew-ssl-cert.sh
./renew-ssl-cert.sh`}
                    language="bash"
                    filename="Terminal"
                  />
                </div>
              </div>
            )}

            {activeTab === 'docker' && (
              <div className="space-y-8 animate-fade-in">
                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-2 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? 'Docker 环境安装' : 'Docker Installation'}
                  </h2>
                  <p className={`text-gray-600 dark:text-gray-400 mb-4 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                    {language === 'zh'
                      ? '推荐使用离线安装包，快速部署 Docker 环境。'
                      : 'Recommended to use offline package for quick Docker deployment.'}
                  </p>
                  <div className="mb-4 flex items-center gap-2">
                    <a 
                      href="https://github.com/freemankevin/docker-offline/releases" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-ssl-blue hover:text-blue-600 text-sm"
                    >
                      <DockerIcon />
                      <span>{language === 'zh' ? '获取最新版本' : 'Get latest version'}</span>
                    </a>
                  </div>
                  <CodeBlock 
                    code={dockerOfflineInstall}
                    language="bash"
                    filename="Terminal"
                  />
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-2 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '创建目录结构' : 'Create Directory Structure'}
                  </h2>
                  <p className={`text-gray-600 dark:text-gray-400 mb-4 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                    {language === 'zh'
                      ? '创建部署所需的目录结构，用于存放配置文件、证书和验证文件。'
                      : 'Create deployment directories for configs, certificates and verification files.'}
                  </p>
                  <CodeBlock 
                    code={createDirs}
                    language="bash"
                    filename="Terminal"
                  />
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-2 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '下载配置文件' : 'Download Configuration Files'}
                  </h2>
                  <p className={`text-gray-600 dark:text-gray-400 mb-2 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                    {language === 'zh'
                      ? '从 GitHub 仓库下载 docker-compose.yml 和 Nginx 配置文件。'
                      : 'Download docker-compose.yml and Nginx config from GitHub repository.'}
                  </p>
                  <div className="mb-4 flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className={`font-medium text-yellow-800 dark:text-yellow-200 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                        {language === 'zh' ? '重要提示' : 'Important Note'}
                      </h3>
                      <p className={`text-sm text-yellow-700 dark:text-yellow-300 mt-1 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                        {language === 'zh' 
                          ? '下载后需要修改 conf/web.conf 中的 your.domain.com 为实际域名。'
                          : 'After download, modify your.domain.com in conf/web.conf to your actual domain.'}
                      </p>
                    </div>
                  </div>
                  <CodeBlock 
                    code={downloadConfigFiles}
                    language="bash"
                    filename="Terminal"
                  />
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-2 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '启动服务' : 'Start Services'}
                  </h2>
                  <CodeBlock 
                    code={`# 启动 Nginx 容器
docker compose up -d

# 查看容器状态
docker compose ps`}
                    language="bash"
                    filename="Terminal"
                  />
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-8 animate-fade-in">
                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-6 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '证书申请' : 'Certificate Application'}
                  </h2>
                  <div className="space-y-6">
                    {[
                      {
                        q: language === 'zh' ? '支持哪些证书颁发机构？' : 'Which certificate authorities are supported?',
                        a: language === 'zh' ? '默认 Let\'s Encrypt，也支持 ZeroSSL、Buypass。' : 'Default is Let\'s Encrypt, also supports ZeroSSL, Buypass.'
                      },
                      {
                        q: language === 'zh' ? '证书有效期多久？' : 'How long is the certificate valid?',
                        a: language === 'zh' ? '90天，脚本会在到期前30天自动续期。' : '90 days, script auto-renews 30 days before expiry.'
                      },
                      {
                        q: language === 'zh' ? '申请频率有限制吗？' : 'Is there a rate limit for applications?',
                        a: language === 'zh' ? 'Let\'s Encrypt 限制每周每域名50个证书。' : 'Let\'s Encrypt limits 50 certificates per domain per week.'
                      },
                    ].map((item, i) => (
                      <div key={i} className="border-b border-gray-200/50 dark:border-gray-700/50 pb-4 last:border-0 last:pb-0">
                        <h3 className={`font-medium text-gray-900 dark:text-white mb-2 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          Q: {item.q}
                        </h3>
                        <p className={`text-gray-600 dark:text-gray-400 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          A: {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-6 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '配置相关' : 'Configuration'}
                  </h2>
<div className="space-y-6">
                    {[
{
                          q: language === 'zh' ? '如何配置多个域名？' : 'How to configure multiple domains?',
                          a: language === 'zh' 
                            ? <>在 ssl-cert.conf 中用逗号或空格分隔：<code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">DOMAINS</code>="example.com,www.example.com"</>
                            : <>Use comma or space-separated values in ssl-cert.conf: <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">DOMAINS</code>="example.com,www.example.com"</>
                        },
                       {
                         q: language === 'zh' ? 'BASE_DIR 路径如何设置？' : 'How to set BASE_DIR path?',
                         a: language === 'zh' 
                           ? <>默认为 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">/data/opt/installmiddleware</code>，需与 Docker 卷挂载路径一致。</>
                           : <>Default is <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">/data/opt/installmiddleware</code>, must match Docker volume mount path.</>
                       },
{
                          q: language === 'zh' ? '支持泛域名证书吗？' : 'Does it support wildcard certificates?',
                          a: language === 'zh' 
                            ? <>支持！在 ssl-cert.conf 设置 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">VERIFY_MODE</code>="dns" 并配置 DNS API 提供商。</>
                            : <>Yes! Set <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">VERIFY_MODE</code>="dns" in ssl-cert.conf and configure DNS API provider.</>
                        },
                    ].map((item, i) => (
                      <div key={i} className="border-b border-gray-200/50 dark:border-gray-700/50 pb-4 last:border-0 last:pb-0">
                        <h3 className={`font-medium text-gray-900 dark:text-white mb-2 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          Q: {item.q}
                        </h3>
                        <p className={`text-gray-600 dark:text-gray-400 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          A: {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-6 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '使用问题' : 'Usage'}
                  </h2>
                  <div className="space-y-6">
                    {[
                      {
                        q: language === 'zh' ? '自动续期如何工作？' : 'How does auto renewal work?',
                        a: language === 'zh' ? 'acme.sh 自带 cron，执行一次脚本后通常已自动添加定时任务。如未添加，手动加入 crontab 即可。' : 'acme.sh includes cron, usually auto-added after first run. If not, add it manually to crontab.'
                      },
                      {
                        q: language === 'zh' ? 'Dry-run 模式是什么？' : 'What is Dry-run mode?',
                        a: language === 'zh' ? '测试模式，不实际申请证书：DRY_RUN=true ./renew-ssl-cert.sh' : 'Test mode, no actual certificate: DRY_RUN=true ./renew-ssl-cert.sh'
                      },
                      {
                        q: language === 'zh' ? '如何查看日志？' : 'How to view logs?',
                        a: language === 'zh' ? '脚本自带彩色日志输出，所有操作都有详细记录。' : 'Script has built-in colored log output with detailed records.'
                      },
                      {
                        q: language === 'zh' ? '首次运行需要什么准备？' : 'What preparation is needed for first run?',
                        a: language === 'zh' ? '需要准备以下三项：' : 'You need to prepare the following:',
                        list: language === 'zh' 
                          ? ['域名 DNS 已解析到服务器公网 IP', 'Nginx 已配置 ACME 验证路径 (/.well-known/acme-challenge/)', '80 端口可访问']
                          : ['Domain DNS resolved to server public IP', 'Nginx configured with ACME verification path (/.well-known/acme-challenge/)', 'Port 80 accessible']
                      },
                    ].map((item, i) => (
                      <div key={i} className="border-b border-gray-200/50 dark:border-gray-700/50 pb-4 last:border-0 last:pb-0">
                        <h3 className={`font-medium text-gray-900 dark:text-white mb-2 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          Q: {item.q}
                        </h3>
                        <div className={`text-gray-600 dark:text-gray-400 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          <p>A: {item.a}</p>
                          {item.list && (
                            <ul className="mt-3 space-y-2">
                              {item.list.map((li, j) => (
                                <li key={j} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-ssl-green flex-shrink-0 mt-0.5" />
                                  <span>{li}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-6 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '安装问题' : 'Installation'}
                  </h2>
                  <div className="space-y-6">
                    {[
                      {
                        q: language === 'zh' ? '如何下载最新版本？' : 'How to download the latest version?',
                        code: 'curl -L https://github.com/freemankevin/CertFlow/archive/refs/heads/main.tar.gz | tar -xz && cd CertFlow-main'
                      },
                      {
                        q: language === 'zh' ? 'acme.sh 未安装怎么办？' : 'What if acme.sh is not installed?',
                        a: language === 'zh' ? '无需担心！脚本首次运行时会自动检测并安装 acme.sh，全程自动化。' : 'No worries! Script auto-detects and installs acme.sh on first run, fully automatic.'
                      },
                    ].map((item, i) => (
                      <div key={i} className="border-b border-gray-200/50 dark:border-gray-700/50 pb-4 last:border-0 last:pb-0">
                        <h3 className={`font-medium text-gray-900 dark:text-white mb-2 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          Q: {item.q}
                        </h3>
                        <div className={`text-gray-600 dark:text-gray-400 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                          {item.a && <p>A: {item.a}</p>}
                          {item.code && (
                            <div className="mt-3">
                              <CodeBlock 
                                code={item.code}
                                language="bash"
                                filename="Terminal"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}