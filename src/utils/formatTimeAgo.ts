type TranslatorFn = (key: string, options?: Record<string, unknown>) => string;

export function formatTimeAgo(dateString: string, t?: TranslatorFn): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (t) {
    if (diffMins < 1) return t('time.now');
    if (diffMins < 60) return `${diffMins} ${t('time.min')}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ${t('time.hours')}`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${t('time.days')}`;
  }

  // Fallback for non-i18n usage (backwards compatibility)
  if (diffMins < 1) return 'teraz';
  if (diffMins < 60) return `${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} godz.`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} dni`;
}
