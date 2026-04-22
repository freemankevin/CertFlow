import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import yaml from 'highlight.js/lib/languages/yaml'
import nginx from 'highlight.js/lib/languages/nginx'
import { cn } from '../lib/utils'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('nginx', nginx)
hljs.registerLanguage('sh', bash)

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  className?: string
  showLineNumbers?: boolean
}

const CODE_FONT_FAMILY = "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, 'Courier New', monospace"

export function CodeBlock({ code, language = 'bash', filename, className, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [highlightedLines, setHighlightedLines] = useState<string[]>([])
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    try {
      const highlighted = hljs.highlight(code, { language }).value
      const lines = highlighted.split('\n')
      setHighlightedLines(lines)
    } catch {
      setHighlightedLines(code.split('\n'))
    }
  }, [code, language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const rawLines = code.split('\n')

  return (
    <div className={cn('code-block', className)} style={{ fontFamily: CODE_FONT_FAMILY }}>
      <div className="code-header" style={{ fontFamily: CODE_FONT_FAMILY }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm" />
          </div>
          {filename && (
            <span className="ml-2 text-xs text-gray-500 font-medium tracking-wide font-mono" style={{ fontFamily: CODE_FONT_FAMILY }}>
              {filename}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all duration-200",
            copied 
              ? "text-green-400 bg-green-500/10 border border-green-500/20" 
              : "text-gray-500 hover:text-gray-300 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 hover:border-gray-500/50"
          )}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="leading-none">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="code-content scrollbar-thin" style={{ fontFamily: CODE_FONT_FAMILY }}>
        <pre className="text-gray-300" style={{ fontFamily: CODE_FONT_FAMILY }}>
          {showLineNumbers ? (
            <table className="w-full border-collapse" style={{ fontFamily: CODE_FONT_FAMILY }}>
              <tbody style={{ fontFamily: CODE_FONT_FAMILY }}>
                {rawLines.map((_, i) => (
                  <tr key={i} className="code-line">
                    <td className="line-number" style={{ fontFamily: CODE_FONT_FAMILY }}>
                      {i + 1}
                    </td>
                    <td className="whitespace-pre font-mono" style={{ fontFamily: CODE_FONT_FAMILY }}>
                      <code className="font-mono" style={{ fontFamily: CODE_FONT_FAMILY }} dangerouslySetInnerHTML={{ __html: highlightedLines[i] || ' ' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code ref={codeRef} className={`language-${language} font-mono`} style={{ fontFamily: CODE_FONT_FAMILY }}>
              {code}
            </code>
          )}
        </pre>
      </div>
    </div>
  )
}