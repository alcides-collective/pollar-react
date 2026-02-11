import { useTranslation } from 'react-i18next';
import { useEngineStatus } from '../../hooks/useEngineStatus';

interface EngineStatusBannerProps {
  className?: string;
}

export function EngineStatusBanner({ className = '' }: EngineStatusBannerProps) {
  const { t } = useTranslation('common');
  const engineDown = useEngineStatus();

  if (!engineDown) return null;

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30 p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <i className="ri-alert-line text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <p>{t('sidebar.engineDown')}</p>
          <a
            href="https://status.pollar.news"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1.5 font-medium text-amber-700 dark:text-amber-200 hover:underline"
          >
            {t('sidebar.engineStatusLink')}
            <i className="ri-external-link-line text-[10px]" />
          </a>
        </div>
      </div>
    </div>
  );
}
