import { useEffect, useState } from 'react'
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

export function CodeBlock({ code, language = 'bash', filename, className, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [highlightedLines, setHighlightedLines] = useState<string[]>([])

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
        {filename && (
          <span className="text-xs text-gray-500 font-medium tracking-wide">
            {filename}
          </span>
        )}
        <button
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors",
            copied
              ? "text-green-400"
              : "text-gray-500 hover:text-gray-300"
          )}
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="code-content scrollbar-thin">
        <pre className="text-gray-300">
          {showLineNumbers ? (
            <table className="w-full border-collapse">
              <tbody>
                {rawLines.map((_, i) => (
                  <tr key={i} className="code-line">
                    <td className="line-number">{i + 1}</td>
                    <td className="whitespace-pre">
                      <code dangerouslySetInnerHTML={{ __html: highlightedLines[i] || ' ' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  )
}
