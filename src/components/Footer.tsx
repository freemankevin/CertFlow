import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
      <div className="container-custom py-6">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by Freeman
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 CertFlow
          </p>
        </div>
      </div>
    </footer>
  )
}