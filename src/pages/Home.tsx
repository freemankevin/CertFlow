import { Link } from 'react-router-dom'
import { 
  FileCode, 
  Clock, 
  Globe, 
  ArrowRight,
  CheckCircle2,
  Zap,
  Bell
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDocker } from '@fortawesome/free-brands-svg-icons'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '../contexts/I18nContext'

const DockerIcon = () => <FontAwesomeIcon icon={faDocker} className="h-6 w-6" />
const KeyIcon = () => <FontAwesomeIcon icon={faKey} className="h-6 w-6" />

export function HomePage() {
  const { t, language } = useI18n()

  const features = [
    {
      icon: FileCode,
      title: t.features.singleFile.title,
      description: t.features.singleFile.description,
    },
    {
      icon: KeyIcon,
      title: t.features.secure.title,
      description: t.features.secure.description,
    },
    {
      icon: Clock,
      title: t.features.smart.title,
      description: t.features.smart.description,
    },
    {
      icon: DockerIcon,
      title: t.features.docker.title,
      description: t.features.docker.description,
    },
    {
      icon: Globe,
      title: t.features.batch.title,
      description: t.features.batch.description,
    },
    {
      icon: Bell,
      title: t.features.notification.title,
      description: t.features.notification.description,
    },
  ]

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden bg-gradient-to-br from-ssl-dark via-blue-900 to-ssl-blue dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        
        <div className="container-custom relative py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-gray-800/40 backdrop-blur-sm text-white/90 text-sm mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span>{t.hero.badge}</span>
            </div>
            
            <h1 className={`text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
              {t.hero.title}
              {t.hero.subtitle && (
                <span className={`block text-xl lg:text-3xl font-normal text-white/80 mt-2 whitespace-nowrap ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                  {t.hero.subtitle}
                </span>
              )}
            </h1>
            
            <p className={`text-xl lg:text-2xl text-white/70 mb-6 leading-relaxed whitespace-nowrap ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
              {t.hero.description}
            </p>

            <div className="mb-10 space-y-3">
              {t.hero.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-3 text-white/60">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className={`text-base lg:text-lg ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/docs" className="btn-glass bg-white/90 text-ssl-blue hover:bg-white dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-700 shadow-xl shadow-white/20 dark:shadow-black/20">
                <Zap className="h-5 w-5 mr-2" />
                {t.hero.downloadBtn}
              </Link>
              <a 
                href="https://github.com/freemankevin/CertFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-glass text-white border-white/20 hover:border-white/40"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                {t.hero.sourceCodeBtn}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
              {t.features.title}
            </h2>
            <p className={`text-gray-600 dark:text-gray-400 max-w-2xl mx-auto ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
              {t.features.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const isCustomIcon = typeof feature.icon === 'function' && (feature.icon.name === 'DockerIcon' || feature.icon.name === 'KeyIcon')
              return (
                <div key={feature.title} className="feature-card group">
                  <div className="w-12 h-12 rounded-xl bg-ssl-blue/10 dark:bg-ssl-blue/20 flex items-center justify-center mb-4 group-hover:bg-ssl-blue group-hover:text-white transition-colors">
                    {isCustomIcon ? (
                      <div className="text-ssl-blue group-hover:text-white transition-colors">
                        <feature.icon />
                      </div>
                    ) : (
                      <feature.icon className="h-6 w-6 text-ssl-blue group-hover:text-white" />
                    )}
                  </div>
                  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-gray-600 dark:text-gray-400 text-sm leading-relaxed ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold text-gray-900 dark:text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
                {t.quickStart.title}
              </h2>
              <p className={`text-gray-600 dark:text-gray-400 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                {t.quickStart.subtitle}
              </p>
            </div>
            
            <div className="glass-card rounded-lg p-8">
              <div className="grid gap-6">
                {t.quickStart.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-ssl-blue/10 dark:bg-ssl-blue/20 text-ssl-blue flex items-center justify-center font-semibold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`text-base text-gray-700 dark:text-gray-300 ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
                        {step}
                      </p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 text-center">
                <Link 
                  to="/docs"
                  className="inline-flex items-center text-base text-ssl-blue hover:text-blue-600 font-medium"
                >
                  {language === 'zh' ? '完整文档' : 'Full Docs'}
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="container-custom">
          <div className="rounded-lg p-8 lg:p-16 text-center bg-gradient-to-br from-ssl-dark via-blue-900 to-ssl-blue dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            <h2 className={`text-3xl lg:text-4xl font-bold text-white mb-4 ${language === 'zh' ? 'font-elegant-zh' : 'font-elegant'}`}>
              {language === 'zh' ? '开始使用 CertFlow' : 'Get Started with CertFlow'}
            </h2>
            <p className={`text-white/70 mb-8 max-w-2xl mx-auto ${language === 'zh' ? 'font-body-zh' : 'font-body'}`}>
              {language === 'zh' ? '简单三步，让您的 SSL 证书永不过期' : 'Three simple steps to keep your SSL certificates always valid'}
            </p>
            <Link 
              to="/script"
              className="btn-glass bg-white/90 text-ssl-blue hover:bg-white dark:bg-gray-800/90 dark:text-white dark:hover:bg-gray-700 text-base px-8 py-4 shadow-xl shadow-white/20 dark:shadow-black/20"
            >
              <Zap className="h-5 w-5 mr-2" />
              {language === 'zh' ? '查看脚本源码' : 'View Script Source'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}