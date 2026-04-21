import { useState } from 'react'
import { FileCode, CheckCircle2, HelpCircle, AlertTriangle } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDocker } from '@fortawesome/free-brands-svg-icons'
import { useI18n } from '../contexts/I18nContext'
import { CodeBlock } from '../components/CodeBlock'
import { cn } from '../lib/utils'

const DockerIcon = () => <FontAwesomeIcon icon={faDocker} className="h-4 w-4" />

const dockerComposeYaml = `services:
  nginx:
    image: nginx:alpine 
    deploy:
      resources:
        limits:
          memory: 4096M
    container_name: nginx
    ports:
      - "80:80"
      - "443:443"
    environment:
      - TZ=Asia/Shanghai
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s
      timeout: 10s
      retries: 3
    volumes:
      - ./conf/web.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/ssl/private:ro
      - ./html:/usr/share/nginx/html
      - ./data/nginx/logs:/var/log/nginx:rw
    restart: always`

const nginxConf = `# HTTP → HTTPS 跳转 + ACME 验证路径
upstream gateways {
    least_conn;
    server 127.0.0.1:8080 weight=2;
    server 127.0.0.1:8082 weight=2;
}

server {
    listen 80;
    server_name your.domain.com;
    server_tokens off;
    absolute_redirect off;

    location ^~ /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
        default_type text/plain;
    }

    location / {
        return 308 https://$host:443$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name your.domain.com;
    server_tokens off;
    absolute_redirect off;

    ssl_certificate     /etc/ssl/private/your.domain.com.crt;
    ssl_certificate_key /etc/ssl/private/your.domain.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
    ssl_ecdh_curve secp384r1;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    gzip  on;
    gzip_min_length 1k;
    gzip_comp_level 3;
    gzip_types text/plain application/javascript application/x-javascript text/javascript text/xml text/css;
    gzip_disable "MSIE [1-6]\\.";

    client_max_body_size  2000m;
    client_header_timeout 1800s;
    client_body_timeout   1800s;

    proxy_connect_timeout 75s;
    proxy_read_timeout    1800s;
    proxy_send_timeout    1800s;

    location = / {
        return 301 /dashboard;
    }

    location /dashboard {
        alias /usr/share/nginx/html/dashboard;
        index index.html index.htm;
        try_files $uri $uri/ $uri/index.html;
    }

    location ^~/api/ {
        proxy_pass http://gateways/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr,$host,$proxy_add_x_forwarded_for;
        add_header backendIP $upstream_addr;
        add_header backendCode $upstream_status;
    }
}`

const configExample = `#==============================================
# 核心配置（必填）
#==============================================

# 域名配置（支持多域名，空格或逗号分隔）
# 示例: "example.com" 或 "example.com,www.example.com"
DOMAINS="your.domain.com"

# 路径配置
BASE_DIR="/data/opt/install-middleware"
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
          <h1 className={`text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
            {t.docs.title}
          </h1>
          <p className={`text-gray-600 dark:text-gray-400 max-w-2xl ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
            {t.docs.subtitle}
          </p>
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

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '快速开始' : 'Quick Start'}
                  </h2>
                  <div className="space-y-4">
                    {[
                      language === 'zh' ? '下载并解压脚本到目标目录' : 'Download and extract script to target directory',
                      language === 'zh' ? '修改 3 个核心变量: DOMAIN, BASE_DIR, RELOAD_CMD' : 'Modify 3 core variables: DOMAIN, BASE_DIR, RELOAD_CMD',
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
                      ? '复制配置文件模板，默认只需修改 3 个核心变量: DOMAINS、BASE_DIR、RELOAD_CMD 即可，也可根据实际需求进一步配置高级选项。'
                      : 'Copy the config template. Default requires only 3 core variables: DOMAINS, BASE_DIR, RELOAD_CMD. Advanced options available as needed.'}
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
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '目录结构' : 'Directory Structure'}
                  </h2>
                  <CodeBlock 
                    code={`mkdir -p /data/opt/installmiddleware
cd /data/opt/installmiddleware
mkdir -p conf certs html data/nginx/logs`}
                    language="bash"
                    filename="Terminal"
                  />
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? 'docker-compose.yml' : 'docker-compose.yml'}
                  </h2>
                  <CodeBlock 
                    code={dockerComposeYaml}
                    language="yaml"
                    filename="docker-compose.yml"
                  />
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? 'Nginx 配置示例' : 'Nginx Configuration'}
                  </h2>
                  <div className="mb-4 flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className={`font-medium text-yellow-800 dark:text-yellow-200 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                        {language === 'zh' ? '关键提示' : 'Key Note'}
                      </h3>
                      <p className={`text-sm text-yellow-700 dark:text-yellow-300 mt-1 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                        <code className="px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-100 font-mono text-xs">/.well-known/acme-challenge/</code>
                        {language === 'zh' 
                          ? ' 路径必须指向 webroot，用于 ACME 验证'
                          : ' must point to webroot for ACME verification'}
                      </p>
                    </div>
                  </div>
                  <CodeBlock 
                    code={nginxConf}
                    language="nginx"
                    filename="conf/web.conf"
                  />
                </div>

                <div className="glass-card rounded-lg p-6">
                  <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {language === 'zh' ? '启动 Nginx' : 'Start Nginx'}
                  </h2>
                  <CodeBlock 
                    code="docker compose up -d"
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
                         a: language === 'zh' ? '在 ssl-cert.conf 中用逗号或空格分隔：DOMAINS="example.com,www.example.com"' : 'Use comma or space-separated values in ssl-cert.conf: DOMAINS="example.com,www.example.com"'
                       },
                      {
                        q: language === 'zh' ? 'BASE_DIR 路径如何设置？' : 'How to set BASE_DIR path?',
                        a: language === 'zh' ? '默认为 /data/opt/installmiddleware，需与 Docker 卷挂载路径一致。' : 'Default is /data/opt/installmiddleware, must match Docker volume mount path.'
                      },
{
                         q: language === 'zh' ? '支持泛域名证书吗？' : 'Does it support wildcard certificates?',
                         a: language === 'zh' ? '支持！在 ssl-cert.conf 设置 VERIFY_MODE="dns" 并配置 DNS API 提供商。' : 'Yes! Set VERIFY_MODE="dns" in ssl-cert.conf and configure DNS API provider.'
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