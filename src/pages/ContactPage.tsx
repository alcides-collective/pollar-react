import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { API_BASE } from '@/config/api';

const SUBJECT_KEYS = ['bug', 'feature', 'question', 'partnership', 'gdpr', 'other'] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

function ContactForm() {
  const { t } = useTranslation('contact');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = t('form.validation.nameRequired');
    if (!email.trim()) errs.email = t('form.validation.emailRequired');
    else if (!EMAIL_REGEX.test(email)) errs.email = t('form.validation.emailInvalid');
    if (!message.trim()) errs.message = t('form.validation.messageRequired');
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject || 'other',
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(t('form.success'));
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setErrors({});
    } catch {
      toast.error(t('form.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-content-heading mb-1.5">
          {t('form.name')}
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-content-heading outline-none transition-colors focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
            errors.name ? 'border-red-400' : 'border-divider'
          }`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-content-heading mb-1.5">
          {t('form.email')}
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-content-heading outline-none transition-colors focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
            errors.email ? 'border-red-400' : 'border-divider'
          }`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-content-heading mb-1.5">
          {t('form.subject')}
        </label>
        <select
          id="contact-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-divider bg-background px-3.5 py-2.5 text-sm text-content-heading outline-none transition-colors focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
        >
          <option value="">{t('form.subjectPlaceholder')}</option>
          {SUBJECT_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(`form.subjects.${key}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-content-heading mb-1.5">
          {t('form.message')}
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('form.messagePlaceholder')}
          className={`w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-content-heading outline-none transition-colors resize-y focus:ring-2 focus:ring-red-500/20 focus:border-red-500 ${
            errors.message ? 'border-red-400' : 'border-divider'
          }`}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t('form.sending') : t('form.submit')}
      </button>
    </form>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-divider last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium text-content-heading pr-4">{question}</span>
        <i
          className={`ri-arrow-down-s-line text-lg text-content-faint shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm text-content leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { t } = useTranslation('contact');
  const faqItems = t('faq.items', { returnObjects: true }) as { question: string; answer: string }[];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2 text-content-heading">{t('title')}</h1>
      <p className="text-content mb-10">{t('description')}</p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        {/* Left column — form + FAQ */}
        <div className="space-y-12 min-w-0">
          {/* Contact form */}
          <section>
            <div className="bg-background border border-divider rounded-lg p-6">
              <ContactForm />
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-xl font-semibold text-content-heading mb-4">{t('faq.title')}</h2>
            <div className="bg-background border border-divider rounded-lg px-6">
              {Array.isArray(faqItems) &&
                faqItems.map((item, i) => (
                  <FAQItem key={i} question={item.question} answer={item.answer} />
                ))}
            </div>
          </section>
        </div>

        {/* Right column — team, social, company */}
        <aside className="space-y-8">
          {/* Team */}
          <section>
            <h2 className="text-lg font-semibold text-content-heading mb-3">{t('team.title')}</h2>
            <div className="space-y-3">
              {(['jakub', 'bartosz', 'ignacy'] as const).map((key) => (
                <div key={key} className="bg-background border border-divider rounded-lg p-4">
                  <p className="font-medium text-content-heading">{t(`team.${key}.name`)}</p>
                  <p className="text-sm text-content-subtle mt-0.5">{t(`team.${key}.role`)}</p>
                  <a
                    href={`mailto:${t(`team.${key}.email`)}`}
                    className="inline-block mt-2 text-sm text-red-600 hover:underline"
                  >
                    {t(`team.${key}.email`)}
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Social media */}
          <section>
            <h2 className="text-lg font-semibold text-content-heading mb-3">{t('social.title')}</h2>
            <div className="flex flex-col gap-2">
              <a
                href="https://x.com/pollarnews"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-divider bg-background px-4 py-2.5 text-sm text-content hover:border-divider hover:text-content-heading transition-colors"
              >
                <i className="ri-twitter-x-line text-base" />
                @pollarnews
              </a>
              <a
                href="https://www.linkedin.com/company/108790026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-divider bg-background px-4 py-2.5 text-sm text-content hover:border-divider hover:text-content-heading transition-colors"
              >
                <i className="ri-linkedin-line text-base" />
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/pollar.news"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-divider bg-background px-4 py-2.5 text-sm text-content hover:border-divider hover:text-content-heading transition-colors"
              >
                <i className="ri-instagram-line text-base" />
                @pollar.news
              </a>
            </div>
          </section>

          {/* Company details */}
          <section>
            <h2 className="text-lg font-semibold text-content-heading mb-3">{t('company.title')}</h2>
            <div className="bg-surface rounded-lg p-4 text-sm text-content space-y-1">
              <p className="font-medium text-content-heading">{t('company.name')}</p>
              <p>{t('company.address')}</p>
              <p>{t('company.krs')}</p>
              <p>{t('company.nip')}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
