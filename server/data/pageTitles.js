// Static page titles mapping (multilingual: pl/en/de)
export const PAGE_TITLES = {
  '/': {
    pl: { title: 'Pollar News', tagline: 'Wiesz więcej', description: 'Wszystkie najważniejsze wiadomości w jednym miejscu. AI porządkuje i streszcza dzisiejsze wydarzenia bez clickbaitów — tylko sprawdzone fakty.' },
    en: { title: 'Pollar News', tagline: 'Know More', description: 'All the most important news in one place. AI organizes and summarizes today\'s events — no clickbait, only verified facts.' },
    de: { title: 'Pollar News', tagline: 'Mehr wissen', description: 'Alle wichtigen Nachrichten an einem Ort. KI organisiert und fasst die Ereignisse des Tages zusammen — ohne Clickbait, nur verifizierte Fakten.' },
  },
  '/brief': null, // handled separately (dynamic)
  '/powiazania': {
    pl: { title: 'Powiązania', description: 'Codzienna gra słowna w stylu NYT Connections. Połącz 16 słów w 4 ukryte kategorie — masz tylko 4 szanse na błąd.' },
    en: { title: 'Connections', description: 'Daily word game inspired by NYT Connections. Connect 16 words into 4 hidden categories — you only have 4 chances to fail.' },
    de: { title: 'Verbindungen', description: 'Tägliches Wortspiel im Stil von NYT Connections. Verbinde 16 Wörter zu 4 versteckten Kategorien — du hast nur 4 Fehlversuche.' },
  },
  '/mapa': {
    pl: { title: 'Mapa wydarzeń', description: 'Interaktywna mapa Polski z lokalizacją bieżących wydarzeń. Klikaj na markery, aby zobaczyć szczegóły i powiązane artykuły.' },
    en: { title: 'Event Map', description: 'Interactive map of Poland with current event locations. Click markers to see details and related articles.' },
    de: { title: 'Ereigniskarte', description: 'Interaktive Karte Polens mit aktuellen Ereignisorten. Klicke auf Markierungen für Details und verwandte Artikel.' },
  },
  '/terminal': {
    pl: { title: 'Terminal', description: 'Fullscreen dashboard z live-feedem trendujących wydarzeń. Nawiguj klawiaturą, śledź keypoints i notowania giełdowe w czasie rzeczywistym.' },
    en: { title: 'Terminal', description: 'Fullscreen dashboard with live feed of trending events. Navigate with keyboard, track key points and stock quotes in real time.' },
    de: { title: 'Terminal', description: 'Vollbild-Dashboard mit Live-Feed aktueller Ereignisse. Tastaturnavigation, Keypoints und Börsenkurse in Echtzeit.' },
  },
  '/polityka-prywatnosci': {
    pl: { title: 'Polityka prywatności', description: 'Polityka prywatności serwisu Pollar News.' },
    en: { title: 'Privacy Policy', description: 'Privacy policy of Pollar News.' },
    de: { title: 'Datenschutzrichtlinie', description: 'Datenschutzrichtlinie von Pollar News.' },
  },
  '/info': {
    pl: { title: 'O Pollar', description: 'Poznaj zespół i misję Pollar News — AI porządkuje wiadomości bez clickbaitów, żebyś był na bieżąco bez przytłaczania informacjami.' },
    en: { title: 'About Pollar', description: 'Meet the team and mission of Pollar News — AI organizes news without clickbait so you stay informed without information overload.' },
    de: { title: 'Über Pollar', description: 'Lernen Sie das Team und die Mission von Pollar News kennen — KI organisiert Nachrichten ohne Clickbait, damit Sie informiert bleiben.' },
  },
  '/graf': {
    pl: { title: 'Graf powiązań', description: 'Interaktywny graf sieciowy pokazujący powiązania między wydarzeniami. Wybierz tryb wizualizacji: force, radial, hierarchiczny lub timeline.' },
    en: { title: 'Event Graph', description: 'Interactive network graph showing connections between events. Choose visualization mode: force, radial, hierarchical or timeline.' },
    de: { title: 'Ereignisgraph', description: 'Interaktiver Netzwerkgraph mit Verbindungen zwischen Ereignissen. Wähle den Visualisierungsmodus: Force, Radial, Hierarchisch oder Timeline.' },
  },
  '/gielda': {
    pl: { title: 'Giełda', description: 'Live notowania WIG20, mWIG40 i akcji GPW. Śledź największe wzrosty i spadki, twórz własną listę obserwowanych spółek.' },
    en: { title: 'Stock Market', description: 'Live WIG20, mWIG40 and GPW stock quotes. Track biggest gains and losses, create your own watchlist.' },
    de: { title: 'Börse', description: 'Live-Kurse von WIG20, mWIG40 und GPW-Aktien. Verfolge die größten Gewinne und Verluste, erstelle deine eigene Watchlist.' },
  },
  // Sejm
  '/sejm': {
    pl: { title: 'Sejm', description: 'Portal danych Sejmu RP X kadencji — statystyki, sondaże, bieżące posiedzenia live, rankingi posłów i ostatnie głosowania.' },
    en: { title: 'Sejm', description: 'Polish Parliament (Sejm) data portal — statistics, polls, live sessions, MP rankings and recent votes.' },
    de: { title: 'Sejm', description: 'Datenportal des polnischen Parlaments (Sejm) — Statistiken, Umfragen, Live-Sitzungen, Abgeordneten-Rankings und aktuelle Abstimmungen.' },
  },
  '/sejm/poslowie': {
    pl: { title: 'Posłowie', description: 'Pełna lista 460 posłów z filtrami po klubie, województwie i aktywności. Profile z historią głosowań i frekwencją.' },
    en: { title: 'MPs', description: 'Full list of 460 MPs with filters by party, voivodeship and activity. Profiles with voting history and attendance.' },
    de: { title: 'Abgeordnete', description: 'Vollständige Liste der 460 Abgeordneten mit Filtern nach Fraktion, Woiwodschaft und Aktivität. Profile mit Abstimmungshistorie.' },
  },
  '/sejm/kluby': {
    pl: { title: 'Kluby parlamentarne', description: 'Kluby i koła poselskie w Sejmie RP z liczbą członków, przewodniczącymi i statystykami głosowań.' },
    en: { title: 'Parliamentary Clubs', description: 'Parliamentary clubs and caucuses in the Sejm with member counts, chairpersons and voting statistics.' },
    de: { title: 'Parlamentarische Klubs', description: 'Parlamentarische Klubs und Fraktionen im Sejm mit Mitgliederzahlen, Vorsitzenden und Abstimmungsstatistiken.' },
  },
  '/sejm/glosowania': {
    pl: { title: 'Głosowania', description: 'Archiwum wszystkich głosowań sejmowych z wynikami za/przeciw/wstrzymane i rozkładem głosów według klubów.' },
    en: { title: 'Votes', description: 'Archive of all parliamentary votes with for/against/abstained results and vote breakdown by party.' },
    de: { title: 'Abstimmungen', description: 'Archiv aller Parlamentsabstimmungen mit Ergebnissen (dafür/dagegen/enthalten) und Aufschlüsselung nach Fraktion.' },
  },
  '/sejm/komisje': {
    pl: { title: 'Komisje sejmowe', description: 'Lista komisji stałych, nadzwyczajnych i śledczych z zakresem działania, składem i harmonogramem posiedzeń.' },
    en: { title: 'Committees', description: 'List of standing, special and investigative committees with scope, membership and session schedule.' },
    de: { title: 'Ausschüsse', description: 'Liste der ständigen, Sonder- und Untersuchungsausschüsse mit Zuständigkeiten, Zusammensetzung und Sitzungsplan.' },
  },
  '/sejm/posiedzenia': {
    pl: { title: 'Posiedzenia', description: 'Kalendarz posiedzeń Sejmu z porządkiem obrad, harmonogramem i dostępem do transmisji na żywo.' },
    en: { title: 'Sessions', description: 'Sejm session calendar with agendas, schedules and access to live streams.' },
    de: { title: 'Sitzungen', description: 'Sitzungskalender des Sejm mit Tagesordnungen, Zeitplänen und Zugang zu Live-Übertragungen.' },
  },
  '/sejm/druki': {
    pl: { title: 'Druki sejmowe', description: 'Projekty ustaw, uchwał i innych dokumentów legislacyjnych z możliwością przejścia do pełnego tekstu.' },
    en: { title: 'Parliamentary Papers', description: 'Bills, resolutions and other legislative documents with access to full text.' },
    de: { title: 'Parlamentsdrucksachen', description: 'Gesetzentwürfe, Beschlüsse und andere legislative Dokumente mit Zugang zum Volltext.' },
  },
  '/sejm/procesy': {
    pl: { title: 'Procesy legislacyjne', description: 'Śledzenie ścieżki legislacyjnej projektów ustaw od złożenia przez komisje do podpisu prezydenta.' },
    en: { title: 'Legislative Processes', description: 'Track bills from submission through committees to presidential signature.' },
    de: { title: 'Gesetzgebungsverfahren', description: 'Verfolgung von Gesetzentwürfen von der Einreichung über Ausschüsse bis zur Unterschrift des Präsidenten.' },
  },
  '/sejm/interpelacje': {
    pl: { title: 'Interpelacje', description: 'Pytania posłów kierowane do członków Rządu z odpowiedziami ministrów i terminami reakcji.' },
    en: { title: 'Interpellations', description: 'MP questions addressed to government ministers with ministerial responses and deadlines.' },
    de: { title: 'Interpellationen', description: 'Abgeordnetenfragen an Regierungsmitglieder mit Ministerantworten und Fristen.' },
  },
  '/sejm/zapytania': {
    pl: { title: 'Zapytania', description: 'Zapytania poselskie w sprawach bieżących kierowane do przedstawicieli Rady Ministrów.' },
    en: { title: 'Inquiries', description: 'MP inquiries on current affairs addressed to Council of Ministers representatives.' },
    de: { title: 'Anfragen', description: 'Abgeordnetenanfragen zu aktuellen Angelegenheiten an Vertreter des Ministerrats.' },
  },
  '/sejm/transmisje': {
    pl: { title: 'Transmisje', description: 'Transmisje video na żywo z obrad Sejmu, komisji i konferencji prasowych.' },
    en: { title: 'Live Streams', description: 'Live video streams from Sejm sessions, committee meetings and press conferences.' },
    de: { title: 'Live-Übertragungen', description: 'Live-Videoübertragungen von Sejm-Sitzungen, Ausschusssitzungen und Pressekonferenzen.' },
  },
  // Dane
  '/dane': {
    pl: { title: 'Dane', description: 'Portal otwartych danych z wizualizacjami — jakość powietrza, energetyka, ceny mieszkań, przestępczość i więcej ze źródeł GIOŚ, GUS i Eurostat.' },
    en: { title: 'Data', description: 'Open data portal with visualizations — air quality, energy, real estate prices, crime and more from GIOŚ, GUS and Eurostat.' },
    de: { title: 'Daten', description: 'Offenes Datenportal mit Visualisierungen — Luftqualität, Energie, Immobilienpreise, Kriminalität und mehr von GIOŚ, GUS und Eurostat.' },
  },
  '/dane/srodowisko/powietrze': {
    pl: { title: 'Jakość powietrza', description: 'Mapa stacji pomiarowych GIOŚ z live danymi PM2.5, PM10 i indeksem jakości. Ranking województw i top 10 najczystszych/najbardziej zanieczyszczonych lokalizacji.' },
    en: { title: 'Air Quality', description: 'GIOŚ monitoring station map with live PM2.5, PM10 data and quality index. Voivodeship ranking and top 10 cleanest/most polluted locations.' },
    de: { title: 'Luftqualität', description: 'GIOŚ-Messstationskarte mit Live-PM2.5-, PM10-Daten und Qualitätsindex. Woiwodschafts-Ranking und Top 10 der saubersten/verschmutzten Standorte.' },
  },
  '/dane/spoleczenstwo/imiona': {
    pl: { title: 'Imiona', description: 'Ranking najpopularniejszych imion nadawanych w Polsce według danych GUS z podziałem na lata i płeć.' },
    en: { title: 'First Names', description: 'Ranking of the most popular first names given in Poland based on GUS data, broken down by year and gender.' },
    de: { title: 'Vornamen', description: 'Ranking der beliebtesten Vornamen in Polen nach GUS-Daten, aufgeschlüsselt nach Jahr und Geschlecht.' },
  },
  '/dane/spoleczenstwo/nazwiska': {
    pl: { title: 'Nazwiska', description: 'Statystyki najpopularniejszych nazwisk w Polsce z analizą rozkładu geograficznego.' },
    en: { title: 'Surnames', description: 'Statistics of the most popular surnames in Poland with geographic distribution analysis.' },
    de: { title: 'Nachnamen', description: 'Statistiken der häufigsten Nachnamen in Polen mit Analyse der geografischen Verteilung.' },
  },
  '/dane/ekonomia/energia': {
    pl: { title: 'Energia', description: 'Mix energetyczny Polski: udział węgla, gazu, OZE i paliw płynnych. Ceny elektryczności i porównanie z krajami UE.' },
    en: { title: 'Energy', description: 'Poland\'s energy mix: share of coal, gas, renewables and liquid fuels. Electricity prices and comparison with EU countries.' },
    de: { title: 'Energie', description: 'Polens Energiemix: Anteil von Kohle, Gas, Erneuerbaren und flüssigen Brennstoffen. Strompreise und Vergleich mit EU-Ländern.' },
  },
  '/dane/ekonomia/eurostat': {
    pl: { title: 'Eurostat', description: 'Wybrane wskaźniki makroekonomiczne Polski na tle Unii Europejskiej — PKB, inflacja, bezrobocie, handel.' },
    en: { title: 'Eurostat', description: 'Selected macroeconomic indicators of Poland compared to the European Union — GDP, inflation, unemployment, trade.' },
    de: { title: 'Eurostat', description: 'Ausgewählte makroökonomische Indikatoren Polens im Vergleich zur Europäischen Union — BIP, Inflation, Arbeitslosigkeit, Handel.' },
  },
  '/dane/ekonomia/mieszkania': {
    pl: { title: 'Ceny mieszkań', description: 'Średnie ceny za m² w największych miastach Polski z liczbą aktywnych ofert i trendami cenowymi.' },
    en: { title: 'Real Estate Prices', description: 'Average prices per m² in major Polish cities with active listings count and price trends.' },
    de: { title: 'Immobilienpreise', description: 'Durchschnittspreise pro m² in den größten polnischen Städten mit Anzahl aktiver Angebote und Preistrends.' },
  },
  '/dane/transport/kolej': {
    pl: { title: 'Kolej', description: 'Statystyki przewozów pasażerskich i towarowych PKP z danymi o punktualności i obłożeniu tras.' },
    en: { title: 'Railways', description: 'PKP passenger and freight transport statistics with punctuality data and route occupancy.' },
    de: { title: 'Eisenbahn', description: 'PKP-Statistiken zu Personen- und Güterverkehr mit Pünktlichkeitsdaten und Streckenauslastung.' },
  },
  '/dane/transport/porty': {
    pl: { title: 'Porty', description: 'Przeładunki w portach Gdańsk, Gdynia, Szczecin i Świnoujście — tony, TEU i dynamika rok do roku.' },
    en: { title: 'Ports', description: 'Cargo throughput at Gdańsk, Gdynia, Szczecin and Świnoujście ports — tons, TEU and year-over-year dynamics.' },
    de: { title: 'Häfen', description: 'Frachtumschlag in den Häfen Gdańsk, Gdynia, Szczecin und Świnoujście — Tonnen, TEU und Jahresvergleich.' },
  },
  '/dane/bezpieczenstwo/przestepczosc': {
    pl: { title: 'Przestępczość', description: 'Statystyki Policji: liczba przestępstw, wykrywalność i ranking bezpieczeństwa województw.' },
    en: { title: 'Crime', description: 'Police statistics: number of crimes, detection rates and voivodeship safety ranking.' },
    de: { title: 'Kriminalität', description: 'Polizeistatistiken: Anzahl der Straftaten, Aufklärungsraten und Sicherheitsranking der Woiwodschaften.' },
  },
  // Pogoda
  '/pogoda': {
    pl: { title: 'Pogoda', description: 'Aktualne warunki pogodowe w 16 miastach wojewódzkich Polski. Interaktywna mapa z temperaturami i automatyczną aktualizacją co 15 minut.' },
    en: { title: 'Weather', description: 'Current weather conditions in 16 Polish voivodeship cities. Interactive map with temperatures and auto-refresh every 15 minutes.' },
    de: { title: 'Wetter', description: 'Aktuelle Wetterbedingungen in 16 polnischen Woiwodschaftsstädten. Interaktive Karte mit Temperaturen und automatischer Aktualisierung alle 15 Minuten.' },
  },
  // Sources
  '/sources': {
    pl: { title: 'Źródła wiadomości', description: 'Wszystkie źródła wiadomości śledzone przez Pollar z klasyfikacją kapitałową i orientacją polityczną.' },
    en: { title: 'News Sources', description: 'All news sources tracked by Pollar with ownership classification and political orientation.' },
    de: { title: 'Nachrichtenquellen', description: 'Alle von Pollar verfolgten Nachrichtenquellen mit Eigentümerklassifizierung und politischer Ausrichtung.' },
  },
  '/kontakt': {
    pl: { title: 'Kontakt', description: 'Skontaktuj się z zespołem Pollar News. Formularz kontaktowy, FAQ i dane firmy.' },
    en: { title: 'Contact', description: 'Get in touch with the Pollar News team. Contact form, FAQ and company details.' },
    de: { title: 'Kontakt', description: 'Kontaktieren Sie das Pollar News Team. Kontaktformular, FAQ und Firmendetails.' },
  },
  '/regulamin': {
    pl: { title: 'Regulamin', description: 'Regulamin serwisu Pollar News z warunkami korzystania i licencją CC BY-NC-SA 4.0.' },
    en: { title: 'Terms of Service', description: 'Pollar News terms of service with usage conditions and CC BY-NC-SA 4.0 license.' },
    de: { title: 'Nutzungsbedingungen', description: 'Nutzungsbedingungen von Pollar News mit Nutzungsbedingungen und CC BY-NC-SA 4.0 Lizenz.' },
  },
};

import { getCategoryFromSlug, getCategoryTitle, getCategoryDescription } from './translations.js';

// Helper to resolve PAGE_TITLES entry for a given path and language
export function getPageInfo(path, lang = 'pl') {
  // Check static entries first
  const entry = PAGE_TITLES[path];
  if (entry) return entry[lang] || entry.pl || null;

  // Check if path matches a category slug (e.g., /sport, /world, /wirtschaft)
  const slug = path.replace(/^\//, '');
  if (slug && !slug.includes('/')) {
    const category = getCategoryFromSlug(slug, lang);
    if (category) {
      const title = getCategoryTitle(category, lang);
      const description = getCategoryDescription(category, lang);
      return { title, description };
    }
  }

  return null;
}
