# acme-ssl-breeze

<p align="center">
  <img src="https://raw.githubusercontent.com/freemankevin/acme-ssl-breeze/main/logo.svg" alt="logo" width="120"/>
</p>
<h1 align="center">ACME-SSL-Breeze</h1>
<p align="center">
  <img src="https://github.com/freemankevin/acme-ssl-breeze/workflows/CI/badge.svg" alt="CI"/>
  <img src="https://img.shields.io/github/license/freemankevin/acme-ssl-breeze" alt="License"/>
  <img src="https://img.shields.io/github/v/release/freemankevin/acme-ssl-breeze" alt="Release"/>
</p>

> 一条命令，零配置焦虑，让 SSL 证书自动续期像呼吸一样自然。  
>
> 基于 acme.sh + Docker Nginx，支持单域名、泛域名、多服务器批量部署。

---

## ✨ 特性

- 🚀 **开箱即用**：单文件 Bash，无需安装额外依赖
- 🔒 **安全加固**：私钥仅本机保存，支持 DNS-API / WebRoot 双模式
- 🔄 **智能续期**：30 天内到期才触发，避免无谓申请
- 🐳 **Docker 友好**：证书更新后自动 `docker restart nginx`

## 🐳 第一步：部署 Docker 环境

### 1. 创建目录结构

```bash
mkdir -p /data/opt/install-middleware && cd /data/opt/install-middleware
mkdir -p conf certs html data/nginx/logs
```

### 2. 配置 docker-compose.yml

创建 `docker-compose.yml` 文件：

```yaml
services:
  nginx:
    image: "nginx:1.29.3"
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

### 3. 配置 Nginx

创建 `conf/web.conf` 文件：

```nginx
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

    # Let's Encrypt 验证路径（不跳转）
    location ^~ /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
        default_type text/plain;
    }

    # 其他请求仍然跳转 HTTPS
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

### 4. 启动服务

```bash
docker-compose up -d
```

### 5. 注意事项

Nginx 配置中的 `/.well-known/acme-challenge/` 路径必须保留，用于 ACME 验证

## 🏁 第二步：配置并执行 SSL 证书脚本

### 1. 下载源码包

```bash
wget https://github.com/freemankevin/acme-ssl-breeze/archive/refs/heads/main.tar.gz -O acme-ssl-breeze.tar.gz
tar -xzf acme-ssl-breeze.tar.gz
cd acme-ssl-breeze-main
```

### 2. 修改配置（仅需 3 处）

```bash
nano renew-ssl-cert.sh
# DOMAIN="your.domain.com"
# BASE_DIR="/data/opt/install-middleware"
# RELOAD_CMD="docker restart nginx"
```

### 3. 赋予执行权限

```bash
chmod +x renew-ssl-cert.sh
```

### 4. 一键执行

```bash
./renew-ssl-cert.sh
```

### 5. 配置自动续期

将以下内容添加到 crontab，实现自动检查证书有效期：

```bash
40 11 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
```

### 6. 注意事项

- 将 `your.domain.com` 替换为你的实际域名
- 确保 `BASE_DIR` 配置与 docker-compose.yml 中的路径一致
- 证书文件会自动生成在 `certs` 目录下


## 📝 许可证

MIT © 2026 [freemankevin](https://github.com/freemankevin)

## 🙏 致谢

- [acme.sh](https://github.com/acmesh-official/acme.sh) —— 强大的 ACME 协议 shell 实现  
- [Let's Encrypt](https://letsencrypt.org) —— 免费提供 SSL 证书