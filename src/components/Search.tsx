import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Search as SearchIcon, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '../lib/utils'

interface SearchItem {
  id: string
  title: string
  section: string
}

function useSearchData(isZh: boolean): SearchItem[] {
  return useMemo(
    () => [
      { id: 'features', title: isZh ? '功能特性' : 'Features', section: isZh ? '概览' : 'Overview' },
      { id: 'prerequisites', title: isZh ? '前置要求' : 'Prerequisites', section: isZh ? '概览' : 'Overview' },
      { id: 'download', title: isZh ? '下载安装' : 'Download & Install', section: isZh ? '快速开始' : 'Quick Start' },
      { id: 'config', title: isZh ? '配置文件' : 'Configuration', section: isZh ? '快速开始' : 'Quick Start' },
      { id: 'run', title: isZh ? '执行脚本' : 'Run Script', section: isZh ? '快速开始' : 'Quick Start' },
      { id: 'core-config', title: isZh ? '核心配置' : 'Core Configuration', section: isZh ? '配置说明' : 'Configuration' },
      { id: 'verify-config', title: isZh ? '验证模式配置' : 'Verification Mode', section: isZh ? '配置说明' : 'Configuration' },
      { id: 'advanced-config', title: isZh ? '高级选项' : 'Advanced Options', section: isZh ? '配置说明' : 'Configuration' },
      { id: 'webroot-mode', title: isZh ? 'WebRoot 验证' : 'WebRoot Verification', section: isZh ? '验证模式' : 'Verification Modes' },
      { id: 'dns-mode', title: isZh ? 'DNS-API 验证' : 'DNS-API Verification', section: isZh ? '验证模式' : 'Verification Modes' },
      { id: 'dns-providers', title: isZh ? '支持的 DNS 提供商' : 'Supported DNS Providers', section: isZh ? '验证模式' : 'Verification Modes' },
      { id: 'webhook-config', title: isZh ? 'Webhook 配置' : 'Webhook Configuration', section: isZh ? 'Webhook 通知' : 'Webhook' },
      { id: 'webhook-types', title: isZh ? '支持的通知类型' : 'Supported Notification Types', section: isZh ? 'Webhook 通知' : 'Webhook' },
      { id: 'docker-install', title: isZh ? 'Docker 环境安装' : 'Docker Installation', section: isZh ? 'Docker 部署' : 'Docker' },
      { id: 'docker-compose', title: isZh ? '启动服务' : 'Start Services', section: isZh ? 'Docker 部署' : 'Docker' },
      { id: 'nginx-config', title: isZh ? 'Nginx 配置要点' : 'Nginx Configuration', section: isZh ? 'Docker 部署' : 'Docker' },
      { id: 'faq-cert', title: isZh ? '证书申请相关' : 'Certificate Application', section: isZh ? '常见问题' : 'FAQ' },
      { id: 'faq-config', title: isZh ? '配置相关' : 'Configuration', section: isZh ? '常见问题' : 'FAQ' },
      { id: 'faq-usage', title: isZh ? '使用问题' : 'Usage', section: isZh ? '常见问题' : 'FAQ' },
    ],
    [isZh]
  )
}

function highlightMatch(text: string, query: string) {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-transparent text-gray-900 dark:text-gray-100 underline underline-offset-2 decoration-gray-400">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export function SearchTrigger({ isZh }: { isZh: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchData = useSearchData(isZh)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return searchData.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q)
    )
  }, [query, searchData])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleNavigate = useCallback(
    (id: string) => {
      setOpen(false)
      setQuery('')
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    []
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((prev) => (prev + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((prev) => (prev - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filtered[selected]) {
          handleNavigate(filtered[selected].id)
        }
      }
    },
    [filtered, selected, handleNavigate]
  )

  useEffect(() => {
    if (listRef.current) {
      const active = listRef.current.querySelector('[data-selected="true"]') as HTMLElement
      if (active) {
        active.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selected])

  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'hidden md:flex items-center gap-2 px-3 py-1.5 text-sm',
          'bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10',
          'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
          'rounded-md border border-gray-200 dark:border-gray-700/50 transition-colors',
          'w-[28rem] max-w-full',
        )}
      >
        <SearchIcon className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">{isZh ? '搜索文档...' : 'Search documentation...'}</span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
      </button>

      {/* Mobile search icon */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <SearchIcon className="h-4 w-4" />
      </button>

      {/* Command palette modal */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/30 dark:bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className={cn(
              'w-full max-w-xl mx-4 rounded-xl overflow-hidden shadow-2xl',
              'bg-white dark:bg-[#131820] border border-gray-200 dark:border-gray-800/40',
              'transition-colors'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-gray-800/40">
              <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-600" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isZh ? '搜索文档...' : 'Search documentation...'}
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none text-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {isZh ? '清除' : 'Clear'}
                </button>
              )}
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto scrollbar-thin">
              {!query.trim() ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-500">
                  {isZh ? '输入关键词开始搜索文档...' : 'Start typing to search the docs...'}
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-600">
                  {isZh ? '未找到结果' : 'No results found'}
                </div>
              ) : (
                <div className="py-2">
                  {filtered.map((item, index) => (
                    <button
                      key={item.id}
                      data-selected={index === selected}
                      onClick={() => handleNavigate(item.id)}
                      onMouseEnter={() => setSelected(index)}
                      className={cn(
                        'w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between',
                        index === selected
                          ? 'bg-gray-100 dark:bg-white/5'
                          : 'hover:bg-gray-50 dark:hover:bg-white/5'
                      )}
                    >
                      <div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {highlightMatch(item.title, query)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                          {item.section}
                        </div>
                      </div>
                      {index === selected && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="hidden sm:flex items-center justify-between px-4 py-2.5 border-t border-gray-200 dark:border-gray-800/40 text-[11px] text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 text-gray-500 dark:text-gray-400">
                    <ArrowUp className="h-3 w-3" />
                  </kbd>
                  <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 text-gray-500 dark:text-gray-400">
                    <ArrowDown className="h-3 w-3" />
                  </kbd>
                  <span className="ml-0.5">{isZh ? '选择' : 'Navigate'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 text-gray-500 dark:text-gray-400">
                    <CornerDownLeft className="h-3 w-3" />
                  </kbd>
                  <span>{isZh ? '跳转' : 'Open'}</span>
                </span>
              </div>
              <span className="flex items-center gap-1.5">
                <kbd className="inline-flex items-center justify-center h-5 min-w-[28px] px-1 rounded bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 text-[10px] font-sans">
                  esc
                </kbd>
                <span>{isZh ? '关闭' : 'Close'}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
