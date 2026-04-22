import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'zh' | 'en'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.zh
}

const translations = {
  zh: {
    nav: {
      home: '首页',
      docs: '文档',
      script: '脚本',
      faq: '帮助',
      github: 'GitHub',
    },
    hero: {
      badge: '自动化维护 · 即时更新',
      title: 'CertFlow',
      subtitle: 'SSL Certificate Auto Renewal',
      description: '一条命令 · 零配置焦虑 · 让 SSL 续期像呼吸一样自然',
      highlights: [
        '基于 acme.sh 构建，免费获取 Let\'s Encrypt 证书',
        '支持 WebRoot 和 DNS-API 双验证模式，私钥永不离本地',
        '智能续期策略，仅在证书过期前 30 天申请更新',
        '完美适配 Docker 环境，自动重载 Nginx 容器',
      ],
      downloadBtn: '快速开始',
      sourceCodeBtn: '源代码',
    },
    features: {
      title: '核心特性',
      subtitle: '专为开发者设计的SSL证书自动化管理方案',
      singleFile: {
        title: '单文件脚本',
        description: '无需额外依赖，开箱即用',
      },
      secure: {
        title: '私钥永不离本地',
        description: '支持 DNS-API / WebRoot 双验证模式',
      },
      smart: {
        title: '智能续期',
        description: '仅 30 天内到期才申请，减少 Let\'s Encrypt 限额压力',
      },
      docker: {
        title: 'Docker 无缝集成',
        description: '证书更新后自动重载 Nginx 容器',
      },
      batch: {
        title: '批量友好',
        description: '一键适配多域名、多服务器场景',
      },
      notification: {
        title: '通知机制',
        description: '支持 Webhook 通知证书更新状态',
      },
    },
    quickStart: {
      title: '快速开始',
      subtitle: '三步完成部署',
      steps: [
        '下载脚本并解压到目标目录',
        <>修改 <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">DOMAINS</code> / <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">BASE_DIR</code> / <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">RELOAD_CMD</code> 三个变量</>,
        '执行脚本，首次运行自动安装 acme.sh',
      ],
      command: 'curl -L ... | tar -xz',
    },
    docs: {
      title: '部署文档',
      tabs: {
        overview: '概述',
        docker: 'Docker Nginx',
        config: '配置说明',
        cron: '自动续期',
      },
    },
    script: {
      title: '脚本源码',
      subtitle: '',
      description: '完整的SSL证书自动续期脚本，支持 WebRoot 和 DNS-API 双验证模式',
      copy: '复制代码',
      download: '下载脚本',
    },
    footer: {
      description: 'SSL证书自动续期解决方案',
      thanks: '感谢',
      acme: 'acme.sh — 极简强大的 ACME 客户端',
      letsencrypt: 'Let\'s Encrypt — 免费、可信赖的证书权威',
      license: 'MIT License',
    },
  },
  en: {
    nav: {
      home: 'Home',
      docs: 'Docs',
      script: 'Script',
      faq: 'Help',
      github: 'GitHub',
    },
    hero: {
      badge: 'Auto-maintained · Instant Updates',
      title: 'CertFlow',
      subtitle: 'SSL Certificate Auto Renewal',
      description: 'One Command · Zero Config Anxiety · SSL Renewal As Natural As Breathing',
      highlights: [
        'Built on acme.sh, get free Let\'s Encrypt certificates',
        'Supports WebRoot & DNS-API verification, private keys stay local',
        'Smart renewal strategy - only renew 30 days before expiration',
        'Perfect for Docker, auto reloads Nginx containers',
      ],
      downloadBtn: 'Quick Start',
      sourceCodeBtn: 'Source Code',
    },
    features: {
      title: 'Core Features',
      subtitle: 'SSL certificate automation solution designed for developers',
      singleFile: {
        title: 'Single File Script',
        description: 'No extra dependencies, ready to use',
      },
      secure: {
        title: 'Private Key Stays Local',
        description: 'Supports DNS-API / WebRoot dual verification',
      },
      smart: {
        title: 'Smart Renewal',
        description: 'Only renew when expiring within 30 days',
      },
      docker: {
        title: 'Docker Integration',
        description: 'Auto reload Nginx container after cert update',
      },
      batch: {
        title: 'Batch Friendly',
        description: 'One-click for multi-domain, multi-server',
      },
      notification: {
        title: 'Notification',
        description: 'Webhook support for certificate update status',
      },
    },
    quickStart: {
      title: 'Quick Start',
      subtitle: 'Three steps to deploy',
      steps: [
        'Download and extract to target directory',
        <>Modify <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">DOMAINS</code> / <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">BASE_DIR</code> / <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-sm">RELOAD_CMD</code> variables</>,
        'Run script, auto installs acme.sh on first run',
      ],
      command: 'curl -L ... | tar -xz',
    },
    docs: {
      title: 'Deployment Docs',
      tabs: {
        overview: 'Overview',
        docker: 'Docker Nginx',
        config: 'Configuration',
        cron: 'Auto Renewal',
      },
    },
    script: {
      title: 'Script Source',
      subtitle: '',
      description: 'Complete SSL cert auto-renewal script, supports WebRoot and DNS-API verification',
      copy: 'Copy Code',
      download: 'Download Script',
    },
    footer: {
      description: 'SSL Certificate Auto Renewal Solution',
      thanks: 'Thanks to',
      acme: 'acme.sh — Minimal powerful ACME client',
      letsencrypt: 'Let\'s Encrypt — Free, trusted certificate authority',
      license: 'MIT License',
    },
  },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language
      if (saved) return saved
      const browserLang = navigator.language.toLowerCase()
      return browserLang.startsWith('zh') ? 'zh' : 'en'
    }
    return 'zh'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}