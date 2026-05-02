# CertFlow — AI Agent 项目指南

> 本文档面向 AI 编程助手。如果你对本项目一无所知，请从此处开始阅读。

---

## 项目概览

CertFlow 是一个 **SSL 证书自动续期工具**，同时附带一个用于展示和分发的官方网站前端。

项目包含两个核心交付物：
1. **Bash 脚本 `renew-ssl-cert.sh`**：基于 [acme.sh](https://github.com/acmesh-official/acme.sh) 的自动化 SSL 证书续期脚本，支持 WebRoot / DNS-API 双验证模式、多域名批量处理、Webhook 通知、Docker 容器自动重载等特性。
2. **React 前端网站 `certflow-web`**：使用 Vite + React + TypeScript + Tailwind CSS 构建的静态官网，提供特性展示、部署文档、脚本源码在线浏览和 FAQ 功能。

仓库地址：`https://github.com/freemankevin/CertFlow`
部署地址：`https://certflow.freemankevin.uk`

---

## 技术栈

### 前端（Frontend）
| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.2.0 | UI 框架 |
| TypeScript | ^5.2.2 | 类型系统 |
| Vite | ^5.0.8 | 构建工具与开发服务器 |
| Tailwind CSS | ^3.4.0 | 原子化 CSS 框架 |
| React Router DOM | ^6.22.0 | 客户端路由 |
| highlight.js | ^11.11.1 | 代码语法高亮 |
| lucide-react | ^0.312.0 | 图标库 |
| Font Awesome | ^7.2.0 | 品牌/实心图标 |
| clsx + tailwind-merge | latest | 条件类名合并工具 |

### 脚本与基础设施
| 技术 | 用途 |
|------|------|
| Bash | `renew-ssl-cert.sh`（证书续期）、`startup.sh`（开发启动） |
| Docker Compose | Nginx 容器化部署 |
| Nginx | 反向代理、SSL 终结、WebRoot ACME 验证 |
| acme.sh | ACME 协议客户端，用于申请 Let's Encrypt 证书 |

---

## 项目结构

```
CertFlow/
├── src/                          # React 前端源码
│   ├── components/               # 可复用组件
│   │   ├── CodeBlock.tsx         # 代码块组件（含行号、复制、高亮）
│   │   ├── Header.tsx            # 顶部导航栏（含主题/语言切换）
│   │   └── Footer.tsx            # 页脚
│   ├── contexts/                 # React Context
│   │   ├── I18nContext.tsx       # 国际化（中/英双语）
│   │   └── ThemeContext.tsx      # 深色/浅色主题切换
│   ├── lib/
│   │   └── utils.ts              # cn() 工具函数（clsx + tailwind-merge）
│   ├── pages/                    # 页面级路由组件
│   │   ├── Home.tsx              # 首页（Hero + 特性 + 快速开始）
│   │   ├── Docs.tsx              # 部署文档（Tab: 快速开始 / Docker / FAQ）
│   │   ├── Script.tsx            # 脚本源码在线浏览页
│   │   └── FAQ.tsx               # 帮助与文档（手风琴 FAQ + 安装指南）
│   ├── App.tsx                   # 根组件（Router + Provider 包装）
│   ├── main.tsx                  # 入口（ReactDOM.createRoot）
│   └── index.css                 # 全局样式 + Tailwind 指令 + 代码块主题
├── public/                       # 静态资源（favicon、logo）
├── conf/
│   └── web.conf                  # Nginx 配置模板（含 upstream、SSL、代理规则）
├── renew-ssl-cert.sh             # SSL 自动续期主脚本（核心交付物）
├── startup.sh                    # 前端开发环境一键启动脚本
├── ssl-cert.conf.example         # 脚本配置文件模板
├── docker-compose.yml            # Nginx Docker Compose 配置
├── package.json                  # 前端依赖与 npm scripts
├── vite.config.ts                # Vite 配置（含 @/ @root alias）
├── tsconfig.json                 # TypeScript 配置（strict 模式）
├── tailwind.config.js            # Tailwind 配置（自定义颜色/字体/动画）
├── eslint.config.js              # ESLint 配置（tseslint + react-hooks + react-refresh）
├── vercel.json                   # Vercel 部署配置（SPA rewrite + 安全响应头）
└── .github/workflows/ci.yml      # GitHub Actions CI（ShellCheck + Release）
```

---

## 常用命令

### 前端开发
```bash
# 一键启动开发环境（检测系统、检查 Node 版本、清理端口、安装依赖、类型检查、启动 Vite）
chmod +x startup.sh
./startup.sh

# 或直接调用 npm scripts
npm install
npm run dev          # 启动 Vite 开发服务器（默认端口 5173）
npm run build        # 生产构建（tsc + vite build）
npm run preview      # 预览生产构建
npm run lint         # ESLint 代码检查
npm run typecheck    # TypeScript 类型检查（不输出文件）
```

### 脚本使用
```bash
# 首次使用：复制配置模板并编辑
cp ssl-cert.conf.example ssl-cert.conf
nano ssl-cert.conf        # 修改 DOMAINS / BASE_DIR / RELOAD_CMD

chmod +x renew-ssl-cert.sh
./renew-ssl-cert.sh       # 执行证书续期
```

### Docker 部署 Nginx
```bash
docker compose up -d
```

---

## 代码规范与开发约定

### 语言与注释
- **项目默认语言为中文**。所有 Bash 脚本注释、CSS 注释、README 均以中文为主，前端 UI 同时提供英文 i18n 支持。
- 编写新代码时，中文注释是首选；公共 API 或面向国际用户的文档可双语并存。

### 前端代码风格
- **框架**：函数式 React 组件，使用 Hooks（`useState`、`useEffect`、`useContext`）。
- **路由**：`react-router-dom` 的 `BrowserRouter`，页面组件存放在 `src/pages/`。
- **样式**：优先使用 Tailwind CSS 工具类；复杂或复用样式在 `src/index.css` 的 `@layer components` 中定义。
- **主题**：默认主题为 `dark`。`index.html` 中 `<html class="dark">` 设定了初始暗色模式；`ThemeContext` 通过 `localStorage` 持久化用户选择，并在 `<html>` 元素上切换 `dark`/`light` class。
- **国际化**：`I18nContext` 内置了 `zh` / `en` 两套翻译文本，不支持动态加载。新增 UI 文案时，需在 `translations.zh` 和 `translations.en` 中同步添加。
- **字体规范**：
  - 中文正文：`Noto Sans SC`
  - 中文标题：`Noto Serif SC`
  - 英文标题：`Playfair Display`
  - 英文正文：`Inter`
  - 代码：`JetBrains Mono`（强制全局统一，含 `!important` 覆盖）
- **代码块组件**：`CodeBlock` 使用 `highlight.js` 按需注册语言（bash、yaml、nginx），支持行号、复制按钮、文件名标签。

### TypeScript 配置
- `tsconfig.json` 启用 `strict: true`，并开启 `noUnusedLocals` 和 `noUnusedParameters`。
- 不允许隐式 `any`，所有 Props 和 Context 需显式声明类型接口。

### ESLint 规则
- 使用 `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`。
- `react-refresh/only-export-components` 规则允许 `useTheme` 和 `useI18n` 的命名导出，其他组件应默认导出组件本身。
- `no-useless-escape` 已关闭，以避免正则表达式中的误报。

### Bash 脚本风格
- 所有脚本以 `#!/bin/bash` 开头，使用 `set -euo pipefail`。
- 日志函数统一使用带时间戳、带颜色、带级别前缀的结构化输出（`log_info`、`log_success`、`log_warning`、`log_error` 等）。
- 配置变量集中定义在脚本顶部，通过外部 `ssl-cert.conf` 文件 `source` 加载覆盖。

---

## 路由与页面说明

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | `HomePage` | 首页：Hero 区域、核心特性卡片、快速开始步骤 |
| `/docs` | `DocsPage` | 部署文档：含 `overview` / `docker` / `faq` 三个 Tab |
| `/script` | `ScriptPage` | 脚本源码页：通过 `fetch` 从 GitHub raw 加载 `renew-ssl-cert.sh` 完整源码并高亮展示 |
| `/faq` | `FAQPage` | 帮助中心：手风琴式 FAQ、安装步骤、文档索引 |

> 由于使用 `BrowserRouter`，在 Vercel 等静态托管平台部署时，已在 `vercel.json` 中配置 `rewrites` 规则将所有路径指向 `/`，以支持刷新不 404。

---

## 构建与部署

### 前端构建
- 构建命令：`npm run build`
- 输出目录：`dist/`
- 框架识别：`vercel.json` 中已声明 `"framework": "vite"`
- 部署目标：Vercel（通过 `vercel.json` 配置 rewrite 和安全响应头）

### CI/CD（GitHub Actions）
- 触发条件：`push` 到 `main` 分支、`pull_request`、每月定时调度、版本标签 `v*`
- **lint 任务**：对所有 `*.sh` 文件运行 ShellCheck 静态检查
- **release 任务**：仅在推送 `v*` 标签时触发，自动打包 `certflow.tar.gz` 并创建 GitHub Release，附件包含 `certflow.tar.gz`、`renew-ssl-cert.sh`、`ssl-cert.conf.example`

---

## 安全注意事项

1. **配置文件敏感信息**：`ssl-cert.conf` 中可能包含 DNS API 密钥（`DNS_API_KEY`、`DNS_API_SECRET`）和 Webhook URL，**切勿将其提交到 Git 仓库**。项目 `.gitignore` 应确保 `ssl-cert.conf` 不被追踪（如尚未添加，请补充）。
2. **Nginx 配置模板**：`conf/web.conf` 中的 `your.domain.com` 和 `upstream` 地址为占位符，部署前必须替换为实际值。
3. **响应头**：`vercel.json` 已配置基础的 XSS、Clickjacking 防护头（`X-Frame-Options: DENY`、`X-XSS-Protection` 等）。
4. **脚本权限**：`renew-ssl-cert.sh` 涉及证书文件操作和 Docker 命令，运行时需要足够的文件系统权限。

---

## 关键外部依赖

- **acme.sh**：脚本运行时依赖 `~/.acme.sh/acme.sh`，首次运行会自动安装。
- **Docker & Docker Compose**：用于 Nginx 容器化部署和证书更新后的服务重载。
- **Google Fonts**：前端通过 CDN 加载 `Inter`、`Noto Sans SC`、`Noto Serif SC`、`Playfair Display`、`JetBrains Mono`。离线环境需自行托管字体文件。

---

## 扩展建议

- **新增页面**：在 `src/pages/` 创建页面组件，在 `src/App.tsx` 的 `<Routes>` 中注册路由。
- **新增组件**：在 `src/components/` 创建，优先使用函数式组件 + TypeScript Props 接口。
- **新增翻译**：在 `src/contexts/I18nContext.tsx` 的 `translations` 对象中补充 `zh` 和 `en` 字段。
- **脚本功能扩展**：修改 `renew-ssl-cert.sh` 时，需在顶部变量区声明新配置项，并在 `load_config()` 中增加校验逻辑。
