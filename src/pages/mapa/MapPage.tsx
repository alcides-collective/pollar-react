import { useTranslation } from 'react-i18next';
import { EventsMap } from './EventsMap';

export function MapPage() {
  const { t } = useTranslation();
  const hour = new Date().getHours();
  const title = t(`map.titles.${hour}`);

  return (
    <div className="fixed inset-0 z-0">
      {/* Optional: Title overlay */}
      <div className="absolute top-4 right-4 z-10 hidden md:block">
        <span className="text-sm text-content-subtle bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
          {title}
        </span>
      </div>

      {/* Map */}
      <EventsMap />
    </div>
  );
}
