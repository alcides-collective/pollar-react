import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useCookieConsentStore } from '@/stores/cookieConsentStore';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ checked, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2
        focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white
        ${checked ? 'bg-red-600' : 'bg-content-faint'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg
          ring-0 transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

interface CookieSettingRowProps {
  title: string;
  summary: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  alwaysOnLabel?: string;
}

function CookieSettingRow({ title, summary, description, checked, onChange, disabled = false, alwaysOnLabel }: CookieSettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-5 border-b border-divider last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-content-heading">{title}</h3>
          {alwaysOnLabel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface text-content">
              {alwaysOnLabel}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-content">{summary}</p>
        <p className="mt-1 text-xs text-content-faint">{description}</p>
      </div>
      <div className="shrink-0 pt-0.5">
        <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
}

export function CookieSettingsPage() {
  const { t } = useTranslation('cookies');
  const { consent, setConsent, loadFromStorage } = useCookieConsentStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Default to necessary only if no consent yet
  const currentConsent = consent ?? { necessary: true, analytics: false, marketing: false };

  const handleAnalyticsChange = (enabled: boolean) => {
    setConsent({
      ...currentConsent,
      analytics: enabled,
    });
  };

  const handleMarketingChange = (enabled: boolean) => {
    setConsent({
      ...currentConsent,
      marketing: enabled,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <article>
        <h1 className="text-3xl font-bold mb-2 text-content-heading">{t('settings.title')}</h1>
        <p className="text-content mb-8">
          {t('settings.description')}{' '}
          <LocalizedLink to="/polityka-prywatnosci" className="text-red-600 hover:underline">
            {t('settings.privacyPolicy')}
          </LocalizedLink>
          .
        </p>

        <div className="bg-surface-alt border border-divider rounded-lg divide-y divide-divider">
          <div className="px-6">
            <CookieSettingRow
              title={t('settings.necessary.title')}
              summary={t('settings.necessary.summary')}
              description={t('settings.necessary.description')}
              checked={true}
              onChange={() => {}}
              disabled={true}
              alwaysOnLabel={t('settings.alwaysEnabled')}
            />
          </div>

          <div className="px-6">
            <CookieSettingRow
              title={t('settings.analytics.title')}
              summary={t('settings.analytics.summary')}
              description={t('settings.analytics.description')}
              checked={currentConsent.analytics}
              onChange={handleAnalyticsChange}
            />
          </div>

          <div className="px-6">
            <CookieSettingRow
              title={t('settings.marketing.title')}
              summary={t('settings.marketing.summary')}
              description={t('settings.marketing.description')}
              checked={currentConsent.marketing}
              onChange={handleMarketingChange}
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-surface rounded-lg">
          <p className="text-sm text-content">
            <span className="font-medium text-content-heading">{t('settings.noticeLabel')}</span> {t('settings.notice')}
          </p>
        </div>
      </article>
    </div>
  );
}
