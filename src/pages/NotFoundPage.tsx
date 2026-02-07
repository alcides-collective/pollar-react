import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { LocalizedLink } from '@/components/LocalizedLink'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const { t } = useTranslation('errors')

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-[8rem] font-bold leading-none text-content-faint select-none"
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="text-2xl font-bold text-content-heading mt-4 mb-3"
        >
          {t('notFound.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className="text-content-subtle mb-8"
        >
          {t('notFound.description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        >
          <Button size="lg" asChild>
            <LocalizedLink to="/">
              <i className="ri-home-4-line" />
              {t('notFound.backHome')}
            </LocalizedLink>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
