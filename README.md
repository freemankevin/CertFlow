<p align="center">
  <img src="https://raw.githubusercontent.com/freemankevin/acme-ssl-breeze/main/logo.svg" alt="ACME-SSL-Breeze" width="180"/>
</p>

<h1 align="center">ACME-SSL-Breeze</h1>

<p align="center">
  <strong>一条命令 · 零配置焦虑 · 让 SSL 续期像呼吸一样自然</strong>
</p>

<p align="center">
  <a href="https://github.com/freemankevin/acme-ssl-breeze/actions/workflows/ci.yml">
    <img src="https://github.com/freemankevin/acme-ssl-breeze/actions/workflows/ci.yml/badge.svg" alt="CI Status"/>
  </a>
  <a href="https://github.com/freemankevin/acme-ssl-breeze/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/freemankevin/acme-ssl-breeze?style=flat-square&color=success" alt="License"/>
  </a>
  <a href="https://github.com/freemankevin/acme-ssl-breeze/releases/latest">
    <img src="https://img.shields.io/github/v/release/freemankevin/acme-ssl-breeze?style=flat-square&color=blue" alt="Latest Release"/>
  </a>
  <a href="https://github.com/freemankevin/acme-ssl-breeze/stargazers">
    <img src="https://img.shields.io/github/stars/freemankevin/acme-ssl-breeze?style=flat-square" alt="GitHub stars"/>
  </a>
</p>

---

## ✨ 核心特性

- 🚀 **单文件脚本** — 无需额外依赖，开箱即用
- 🔐 **私钥永不离本地** — 支持 DNS-API / WebRoot 双验证模式
- 🧠 **智能续期** — 仅 30 天内到期才申请，减少 Let's Encrypt 限额压力
- 🐳 **Docker 无缝集成** — 证书更新后自动重载 Nginx 容器
- 📦 **批量友好** — 一键适配多域名、多服务器场景

## 🚀 30 秒快速开始（推荐）

```bash
# 一行下载最新版 → 进入目录
curl -L https://github.com/freemankevin/acme-ssl-breeze/archive/refs/tags/latest.tar.gz | tar -xz && cd acme-ssl-breeze-latest

# 只需改 3 个变量，然后执行
nano renew-ssl-cert.sh    # 修改 DOMAIN / BASE_DIR / RELOAD_CMD
chmod +x renew-ssl-cert.sh
./renew-ssl-cert.sh
```

> 第一次运行会自动安装 acme.sh 并申请证书，之后加入 cron 即可永不过期！


## 📋 完整部署指南

### 1. 准备 Docker Nginx 环境

创建项目目录结构：

```bash
mkdir -p /data/opt/install-middleware 
cd /data/opt/install-middleware
mkdir -p conf certs html data/nginx/logs
```

使用推荐的 `docker-compose.yml`：

```yaml
services:
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
    restart: always
```

Nginx 示例配置（`conf/web.conf`）关键片段：

```nginx
# HTTP → HTTPS 跳转 + ACME 验证路径
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
    gzip_disable "MSIE [1-6]\.";

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
}
```

启动：

```bash
docker compose up -d
```

### 2. 配置 & 运行 renew-ssl-cert.sh

```bash
# 已在上方「快速开始」给出
```

必须修改的 3 个变量：

```bash
DOMAIN="your.domain.com"                  # 可逗号分隔多个域名
BASE_DIR="/data/opt/install-middleware"   # 与 docker 卷挂载路径一致
RELOAD_CMD="docker restart nginx"         # 或 docker compose -f ... restart nginx
```

### 3. 设置自动续期（强烈推荐）

acme.sh 自带 cron，执行一次脚本后通常已自动添加：

```bash
# 验证是否已加入（一般为每天随机时间）
crontab -l
```

如未添加，手动加入（示例每天11:40检查）：
```bash
40 11 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" >/dev/null
```

## ⚠️ 注意事项

- 确保证书路径与 Nginx 配置一致（acme.sh 默认生成 `.crt` 和 `.key`）
- WebRoot 模式需 80 端口开放；DNS 模式更适合 Cloudflare 等
- 首次申请可能需要几分钟，请耐心等待
- 建议备份 `/root/.acme.sh` 目录（包含账号密钥）

## 📄 许可证

[MIT License](LICENSE) © 2026 freemankevin

## ❤️ 感谢

- [acme.sh](https://github.com/acmesh-official/acme.sh) — 极简强大的 ACME 客户端
- [Let's Encrypt](https://letsencrypt.org) — 免费、可信赖的证书权威

欢迎 star ✨ & fork → PR！