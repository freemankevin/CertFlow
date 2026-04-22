<p align="center">
  <img src="https://raw.githubusercontent.com/freemankevin/CertFlow/main/public/logo.svg" alt="CertFlow" width="180"/>
</p>
<h1 align="center">CertFlow</h1>
<p align="center"><em>SSL Certificate Auto Renewal</em></p>
<p align="center">
  <a href="https://github.com/freemankevin/CertFlow/actions/workflows/ci.yml"><img src="https://github.com/freemankevin/CertFlow/actions/workflows/ci.yml/badge.svg" alt="CI Status"/></a>
  <a href="https://github.com/freemankevin/CertFlow/blob/main/LICENSE"><img src="https://img.shields.io/github/license/freemankevin/CertFlow?style=flat-square&color=success" alt="License"/></a>
  <a href="https://github.com/freemankevin/CertFlow/releases/latest"><img src="https://img.shields.io/github/v/release/freemankevin/CertFlow?style=flat-square&color=blue" alt="Latest Release"/></a>
  <a href="https://github.com/freemankevin/CertFlow/stargazers"><img src="https://img.shields.io/github/stars/freemankevin/CertFlow?style=flat-square" alt="GitHub stars"/></a>
</p>

<p align="center">
  <a href="https://certflow.freemankevin.uk">
    <img src="https://raw.githubusercontent.com/freemankevin/CertFlow/main/public/home.png" alt="CertFlow Preview" width="800"/>
  </a>
</p>

---



## ✨ 核心特性

- 🚀 **单文件脚本** — 无需额外依赖，开箱即用
- 🔐 **私钥永不离本地** — 支持 DNS-API / WebRoot 双验证模式
- 🧠 **智能续期** — 仅 30 天内到期才申请，减少 Let's Encrypt 限额压力
- 🐳 **Docker 无缝集成** — 证书更新后自动重载 Nginx 容器
- 📦 **批量友好** — 一键适配多域名、多服务器场景
- 🔔 **通知机制** — 支持 Webhook 通知证书更新状态


## 🚀 快速开始

> 第一次运行会自动安装 acme.sh、申请证书并设置定时续期！

```bash
curl -L https://github.com/freemankevin/CertFlow/archive/refs/heads/main.tar.gz | tar -xz && cd CertFlow-main
cp ssl-cert.conf.example ssl-cert.conf
nano ssl-cert.conf       # 修改 DOMAINS / BASE_DIR / RELOAD_CMD
chmod +x renew-ssl-cert.sh
./renew-ssl-cert.sh
```



## ❤️ 感谢

- [acme.sh](https://github.com/acmesh-official/acme.sh) — 极简强大的 ACME 客户端
- [Let's Encrypt](https://letsencrypt.org) — 免费、可信赖的证书权威