import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProStore } from '@/stores/proStore';

const featureIcons = [
  { icon: 'ri-magic-line', key: 'personalizedBrief' },
  { icon: 'ri-search-line', key: 'unlimitedSearch' },
  { icon: 'ri-government-line', key: 'mpTracking' },
  { icon: 'ri-download-line', key: 'dataExport' },
  { icon: 'ri-archive-line', key: 'fullArchive' },
  { icon: 'ri-eye-off-line', key: 'noAds' },
  { icon: 'ri-moon-line', key: 'darkMode' },
  { icon: 'ri-message-2-line', key: 'prioritySupport' },
];

export function ProModal() {
  const { t } = useTranslation('common');
  const isOpen = useProStore((s) => s.isProModalOpen);
  const closeModal = useProStore((s) => s.closeProModal);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('pro.title')}</DialogTitle>
          <DialogDescription>
            {t('pro.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 my-4">
          {featureIcons.map((feature) => (
            <li key={feature.key} className="flex items-center gap-3 text-sm">
              <i className={`${feature.icon} text-zinc-400`} />
              <span>{t(`pro.features.${feature.key}`)}</span>
            </li>
          ))}
        </ul>

        <div className="border-t pt-4">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-2xl font-semibold">{t('pro.price')}</span>
            <span className="text-sm text-zinc-500">{t('pro.perMonth')}</span>
          </div>
          <Button className="w-full" disabled>
            {t('pro.comingSoon')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
