# 安装指南

## 📋 前置要求

- Linux服务器（推荐 Ubuntu 20.04+ / CentOS 7+）
- 已安装Docker和Docker Compose
- 域名已解析到服务器公网IP
- 80端口可访问（WebRoot验证模式）

## 🚀 安装步骤

### 1. 下载CertFlow

```bash
curl -LO https://github.com/freemankevin/CertFlow/releases/latest/download/renew-ssl-cert.sh
curl -LO https://github.com/freemankevin/CertFlow/releases/latest/download/ssl-cert.conf.example
chmod +x renew-ssl-cert.sh
cp ssl-cert.conf.example ssl-cert.conf
```

### 2. 配置脚本

编辑 `ssl-cert.conf`：

```bash
DOMAIN="your.domain.com"
BASE_DIR="/data/opt/install-middleware"
RELOAD_CMD="docker restart nginx"
```

### 3. 运行脚本

```bash
./renew-ssl-cert.sh
```

### 4. 设置定时续期

```bash
crontab -e
# 添加：每天凌晨2点执行
0 2 * * * /path/to/renew-ssl-cert.sh >> /var/log/ssl-renewal.log 2>&1
```