import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fadeIn } from '@/lib/animations';
import { trackNewsletterSignup } from '@/lib/analytics';
import { subscribeToNewsletter } from '@/services/newsletterService';
import { useLanguage } from '@/stores/languageStore';

export function NewsletterSection() {
  const { t } = useTranslation('newsletter');
  const language = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      await subscribeToNewsletter(email, language);
      trackNewsletterSignup({ source: 'sidebar' });
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setStatus('error');
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-content-heading font-semibold mb-2">{t('sidebar.title')}</h3>
      <p className="text-sm text-content mb-4">
        {t('sidebar.description')}
      </p>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.p
            key="success"
            className="text-sm text-green-600"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            exit={fadeIn.exit}
            transition={fadeIn.transition}
          >
            {t('sidebar.success')}
          </motion.p>
        ) : status === 'error' ? (
          <motion.div
            key="error"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            exit={fadeIn.exit}
            transition={fadeIn.transition}
          >
            <p className="text-sm text-red-600 mb-2">
              {t('sidebar.error')}
            </p>
            <Button size="sm" variant="outline" onClick={() => setStatus('idle')}>
              {t('sidebar.retry')}
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="flex gap-2"
            initial={fadeIn.initial}
            animate={fadeIn.animate}
            exit={fadeIn.exit}
            transition={fadeIn.transition}
          >
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('sidebar.placeholder')}
              className="flex-1 text-sm text-content-heading placeholder:text-content-faint bg-background border-divider"
              required
            />
            <Button
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? '...' : t('sidebar.submit')}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
