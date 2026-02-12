import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { useLanguage } from '../../stores/languageStore';

const BASE_URL = 'https://pollar.news';

const READERS = [
  { name: 'Feedly', platform: 'Web', url: 'https://feedly.com', free: true },
  { name: 'Inoreader', platform: 'Web', url: 'https://www.inoreader.com', free: true },
  { name: 'NetNewsWire', platform: 'macOS / iOS', url: 'https://netnewswire.com', free: true },
  { name: 'Reeder', platform: 'macOS / iOS', url: 'https://reederapp.com', free: false },
  { name: 'Read You', platform: 'Android', url: 'https://github.com/Ashinch/ReadYou', free: true },
  { name: 'Feeder', platform: 'Android', url: 'https://play.google.com/store/apps/details?id=com.nononsenseapps.feeder.play', free: true },
];

function FeedRow({ label, description, feedUrl, feedProtocolUrl }: {
  label: string;
  description: string;
  feedUrl: string;
  feedProtocolUrl: string;
}) {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      toast.success(t('rss.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = feedUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      toast.success(t('rss.copied'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-divider bg-muted/30">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h4 className="font-semibold text-content">{label}</h4>
          <p className="text-sm text-content-subtle mt-0.5">{description}</p>
        </div>
        <i className="ri-rss-line text-xl text-orange-500 shrink-0 mt-0.5" />
      </div>
      <div className="flex items-center gap-2 mt-3">
        <code className="flex-1 text-xs bg-background border border-divider rounded-lg px-3 py-2 text-content-subtle truncate select-all">
          {feedUrl}
        </code>
        <button
          onClick={handleCopy}
          className={`shrink-0 h-8 px-3 text-xs font-medium rounded-lg border transition-all ${
            copied
              ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : 'bg-muted border-divider text-content-subtle hover:text-content hover:border-content/20'
          }`}
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <i className="ri-check-line" />
              {t('rss.copied')}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <i className="ri-file-copy-line" />
              {t('rss.copy')}
            </span>
          )}
        </button>
        <a
          href={feedProtocolUrl}
          className="shrink-0 h-8 px-3 text-xs font-medium rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-all flex items-center gap-1"
          title={t('rss.openInReader')}
        >
          <i className="ri-external-link-line" />
          <span className="hidden sm:inline">{t('rss.openInReader')}</span>
        </a>
      </div>
    </div>
  );
}

export function RssPage() {
  const { t } = useTranslation('common');
  const language = useLanguage();

  const langPrefix = language !== 'pl' ? `/${language}` : '';
  const mainFeedUrl = `${BASE_URL}${langPrefix}/feed.xml`;
  const blogFeedUrl = `${BASE_URL}${langPrefix}/blog/feed.xml`;
  const mainFeedProtocol = `feed:${mainFeedUrl}`;
  const blogFeedProtocol = `feed:${blogFeedUrl}`;

  useDocumentHead({
    title: t('rss.title'),
    description: t('rss.subtitle'),
  });

  const steps = [
    { icon: 'ri-smartphone-line', title: t('rss.step1Title'), desc: t('rss.step1Desc') },
    { icon: 'ri-file-copy-line', title: t('rss.step2Title'), desc: t('rss.step2Desc') },
    { icon: 'ri-check-double-line', title: t('rss.step3Title'), desc: t('rss.step3Desc') },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="lg:grid lg:grid-cols-3 gap-8">
        {/* Left panel — main content */}
        <div className="order-2 lg:order-1 lg:col-span-2 space-y-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <i className="ri-rss-line text-xl text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-content">{t('rss.title')}</h1>
            </div>
            <p className="text-content-subtle mt-2">{t('rss.subtitle')}</p>
          </motion.div>

          {/* What is RSS */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <h2 className="text-lg font-semibold text-content mb-3">{t('rss.whatIsRss')}</h2>
            <p className="text-content-subtle leading-relaxed">{t('rss.whatIsRssDesc')}</p>
          </motion.section>

          {/* How to start */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-content mb-4">{t('rss.howToStart')}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="relative p-4 rounded-xl border border-divider bg-muted/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-6 w-6 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <i className={`${step.icon} text-lg text-content-subtle`} />
                  </div>
                  <h3 className="font-medium text-content text-sm">{step.title}</h3>
                  <p className="text-xs text-content-subtle mt-1">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Available feeds */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <h2 className="text-lg font-semibold text-content mb-4">{t('rss.availableFeeds')}</h2>
            <div className="space-y-3">
              <FeedRow
                label={t('rss.mainFeed')}
                description={t('rss.mainFeedDesc')}
                feedUrl={mainFeedUrl}
                feedProtocolUrl={mainFeedProtocol}
              />
              <FeedRow
                label={t('rss.blogFeed')}
                description={t('rss.blogFeedDesc')}
                feedUrl={blogFeedUrl}
                feedProtocolUrl={blogFeedProtocol}
              />
            </div>
          </motion.section>

          {/* License */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-4 rounded-xl border border-divider bg-muted/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-creative-commons-line text-lg text-content-subtle" />
              <h3 className="font-semibold text-content text-sm">{t('rss.license')}</h3>
            </div>
            <p className="text-xs text-content-subtle leading-relaxed">{t('rss.licenseDesc')}</p>
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 mt-2 transition-colors"
            >
              CC BY-NC-SA 4.0
              <i className="ri-external-link-line text-[10px]" />
            </a>
          </motion.section>
        </div>

        {/* Right sidebar */}
        <div className="order-1 lg:order-2 lg:col-span-1 mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            {/* Recommended readers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="rounded-xl border border-divider bg-card p-4">
                <h3 className="text-sm font-semibold text-content flex items-center gap-2 mb-3">
                  <i className="ri-apps-line text-content-subtle" />
                  {t('rss.recommendedReaders')}
                </h3>
                <div className="space-y-1">
                  {READERS.map((reader) => (
                    <a
                      key={reader.name}
                      href={reader.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div>
                        <span className="text-sm font-medium text-content group-hover:text-orange-500 transition-colors">
                          {reader.name}
                        </span>
                        <span className="text-xs text-content-subtle ml-2">{reader.platform}</span>
                      </div>
                      {reader.free && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded font-medium">
                          Free
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* feed: protocol */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <div className="rounded-xl border border-divider bg-card p-4">
                <h3 className="text-sm font-semibold text-content flex items-center gap-2 mb-2">
                  <i className="ri-link text-content-subtle" />
                  {t('rss.feedProtocol')}
                </h3>
                <p className="text-xs text-content-subtle leading-relaxed">
                  {t('rss.feedProtocolDesc')}
                </p>
              </div>
            </motion.div>

            {/* Autodiscovery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="rounded-xl border border-divider bg-card p-4">
                <h3 className="text-sm font-semibold text-content flex items-center gap-2 mb-2">
                  <i className="ri-search-eye-line text-content-subtle" />
                  {t('rss.autodiscovery')}
                </h3>
                <p className="text-xs text-content-subtle leading-relaxed">
                  {t('rss.autodiscoveryDesc')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
