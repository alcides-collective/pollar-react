import { EventsMap } from './EventsMap';

// Time-based map titles (24 variants)
const mapTitles: Record<number, string> = {
  0: 'Kartografia insomników',
  1: 'Atlas północny',
  2: 'Mapa bezsennych',
  3: 'Zwiad o trzeciej',
  4: 'Atlas świtu',
  5: 'Pierwsze współrzędne',
  6: 'Rekonesans poranka',
  7: 'Mapa przy kawie',
  8: 'Dzienny porządek rzeczy',
  9: 'Orientacja w terenie',
  10: 'Punkt na mapie',
  11: 'Atlas przedpołudnia',
  12: 'Mapa w zenicie',
  13: 'Kartografia lunchu',
  14: 'Mapa po obiedzie',
  15: 'Herbaciana kartografia',
  16: 'Naniesienia schyłkowe',
  17: 'Mapa po godzinach',
  18: 'Topografia zmierzchu',
  19: 'Mapa przy kolacji',
  20: 'Przegląd granic',
  21: 'Orientacja nocna',
  22: 'Ostatni rzut oka',
  23: 'Atlas północnej godziny',
};

function getMapTitle(): string {
  const hour = new Date().getHours();
  return mapTitles[hour] || mapTitles[12];
}

export function MapPage() {
  const title = getMapTitle();

  return (
    <div className="fixed inset-0 z-0">
      {/* Optional: Title overlay */}
      <div className="absolute top-4 right-4 z-10 hidden md:block">
        <span className="text-sm text-zinc-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
          {title}
        </span>
      </div>

      {/* Map */}
      <EventsMap />
    </div>
  );
}
