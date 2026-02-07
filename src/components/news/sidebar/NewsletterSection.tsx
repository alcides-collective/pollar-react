import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fadeIn } from '@/lib/animations';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    // TODO: Implement actual newsletter signup
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 500);
  };

  return (
    <div className="p-6">
      <h3 className="text-content-heading font-semibold mb-2">Newsletter</h3>
      <p className="text-sm text-content mb-4">
        Otrzymuj codzienny przegląd najważniejszych wydarzeń.
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
            Dziękujemy za zapisanie się!
          </motion.p>
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
              placeholder="Twój email"
              className="flex-1 text-sm text-content-heading placeholder:text-content-faint bg-background border-divider"
              required
            />
            <Button
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? '...' : 'Zapisz'}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
