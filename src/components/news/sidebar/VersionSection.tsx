import { useTranslation } from 'react-i18next';

export function VersionSection() {
  const { t } = useTranslation('common');

  const changelog = [
    {
      icon: "ri-layout-4-line",
      titleKey: "changelog.newInterface.title",
      descriptionKey: "changelog.newInterface.description",
    },
    {
      icon: "ri-user-line",
      titleKey: "changelog.userAccounts.title",
      descriptionKey: "changelog.userAccounts.description",
    },
    {
      icon: "ri-user-follow-line",
      titleKey: "changelog.mpTracking.title",
      descriptionKey: "changelog.mpTracking.description",
    },
    {
      icon: "ri-heart-line",
      titleKey: "changelog.favoriteCategories.title",
      descriptionKey: "changelog.favoriteCategories.description",
    },
    {
      icon: "ri-bookmark-line",
      titleKey: "changelog.savedArticles.title",
      descriptionKey: "changelog.savedArticles.description",
    },
    {
      icon: "ri-notification-3-line",
      titleKey: "changelog.notifications.title",
      descriptionKey: "changelog.notifications.description",
    },
    {
      icon: "ri-flashlight-line",
      titleKey: "changelog.latestNews.title",
      descriptionKey: "changelog.latestNews.description",
    },
    {
      icon: "ri-robot-line",
      titleKey: "changelog.aiFeuilletons.title",
      descriptionKey: "changelog.aiFeuilletons.description",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-zinc-900 font-semibold">{t('sidebar.whatsNew')}</h3>
        <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
          v0.3.0
        </span>
      </div>
      <div className="space-y-3">
        {changelog.map((item) => (
          <div key={item.titleKey}>
            <p className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
              <i className={`${item.icon} text-zinc-400`} />
              {t(item.titleKey)}
            </p>
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5 pl-[18px]">
              {t(item.descriptionKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
