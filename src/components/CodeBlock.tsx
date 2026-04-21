import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import yaml from 'highlight.js/lib/languages/yaml'
import nginx from 'highlight.js/lib/languages/nginx'
import 'highlight.js/styles/atom-one-dark.css'
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
    <div className={cn('code-block', className)}>
      <div className="code-header">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          {filename && (
            <span className="ml-3 text-xs text-gray-400 font-medium tracking-wide">
              {filename}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-400 hover:text-white bg-gray-700/40 hover:bg-gray-700/60 rounded transition-all"
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="code-content scrollbar-thin">
        <pre className="text-gray-200">
          {showLineNumbers ? (
            <table className="w-full border-collapse">
              <tbody>
                {rawLines.map((_, i) => (
                  <tr key={i} className="code-line">
                    <td className="line-number">
                      {i + 1}
                    </td>
                    <td className="whitespace-pre font-mono">
                      <code dangerouslySetInnerHTML={{ __html: highlightedLines[i] || ' ' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code ref={codeRef} className={`language-${language}`}>
              {code}
            </code>
          )}
        </pre>
      </div>
    </div>
  )
}