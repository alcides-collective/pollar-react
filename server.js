import * as Sentry from '@sentry/node';

// Initialize Sentry FIRST (before other code runs)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,
  });
}

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = process.env.API_BASE || 'https://pollar.up.railway.app';

// Font family for SVG (must match installed font via fontconfig)
const FONT_FAMILY = "'HK Grotesk', 'Noto Sans', 'DejaVu Sans', sans-serif";

// Load logo buffer at startup for Sharp compositing
let logoBuffer = null;
try {
  logoBuffer = readFileSync(join(__dirname, 'server-assets/logo-white.png'));
  console.log('Logo loaded successfully');
} catch (err) {
  console.warn('Could not load logo:', err.message);
}

// FAQ data for static pages (used for FAQPage schema — AEO)
const PAGE_FAQS = {
  '/kontakt': {
    pl: [
      { question: 'Jak zgłosić błąd?', answer: 'Najszybciej przez formularz kontaktowy — wybierz temat "Błąd / Bug report" i opisz problem. Możesz też napisać bezpośrednio na jakub@pollar.pl.' },
      { question: 'Jak usunąć konto?', answer: 'Napisz do nas z adresu email powiązanego z kontem na jakub@pollar.pl z prośbą o usunięcie konta. Usuniemy je w ciągu 7 dni roboczych.' },
      { question: 'Czy Pollar jest darmowy?', answer: 'Tak, Pollar jest w pełni darmowy. Planujemy w przyszłości wprowadzić plan premium z dodatkowymi funkcjami, ale podstawowy dostęp zawsze pozostanie bezpłatny.' },
      { question: 'Jak działa AI w Pollar?', answer: 'AI automatycznie grupuje powiązane artykuły w wydarzenia, generuje streszczenia i tworzy Daily Brief. Korzystamy z modeli AI od różnych dostawców (m.in. Google Gemini, OpenAI, OpenRouter) do analizy i podsumowywania treści.' },
      { question: 'Jak zostać źródłem w Pollar?', answer: 'Pollar agreguje wiadomości z publicznych źródeł za pośrednictwem Event Registry. Jeśli reprezentujesz medium i chcesz, aby Twoje artykuły były uwzględniane, skontaktuj się z nami przez formularz.' },
    ],
    en: [
      { question: 'How do I report a bug?', answer: 'The quickest way is through the contact form — select "Bug report" as the subject and describe the issue. You can also email jakub@pollar.pl directly.' },
      { question: 'How do I delete my account?', answer: 'Email us from the address associated with your account at jakub@pollar.pl requesting account deletion. We\'ll delete it within 7 business days.' },
      { question: 'Is Pollar free?', answer: 'Yes, Pollar is completely free. We plan to introduce a premium plan with additional features in the future, but basic access will always remain free.' },
      { question: 'How does AI work in Pollar?', answer: 'AI automatically groups related articles into events, generates summaries, and creates the Daily Brief. We use AI models from various providers (including Google Gemini, OpenAI, OpenRouter) for content analysis and summarization.' },
      { question: 'How do I become a source on Pollar?', answer: 'Pollar aggregates news from public sources via Event Registry. If you represent a media outlet and want your articles included, contact us through the form.' },
    ],
    de: [
      { question: 'Wie melde ich einen Fehler?', answer: 'Am schnellsten über das Kontaktformular — wählen Sie "Fehler / Bug report" als Betreff und beschreiben Sie das Problem. Sie können auch direkt an jakub@pollar.pl schreiben.' },
      { question: 'Wie lösche ich mein Konto?', answer: 'Schreiben Sie uns von der mit Ihrem Konto verknüpften E-Mail-Adresse an jakub@pollar.pl mit der Bitte um Kontolöschung. Wir löschen es innerhalb von 7 Werktagen.' },
      { question: 'Ist Pollar kostenlos?', answer: 'Ja, Pollar ist völlig kostenlos. Wir planen, in Zukunft einen Premium-Plan mit zusätzlichen Funktionen einzuführen, aber der grundlegende Zugang bleibt immer kostenlos.' },
      { question: 'Wie funktioniert KI bei Pollar?', answer: 'KI gruppiert automatisch verwandte Artikel zu Ereignissen, erstellt Zusammenfassungen und den Daily Brief. Wir verwenden KI-Modelle verschiedener Anbieter (u.a. Google Gemini, OpenAI, OpenRouter) zur Inhaltsanalyse und Zusammenfassung.' },
      { question: 'Wie wird man Quelle bei Pollar?', answer: 'Pollar aggregiert Nachrichten aus öffentlichen Quellen über Event Registry. Wenn Sie ein Medium vertreten und möchten, dass Ihre Artikel berücksichtigt werden, kontaktieren Sie uns über das Formular.' },
    ],
  },
  '/info': {
    pl: [
      { question: 'Czym jest Pollar News?', answer: 'Pollar News to platforma informacyjna zasilana sztuczną inteligencją, która agreguje, streszcza i kontekstualizuje codzienne wydarzenia z polskiej i międzynarodowej prasy — bez clickbaitów, tylko sprawdzone fakty.' },
      { question: 'Jak Pollar organizuje wiadomości?', answer: 'AI automatycznie grupuje powiązane artykuły z różnych źródeł w jedno wydarzenie, generuje streszczenia z kluczowymi punktami i prezentuje różne perspektywy.' },
      { question: 'Czy Pollar jest darmowy?', answer: 'Tak, Pollar jest w pełni darmowy. Podstawowy dostęp zawsze pozostanie bezpłatny.' },
      { question: 'Kto stoi za Pollar?', answer: 'Pollar P.S.A. to firma zarejestrowana w Krakowie. Zespół tworzą Jakub Dudek (Developer) i Bartosz Kasprzycki (Product & Marketing).' },
      { question: 'Jakie dane udostępnia Pollar?', answer: 'Pollar oferuje dashboardy z danymi publicznymi: Sejm RP (głosowania, posłowie, komisje), giełda GPW, jakość powietrza, ceny mieszkań, energetyka, przestępczość i więcej ze źródeł GIOŚ, GUS i Eurostat.' },
    ],
    en: [
      { question: 'What is Pollar News?', answer: 'Pollar News is an AI-powered news platform that aggregates, summarizes, and contextualizes daily events from Polish and international press — no clickbait, only verified facts.' },
      { question: 'How does Pollar organize news?', answer: 'AI automatically groups related articles from various sources into a single event, generates summaries with key points, and presents different perspectives.' },
      { question: 'Is Pollar free?', answer: 'Yes, Pollar is completely free. Basic access will always remain free.' },
      { question: 'Who is behind Pollar?', answer: 'Pollar P.S.A. is a company registered in Kraków, Poland. The team consists of Jakub Dudek (Developer) and Bartosz Kasprzycki (Product & Marketing).' },
      { question: 'What data does Pollar provide?', answer: 'Pollar offers public data dashboards: Polish Parliament (votes, MPs, committees), GPW stock market, air quality, real estate prices, energy mix, crime statistics and more from GIOŚ, GUS and Eurostat sources.' },
    ],
    de: [
      { question: 'Was ist Pollar News?', answer: 'Pollar News ist eine KI-gestützte Nachrichtenplattform, die tägliche Ereignisse aus der polnischen und internationalen Presse aggregiert, zusammenfasst und kontextualisiert — ohne Clickbait, nur verifizierte Fakten.' },
      { question: 'Wie organisiert Pollar Nachrichten?', answer: 'KI gruppiert automatisch verwandte Artikel aus verschiedenen Quellen zu einem Ereignis, erstellt Zusammenfassungen mit Kernpunkten und präsentiert verschiedene Perspektiven.' },
      { question: 'Ist Pollar kostenlos?', answer: 'Ja, Pollar ist völlig kostenlos. Der grundlegende Zugang bleibt immer kostenlos.' },
      { question: 'Wer steht hinter Pollar?', answer: 'Pollar P.S.A. ist ein in Kraków, Polen, registriertes Unternehmen. Das Team besteht aus Jakub Dudek (Entwickler) und Bartosz Kasprzycki (Produkt & Marketing).' },
      { question: 'Welche Daten bietet Pollar?', answer: 'Pollar bietet öffentliche Daten-Dashboards: Polnisches Parlament (Abstimmungen, Abgeordnete, Ausschüsse), GPW-Börse, Luftqualität, Immobilienpreise, Energiemix, Kriminalitätsstatistiken und mehr aus GIOŚ, GUS und Eurostat-Quellen.' },
    ],
  },
};

// Static page titles mapping
const PAGE_TITLES = {
  '/': { title: 'Pollar News', description: 'Wszystkie najważniejsze wiadomości w jednym miejscu. AI porządkuje i streszcza dzisiejsze wydarzenia bez clickbaitów — tylko sprawdzone fakty.' },
  '/brief': null, // handled separately (dynamic)
  '/powiazania': { title: 'Powiązania', description: 'Codzienna gra słowna w stylu NYT Connections. Połącz 16 słów w 4 ukryte kategorie — masz tylko 4 szanse na błąd.' },
  '/mapa': { title: 'Mapa wydarzeń', description: 'Interaktywna mapa Polski z lokalizacją bieżących wydarzeń. Klikaj na markery, aby zobaczyć szczegóły i powiązane artykuły.' },
  '/terminal': { title: 'Terminal', description: 'Fullscreen dashboard z live-feedem trendujących wydarzeń. Nawiguj klawiaturą, śledź keypoints i notowania giełdowe w czasie rzeczywistym.' },
  '/polityka-prywatnosci': { title: 'Polityka prywatności', description: 'Polityka prywatności serwisu Pollar News.' },
  '/info': { title: 'O Pollar', description: 'Poznaj zespół i misję Pollar News — AI porządkuje wiadomości bez clickbaitów, żebyś był na bieżąco bez przytłaczania informacjami.' },
  '/graf': { title: 'Graf powiązań', description: 'Interaktywny graf sieciowy pokazujący powiązania między wydarzeniami. Wybierz tryb wizualizacji: force, radial, hierarchiczny lub timeline.' },
  '/gielda': { title: 'Giełda', description: 'Live notowania WIG20, mWIG40 i akcji GPW. Śledź największe wzrosty i spadki, twórz własną listę obserwowanych spółek.' },
  // Sejm
  '/sejm': { title: 'Sejm', description: 'Portal danych Sejmu RP X kadencji — statystyki, sondaże, bieżące posiedzenia live, rankingi posłów i ostatnie głosowania.' },
  '/sejm/poslowie': { title: 'Posłowie', description: 'Pełna lista 460 posłów z filtrami po klubie, województwie i aktywności. Profile z historią głosowań i frekwencją.' },
  '/sejm/kluby': { title: 'Kluby parlamentarne', description: 'Kluby i koła poselskie w Sejmie RP z liczbą członków, przewodniczącymi i statystykami głosowań.' },
  '/sejm/glosowania': { title: 'Głosowania', description: 'Archiwum wszystkich głosowań sejmowych z wynikami za/przeciw/wstrzymane i rozkładem głosów według klubów.' },
  '/sejm/komisje': { title: 'Komisje sejmowe', description: 'Lista komisji stałych, nadzwyczajnych i śledczych z zakresem działania, składem i harmonogramem posiedzeń.' },
  '/sejm/posiedzenia': { title: 'Posiedzenia', description: 'Kalendarz posiedzeń Sejmu z porządkiem obrad, harmonogramem i dostępem do transmisji na żywo.' },
  '/sejm/druki': { title: 'Druki sejmowe', description: 'Projekty ustaw, uchwał i innych dokumentów legislacyjnych z możliwością przejścia do pełnego tekstu.' },
  '/sejm/procesy': { title: 'Procesy legislacyjne', description: 'Śledzenie ścieżki legislacyjnej projektów ustaw od złożenia przez komisje do podpisu prezydenta.' },
  '/sejm/interpelacje': { title: 'Interpelacje', description: 'Pytania posłów kierowane do członków Rządu z odpowiedziami ministrów i terminami reakcji.' },
  '/sejm/zapytania': { title: 'Zapytania', description: 'Zapytania poselskie w sprawach bieżących kierowane do przedstawicieli Rady Ministrów.' },
  '/sejm/transmisje': { title: 'Transmisje', description: 'Transmisje video na żywo z obrad Sejmu, komisji i konferencji prasowych.' },
  // Dane
  '/dane': { title: 'Dane', description: 'Portal otwartych danych z wizualizacjami — jakość powietrza, energetyka, ceny mieszkań, przestępczość i więcej ze źródeł GIOŚ, GUS i Eurostat.' },
  '/dane/srodowisko/powietrze': { title: 'Jakość powietrza', description: 'Mapa stacji pomiarowych GIOŚ z live danymi PM2.5, PM10 i indeksem jakości. Ranking województw i top 10 najczystszych/najbardziej zanieczyszczonych lokalizacji.' },
  '/dane/spoleczenstwo/imiona': { title: 'Imiona', description: 'Ranking najpopularniejszych imion nadawanych w Polsce według danych GUS z podziałem na lata i płeć.' },
  '/dane/spoleczenstwo/nazwiska': { title: 'Nazwiska', description: 'Statystyki najpopularniejszych nazwisk w Polsce z analizą rozkładu geograficznego.' },
  '/dane/ekonomia/energia': { title: 'Energia', description: 'Mix energetyczny Polski: udział węgla, gazu, OZE i paliw płynnych. Ceny elektryczności i porównanie z krajami UE.' },
  '/dane/ekonomia/eurostat': { title: 'Eurostat', description: 'Wybrane wskaźniki makroekonomiczne Polski na tle Unii Europejskiej — PKB, inflacja, bezrobocie, handel.' },
  '/dane/ekonomia/mieszkania': { title: 'Ceny mieszkań', description: 'Średnie ceny za m² w największych miastach Polski z liczbą aktywnych ofert i trendami cenowymi.' },
  '/dane/transport/kolej': { title: 'Kolej', description: 'Statystyki przewozów pasażerskich i towarowych PKP z danymi o punktualności i obłożeniu tras.' },
  '/dane/transport/porty': { title: 'Porty', description: 'Przeładunki w portach Gdańsk, Gdynia, Szczecin i Świnoujście — tony, TEU i dynamika rok do roku.' },
  '/dane/bezpieczenstwo/przestepczosc': { title: 'Przestępczość', description: 'Statystyki Policji: liczba przestępstw, wykrywalność i ranking bezpieczeństwa województw.' },
  // Pogoda
  '/pogoda': { title: 'Pogoda', description: 'Aktualne warunki pogodowe w 16 miastach wojewódzkich Polski. Interaktywna mapa z temperaturami i automatyczną aktualizacją co 15 minut.' },
  // Sources
  '/sources': { title: 'Źródła wiadomości', description: 'Wszystkie źródła wiadomości śledzone przez Pollar z klasyfikacją kapitałową i orientacją polityczną.' },
  '/kontakt': { title: 'Kontakt', description: 'Skontaktuj się z zespołem Pollar News. Formularz kontaktowy, FAQ i dane firmy.' },
  '/regulamin': { title: 'Regulamin', description: 'Regulamin serwisu Pollar News z warunkami korzystania i licencją CC BY-NC-SA 4.0.' },
};

// Crawler detection
// Note: iMessage spoofs facebookexternalhit + Twitterbot, so it's already covered
const CRAWLER_USER_AGENTS = [
  // Social media & messengers
  'facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot', 'WhatsApp',
  'Slackbot', 'TelegramBot', 'Discordbot', 'Embedly', 'Pinterest', 'Skype', 'vkShare',
  'redditbot',
  // Search engines
  'Googlebot', 'Google-Extended', 'bingbot', 'Applebot', 'PetalBot', 'Sogou',
  'YandexBot', 'Mediapartners-Google', 'DuckDuckBot', 'Baiduspider',
  // AI assistants & LLM crawlers (use Mozilla-based UAs)
  'ClaudeBot', 'Claude-Web', 'Anthropic', 'ChatGPT-User', 'GPTBot', 'OAI-SearchBot',
  'PerplexityBot', 'cohere-ai', 'YouBot', 'Google-SafetyBot',
  'CCBot', 'Bytespider', 'Diffbot', 'ImagesiftBot', 'Omgilibot'
];

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  // Known bots get SSR
  if (CRAWLER_USER_AGENTS.some(bot => ua.includes(bot.toLowerCase()))) return true;
  // Non-browser clients (curl, wget, httpie, python-requests, etc.) also get SSR
  // All real browsers include "mozilla" in their UA string
  if (!ua.includes('mozilla')) return true;
  return false;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&bdquo;/g, '\u201E').replace(/&rdquo;/g, '\u201D').replace(/&ldquo;/g, '\u201C')
    .replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019')
    .replace(/&ndash;/g, '\u2013').replace(/&mdash;/g, '\u2014')
    .replace(/&hellip;/g, '\u2026').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

/**
 * Intelligently converts custom HTML tags from AI-generated summaries to clean plain text.
 * Based on tag processing logic from src/utils/text.ts but outputs plain text for crawlers.
 */
function stripCustomTags(text) {
  if (!text) return '';

  let s = text
    // Decode double-encoded entities
    .replace(/&amp;lt;/g, '<').replace(/&amp;gt;/g, '>')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&bdquo;/g, '\u201E').replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C').replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019')
    .replace(/&ndash;/g, '\u2013').replace(/&mdash;/g, '\u2014')
    .replace(/&hellip;/g, '\u2026').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&laquo;/g, '\u00AB').replace(/&raquo;/g, '\u00BB');

  // Normalize English tag names to Polish equivalents
  s = s
    .replace(/<(\/?)note(\s|>)/gi, '<$1przypis$2')
    .replace(/<(\/?)context>/gi, '<$1kontekst>')
    .replace(/<(\/?)quote(\s|>)/gi, '<$1cytat$2')
    .replace(/<(\/?)key-number(\s|>)/gi, '<$1kluczowa-liczba$2')
    .replace(/<(\/?)comparison(\s|>)/gi, '<$1porównanie$2')
    .replace(/<(\/?)poll(\s|>)/gi, '<$1ankieta$2')
    .replace(/<(\/?)manipulation(\s|>)/gi, '<$1manipulacja$2')
    .replace(/<(\/?)verification(\s|>)/gi, '<$1weryfikacja$2')
    .replace(/<(\/?)fact-check(\s|>)/gi, '<$1weryfikacja$2');

  // Normalize English attribute names
  s = s
    .replace(/(<przypis\s[^>]*)description=/gi, '$1opis=')
    .replace(/(<cytat\s[^>]*)author=/gi, '$1autor=')
    .replace(/(<cytat\s[^>]*)place=/gi, '$1miejsce=')
    .replace(/(<kluczowa-liczba\s[^>]*)value=/gi, '$1wartość=')
    .replace(/(<timeline\s[^>]*)title=/gi, '$1tytuł=')
    .replace(/(<porównanie\s[^>]*)title=/gi, '$1tytuł=')
    .replace(/(<ankieta\s[^>]*)question=/gi, '$1pytanie=')
    .replace(/(<manipulacja\s[^>]*)author=/gi, '$1autor=')
    .replace(/(<manipulacja\s[^>]*)quote=/gi, '$1cytat=')
    .replace(/(<weryfikacja\s[^>]*)verdict=/gi, '$1werdykt=')
    .replace(/(<weryfikacja\s[^>]*)source=/gi, '$1źródło=');

  // Convert <br> to newlines
  s = s.replace(/<br\s*\/?>/gi, '\n');

  // --- Convert structured tags to plain text ---

  // <cytat autor="X" miejsce="Y">text</cytat> → „text" — X, Y
  s = s.replace(/<cytat\s+autor\s*=\s*["']([^"']+)["']\s+miejsce\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/cytat>/gi,
    (_, autor, miejsce, text) => `\u201E${text.trim()}\u201D \u2014 ${autor}, ${miejsce}`);
  s = s.replace(/<cytat\s+miejsce\s*=\s*["']([^"']+)["']\s+autor\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/cytat>/gi,
    (_, miejsce, autor, text) => `\u201E${text.trim()}\u201D \u2014 ${autor}, ${miejsce}`);
  s = s.replace(/<cytat\s+autor\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/cytat>/gi,
    (_, autor, text) => `\u201E${text.trim()}\u201D \u2014 ${autor}`);

  // <kluczowa-liczba wartość="X">desc</kluczowa-liczba> → X — desc
  s = s.replace(/<kluczowa-liczba\s+wartość\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/kluczowa-liczba>/gi,
    (_, value, desc) => `${value} \u2014 ${desc.trim()}`);

  // <manipulacja autor="X" cytat="Y">explanation</manipulacja> → „Y" (X) — explanation
  s = s.replace(/<manipulacja\s+autor\s*=\s*["']([^"']+)["']\s+cytat\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/manipulacja>/gi,
    (_, autor, cytat, expl) => `\u201E${cytat}\u201D (${autor}) \u2014 ${expl.trim()}`);
  s = s.replace(/<manipulacja\s+cytat\s*=\s*["']([^"']+)["']\s+autor\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/manipulacja>/gi,
    (_, cytat, autor, expl) => `\u201E${cytat}\u201D (${autor}) \u2014 ${expl.trim()}`);
  // Fallback: manipulacja without attributes
  s = s.replace(/<manipulacja[^>]*>([\s\S]*?)<\/manipulacja>/gi, '$1');

  // <weryfikacja werdykt="V" źródło="S">explanation</weryfikacja> → V: explanation (Source: S)
  s = s.replace(/<weryfikacja\s+werdykt\s*=\s*["']([^"']+)["']\s+źródło\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/weryfikacja>/gi,
    (_, verdict, source, expl) => `${verdict}: ${expl.trim()} (${source})`);
  s = s.replace(/<weryfikacja\s+źródło\s*=\s*["']([^"']+)["']\s+werdykt\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/weryfikacja>/gi,
    (_, source, verdict, expl) => `${verdict}: ${expl.trim()} (${source})`);

  // <porównanie tytuł="T">JSON</porównanie> → T: aspect (before→after), ...
  s = s.replace(/<porównanie\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/porównanie>/gi, (_, title, jsonData) => {
    try {
      const items = JSON.parse(jsonData.trim());
      if (!Array.isArray(items)) return title;
      const parts = items.map(item => {
        const keys = Object.keys(item);
        const przedKey = keys.find(k => k.toLowerCase().startsWith('przed'));
        const poKey = keys.find(k => k.toLowerCase().startsWith('po'));
        return `${item.aspekt || ''}: ${przedKey ? item[przedKey] : ''} \u2192 ${poKey ? item[poKey] : ''}`;
      });
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <timeline tytuł="T">JSON</timeline> → T: date — title, ...
  s = s.replace(/<timeline\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/timeline>/gi, (_, title, jsonData) => {
    try {
      const events = JSON.parse(jsonData.trim());
      if (!Array.isArray(events)) return title;
      const parts = events.map(e => `${e.data || ''} \u2014 ${e.tytul || ''}`);
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <wykres-słupkowy/liniowy/kołowy tytuł="T" jednostka="U">data</wykres-*> → T: label1: val1, ...
  s = s.replace(/<wykres-(?:s[łt][uó]pkowy|liniowy|kołowy)\s+[^>]*?tytu[łlć]?u?\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/wykres-(?:s[łt][uó]pkowy|liniowy|kołowy)>/gi,
    (_, title, dataStr) => {
      const items = dataStr.split(',').map(p => p.trim()).filter(Boolean);
      return items.length > 0 ? `${title}: ${items.join(', ')}` : title;
    });
  // Alternate attribute order (jednostka first)
  s = s.replace(/<wykres-(?:s[łt][uó]pkowy|liniowy|kołowy)\s+jednostk?a?\s*=\s*["'][^"']+["']\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/wykres-(?:s[łt][uó]pkowy|liniowy|kołowy)>/gi,
    (_, title, dataStr) => {
      const items = dataStr.split(',').map(p => p.trim()).filter(Boolean);
      return items.length > 0 ? `${title}: ${items.join(', ')}` : title;
    });

  // <wykres-wyniki tytuł="T">JSON</wykres-wyniki> → T: team1 X:Y team2, ...
  s = s.replace(/<wykres-wyniki\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/wykres-wyniki>/gi, (_, title, jsonData) => {
    try {
      const matches = JSON.parse(jsonData.trim());
      if (!Array.isArray(matches)) return title;
      const parts = matches.map(m => `${m.strona1 || ''} ${m.wynik1 ?? 0}:${m.wynik2 ?? 0} ${m.strona2 || ''}`);
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <tabela-wynikow tytuł="T">JSON</tabela-wynikow> → T: 1. name — score, ...
  s = s.replace(/<tabela-wynikow\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/tabela-wynikow>/gi, (_, title, jsonData) => {
    try {
      const entries = JSON.parse(jsonData.trim());
      if (!Array.isArray(entries)) return title;
      const parts = entries.map(e => `${e.pozycja || ''}. ${e.nazwa || ''}${e.wynik ? ' \u2014 ' + e.wynik : ''}`);
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <ranking tytuł="T" typ="X">JSON</ranking> → T: 1. name, ...
  s = s.replace(/<ranking\s+[^>]*?tytu[łlć]?u?\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/ranking>/gi, (_, title, jsonData) => {
    try {
      const entries = JSON.parse(jsonData.trim());
      if (!Array.isArray(entries)) return title;
      const parts = entries.map((e, i) => `${e.pozycja || i + 1}. ${e.nazwa || ''}${e.info ? ' (' + e.info + ')' : ''}`);
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <kalendarz tytuł="T">JSON</kalendarz> → T: date — event, ...
  s = s.replace(/<kalendarz\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/kalendarz>/gi, (_, title, jsonData) => {
    try {
      const events = JSON.parse(jsonData.trim());
      if (!Array.isArray(events)) return title;
      const parts = events.map(e => `${e.data || ''} \u2014 ${e.wydarzenie || ''}`);
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <ankieta> → strip entirely (polls disabled)
  s = s.replace(/<ankieta\s+[^>]*>[\s\S]*?<\/ankieta>/gi, '');

  // <sekcja tytuł="T">content</sekcja> → T. content
  s = s.replace(/<sekcja\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/sekcja>/gi, (_, title, content) => `${title}. ${content.trim()}`);

  // <bias left="X" right="Y"> → X | Y
  s = s.replace(/<bias\s+left\s*=\s*["']([^"']+)["']\s+right\s*=\s*["']([^"']+)["']\s*(?:\/>|><\/bias>)/gi, '$1 | $2');
  s = s.replace(/<bias\s+right\s*=\s*["']([^"']+)["']\s+left\s*=\s*["']([^"']+)["']\s*(?:\/>|><\/bias>)/gi, '$2 | $1');

  // <layout-porównanie> same as porównanie
  s = s.replace(/<layout-por[oó]wnanie\s+tytu[łlć]?u?\s*=\s*["']([^"']+)["']>([\s\S]*?)<\/layout-por[oó]wnanie>/gi, (_, title, jsonData) => {
    try {
      const items = JSON.parse(jsonData.trim());
      if (!Array.isArray(items)) return title;
      const parts = items.map(item => {
        const keys = Object.keys(item);
        const przedKey = keys.find(k => k.toLowerCase().startsWith('przed'));
        const poKey = keys.find(k => k.toLowerCase().startsWith('po'));
        return `${item.aspekt || ''}: ${przedKey ? item[przedKey] : ''} \u2192 ${poKey ? item[poKey] : ''}`;
      });
      return `${title}: ${parts.join('; ')}`;
    } catch { return title; }
  });

  // <kontekst> → keep inner text
  s = s.replace(/<kontekst>([\s\S]*?)<\/kontekst>/gi, '$1');

  // <przypis ...>term</przypis> → keep term
  s = s.replace(/<przypis[^>]*>([\s\S]*?)<\/przypis>/gi, '$1');

  // Strip markdown bold
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');

  // Remove event UUID references
  s = s.replace(/\s*\((?:ID:\s*\d+|(?:event\s+)?[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\)/gi, '');

  // Strip all remaining HTML tags
  s = s.replace(/<[^>]+>/g, '');

  // Collapse whitespace and clean up
  return s.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
}

function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text || '';
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '…';
  }
  return truncated.slice(0, maxLength - 1) + '…';
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Category translations for OG images (Polish category name → localized name)
const CATEGORY_TRANSLATIONS = {
  'Świat':                  { pl: 'Świat',                  en: 'World',                    de: 'Welt' },
  'Gospodarka':             { pl: 'Gospodarka',             en: 'Economy',                  de: 'Wirtschaft' },
  'Polityka':               { pl: 'Polityka',               en: 'Politics',                 de: 'Politik' },
  'Społeczeństwo':          { pl: 'Społeczeństwo',          en: 'Society',                  de: 'Gesellschaft' },
  'Sport':                  { pl: 'Sport',                  en: 'Sports',                   de: 'Sport' },
  'Kultura':                { pl: 'Kultura',                en: 'Culture',                  de: 'Kultur' },
  'Przestępczość':          { pl: 'Przestępczość',          en: 'Crime',                    de: 'Kriminalität' },
  'Styl Życia':             { pl: 'Styl Życia',             en: 'Lifestyle',                de: 'Lebensstil' },
  'Pogoda i Środowisko':    { pl: 'Pogoda i Środowisko',    en: 'Weather & Environment',    de: 'Wetter & Umwelt' },
  'Nauka i Technologia':    { pl: 'Nauka i Technologia',    en: 'Science & Technology',     de: 'Wissenschaft & Technologie' },
  'Inne':                   { pl: 'Inne',                   en: 'Other',                    de: 'Sonstiges' },
};

// OG Image rendering helper (shared between /api/og and /api/og/event/:id)
async function renderOgImage(res, { title = 'Pollar News', type = 'default', description = '', lang = 'pl', category = '' }) {
  const typeLabels = {
    event: { pl: 'WYDARZENIE', en: 'EVENT', de: 'EREIGNIS' },
    brief: { pl: 'DAILY BRIEF', en: 'DAILY BRIEF', de: 'DAILY BRIEF' },
    felieton: { pl: 'FELIETON', en: 'OPINION', de: 'KOLUMNE' },
    default: { pl: '', en: '', de: '' },
  };

  // Use translated category name if available, otherwise fall back to type label
  let typeLabel;
  if (category && CATEGORY_TRANSLATIONS[category]) {
    typeLabel = (CATEGORY_TRANSLATIONS[category][lang] || CATEGORY_TRANSLATIONS[category].pl || category).toUpperCase();
  } else {
    typeLabel = typeLabels[type]?.[lang] || typeLabels[type]?.pl || '';
  }

  // Calculate font size based on title length
  const fontSize = title.length > 100 ? 40 : title.length > 80 ? 48 : title.length > 50 ? 56 : 64;
  const lineHeight = Math.round(fontSize * 1.2);

  // Wrap text into lines
  const maxCharsPerLine = Math.floor(1080 / (fontSize * 0.5));
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Limit to ~6 lines max
  const maxLines = Math.floor(400 / lineHeight);
  const displayLines = lines.slice(0, maxLines);
  if (lines.length > maxLines && displayLines.length > 0) {
    const lastIndex = displayLines.length - 1;
    const lastLine = displayLines[lastIndex];
    if (lastLine) {
      displayLines[lastIndex] = lastLine.slice(0, -3) + '…';
    }
  }

  // Build SVG
  const width = 1200;
  const height = 630;
  const padding = 60;

  const textY = typeLabel ? 180 : 120;
  const textElements = displayLines
    .map((line, i) => {
      const y = textY + i * lineHeight;
      return `<text x="${padding}" y="${y}" font-size="${fontSize}" font-weight="700" fill="#fafafa">${escapeXml(line)}</text>`;
    })
    .join('\n');

  const typeLabelElement = typeLabel
    ? `<text x="${padding}" y="100" font-size="24" font-weight="600" fill="#a1a1aa" letter-spacing="0.1em">${escapeXml(typeLabel)}</text>`
    : '';

  // Description element - gray text below title with gradient fade
  const descriptionY = textY + displayLines.length * lineHeight + 6;
  const descriptionFontSize = 30;
  const descriptionLineHeight = 38;
  const logoRightMargin = 180; // Space for logo on the right
  const descriptionMaxWidth = width - padding - logoRightMargin;
  const descriptionMaxChars = Math.floor(descriptionMaxWidth / (descriptionFontSize * 0.5));

  // Wrap description into lines
  let descriptionLines = [];
  if (description) {
    const descWords = description.split(' ');
    let descCurrentLine = '';
    for (const word of descWords) {
      const testLine = descCurrentLine ? `${descCurrentLine} ${word}` : word;
      if (testLine.length <= descriptionMaxChars) {
        descCurrentLine = testLine;
      } else {
        if (descCurrentLine) descriptionLines.push(descCurrentLine);
        descCurrentLine = word;
      }
    }
    if (descCurrentLine) descriptionLines.push(descCurrentLine);
    // Limit to 4 lines max for description
    descriptionLines = descriptionLines.slice(0, 4);
  }

  // Build description text elements with gradient opacity
  const descriptionElements = descriptionLines
    .map((line, i) => {
      const y = descriptionY + i * descriptionLineHeight;
      // Opacity decreases for each line (1 -> 0.7 -> 0.4 -> 0.2)
      const opacity = Math.max(0.2, 1 - (i * 0.3));
      return `<text x="${padding}" y="${y}" font-size="${descriptionFontSize}" font-weight="400" fill="#a1a1aa" opacity="${opacity}">${escapeXml(line)}</text>`;
    })
    .join('\n');

  // Font style - uses system fonts configured via fontconfig
  const fontStyle = `text { font-family: ${FONT_FAMILY}; }`;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>${fontStyle}</style>
      <rect width="100%" height="100%" fill="#09090b"/>
      ${typeLabelElement}
      ${textElements}
      ${descriptionElements}
    </svg>
  `;

  try {
    // Generate base image from SVG
    let image = sharp(Buffer.from(svg));

    // Composite logo if available
    if (logoBuffer) {
      const logoHeight = 50;
      const logoWidth = Math.round(logoHeight * 2.07); // aspect ratio 688:333
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoWidth, logoHeight)
        .png()
        .toBuffer();

      image = image.composite([{
        input: resizedLogo,
        top: height - 70 - logoHeight,
        left: width - padding - logoWidth,
      }]);
    }

    const pngBuffer = await image.png().toBuffer();

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=172800, s-maxage=604800');
    res.send(pngBuffer);
  } catch (err) {
    console.error('OG image generation failed:', err);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}

// OG Image generation endpoint (query params)
app.get('/api/og', async (req, res) => {
  await renderOgImage(res, req.query);
});

// OG Image for event (short URL, fetches data server-side)
app.get('/api/og/event/:id', async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang || 'pl';
  const event = await fetchEventData(id, lang);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const title = event.title || 'Pollar News';
  const description = truncate(stripHtml(event.metadata?.seo?.ogDescription || event.lead || event.metadata?.keyPoints?.[0]?.description || event.summary || ''), 300);
  const category = event.metadata?.category || '';
  await renderOgImage(res, { title, type: 'event', description, lang, category });
});

// Schema.org JSON-LD generators for AEO (Answer Engine Optimization)
function generateNewsArticleSchema(opts) {
  const { headline, description, datePublished, dateModified, targetUrl, ogImage, lang = 'pl', articleBody = null, keywords = null } = opts;
  const inLanguageMap = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description,
    ...(articleBody ? { articleBody } : {}),
    ...(keywords?.length ? { keywords } : {}),
    inLanguage: inLanguageMap[lang] || 'pl-PL',
    isAccessibleForFree: true,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || datePublished || new Date().toISOString(),
    url: targetUrl,
    image: ogImage,
    author: {
      '@type': 'Organization',
      name: 'Pollar News',
      url: 'https://pollar.news'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pollar News',
      url: 'https://pollar.news',
      logo: {
        '@type': 'ImageObject',
        url: 'https://pollar.news/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': targetUrl
    },
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    creditText: 'Pollar News (pollar.news) · CC BY-NC-SA 4.0',
    acquireLicensePage: 'https://pollar.news/regulamin#licencja',
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Pollar News',
      url: 'https://pollar.news'
    }
  };
}

function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Pollar News',
    url: 'https://pollar.news',
    alternateName: ['Pollar', 'pollar.news', 'pollar.pl'],
    description: 'AI porządkuje i streszcza dzisiejsze wydarzenia bez clickbaitów — tylko sprawdzone fakty.',
    logo: {
      '@type': 'ImageObject',
      url: 'https://pollar.news/logo.png'
    },
    sameAs: ['https://pollar.pl']
  };
}

// FAQPage schema generator for AEO
function generateFAQSchema(faqItems) {
  if (!faqItems || faqItems.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

// Speakable schema — tells voice assistants which content to read aloud
function addSpeakable(schema, speakableSelectors = ['.article-body', '.summary', '.key-points']) {
  if (!schema) return schema;
  return {
    ...schema,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: speakableSelectors
    }
  };
}

// Breadcrumb segment name mapping
const BREADCRUMB_NAMES = {
  sejm: 'Sejm',
  dane: 'Dane',
  srodowisko: 'Środowisko',
  spoleczenstwo: 'Społeczeństwo',
  ekonomia: 'Ekonomia',
  transport: 'Transport',
  bezpieczenstwo: 'Bezpieczeństwo'
};

function generateBreadcrumbSchema(path, pageTitles) {
  const baseUrl = 'https://pollar.news';
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const items = [
    { '@type': 'ListItem', position: 1, name: 'Pollar', item: baseUrl }
  ];

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i];
    const pageInfo = pageTitles[currentPath];
    const name = pageInfo?.title || BREADCRUMB_NAMES[segments[i]] || segments[i];

    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name,
      item: baseUrl + currentPath
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
}

function generateSeoHtml(opts) {
  const { pageTitle, ogTitle, description, ogImage, targetUrl, ogType = 'article', schema = null, articlePublished = null, articleModified = null, articleSection = null, newsKeywords = null, keywords = null, keywordsList = null, pathWithoutLang = null, lang = 'pl', answerCapsule = null, headline = null, ogImageAlt = null } = opts;

  // Generate JSON-LD script(s) if schema is provided (can be single object or array)
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  const schemaScript = schemas
    .filter(Boolean)
    .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n    ');

  // Article meta tags (only for articles)
  const articleTagMetas = (keywordsList || []).map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}" />`);
  const articleTags = ogType === 'article' ? [
    articlePublished ? `<meta property="article:published_time" content="${articlePublished}" />` : '',
    articleModified ? `<meta property="article:modified_time" content="${articleModified}" />` : '',
    articleSection ? `<meta property="article:section" content="${escapeHtml(articleSection)}" />` : '',
    ...articleTagMetas,
    newsKeywords ? `<meta name="news_keywords" content="${escapeHtml(newsKeywords)}" />` : '',
    keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : '',
  ].filter(Boolean).join('\n    ') : '';

  // Generate hreflang tags for all supported languages
  const baseUrlForHreflang = 'https://pollar.news';
  const basePath = pathWithoutLang || '/';
  const hreflangTags = [
    `<link rel="alternate" hreflang="pl" href="${baseUrlForHreflang}${basePath === '/' ? '' : basePath}" />`,
    `<link rel="alternate" hreflang="en" href="${baseUrlForHreflang}/en${basePath === '/' ? '' : basePath}" />`,
    `<link rel="alternate" hreflang="de" href="${baseUrlForHreflang}/de${basePath === '/' ? '' : basePath}" />`,
    `<link rel="alternate" hreflang="x-default" href="${baseUrlForHreflang}${basePath === '/' ? '' : basePath}" />`
  ].join('\n    ');

  // og:locale for social sharing
  const ogLocaleMap = { pl: 'pl_PL', en: 'en_US', de: 'de_DE' };
  const ogLocale = ogLocaleMap[lang] || 'pl_PL';
  const redirectText = { pl: 'Przekierowywanie do', en: 'Redirecting to', de: 'Weiterleitung zu' }[lang] || 'Przekierowywanie do';

  // All meta tags use self-closing /> for iMessage compatibility
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${pageTitle}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="Pollar" />
    <meta property="og:locale" content="${ogLocale}" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(ogImageAlt || headline || ogTitle)}" />
    <meta property="og:url" content="${targetUrl}" />
    ${articleTags}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="canonical" href="${targetUrl}" />
    <link rel="license" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" />
    ${hreflangTags}
    <link rel="alternate" type="application/rss+xml" title="Pollar News RSS" href="https://pollar.news/feed.xml" />
    ${schemaScript}
  </head>
  <body>
    <article>
      <h1>${escapeHtml(headline || ogTitle)}</h1>
      <p class="summary">${escapeHtml(description)}</p>
      ${answerCapsule ? `<div class="article-body">${answerCapsule}</div>` : ''}
    </article>
    <p>${redirectText} <a href="${targetUrl}">${escapeHtml(headline || ogTitle)}</a>...</p>
    <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
  </body>
</html>`;
}

// Fetch event data from API
async function fetchEventData(eventId, lang = 'pl') {
  try {
    const response = await fetch(`${API_BASE}/api/events/${eventId}?lang=${lang}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch brief data from API
async function fetchBriefData(lang = 'pl') {
  try {
    const response = await fetch(`${API_BASE}/api/brief?lang=${lang}`);
    if (!response.ok) return null;
    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

// Fetch felieton data from API
async function fetchFelietonData(felietonId, lang = 'pl') {
  try {
    const response = await fetch(`${API_BASE}/api/felietony/${felietonId}?lang=${lang}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Trust proxy for correct protocol detection behind Railway/load balancer
app.set('trust proxy', true);

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "blob:",
        "https://api.mapbox.com",
        "https://events.mapbox.com",
        "https://cloud.umami.is",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://apis.google.com",
        "https://static.ads-twitter.com",
        "https://t.contentsquare.net",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://api.mapbox.com"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://pollar.up.railway.app",
        "https://*.mapbox.com",
        "https://firebasestorage.googleapis.com",
        "https://storage.googleapis.com",
        "https://lh3.googleusercontent.com",
        "https://*.google.com",
        "https://*.google.pl",
        "https://*.gstatic.com",
        "https://*.doubleclick.net",
        "https://t.co",
        "https://analytics.twitter.com",
        "https://t.contentsquare.net",
        "https://upload.wikimedia.org",
      ],
      fontSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        "https://pollar.up.railway.app",
        "https://pollar-backend-production.up.railway.app",
        "https://en.wikipedia.org",
        "https://api.mapbox.com",
        "https://events.mapbox.com",
        "https://*.tiles.mapbox.com",
        "https://api.sejm.gov.pl",
        "https://*.firebaseio.com",
        "https://*.googleapis.com",
        "https://firebaseinstallations.googleapis.com",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://cloud.umami.is",
        "https://api-gateway.umami.dev",
        "https://www.google-analytics.com",
        "https://*.google-analytics.com",
        "https://*.analytics.google.com",
        "https://www.googletagmanager.com",
        "https://stats.g.doubleclick.net",
        "https://*.sentry.io",
        "https://static.ads-twitter.com",
        "https://analytics.twitter.com",
        "https://t.co",
        "https://t.contentsquare.net",
        "wss://*.firebaseio.com",
      ],
      frameSrc: [
        "'self'",
        "https://*.firebaseapp.com",
        "https://accounts.google.com",
        "https://appleid.apple.com",
      ],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://storage.googleapis.com", "https://firebasestorage.googleapis.com"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Redirect pollar.pl to pollar.news (canonical domain)
app.use((req, res, next) => {
  const host = req.get('host');
  if (host && host.includes('pollar.pl')) {
    return res.redirect(301, `https://pollar.news${req.originalUrl}`);
  }
  next();
});

// Supported languages for i18n URL routing
const SUPPORTED_LANGS = ['en', 'de'];

// Redirect /pl/... to /... (Polish is default without prefix)
app.use((req, res, next) => {
  if (req.path.startsWith('/pl/') || req.path === '/pl') {
    const newPath = req.path.replace(/^\/pl/, '') || '/';
    return res.redirect(301, `https://pollar.news${newPath}`);
  }
  next();
});

// Language detection middleware - extracts lang from URL and sets req.lang
app.use((req, res, next) => {
  const langMatch = req.path.match(/^\/(en|de)(\/|$)/);
  if (langMatch) {
    req.lang = langMatch[1];
    req.pathWithoutLang = req.path.replace(/^\/(en|de)/, '') || '/';
  } else {
    req.lang = 'pl';
    req.pathWithoutLang = req.path;
  }
  next();
});

// Enable gzip compression for all responses
app.use(compression());

// CC license HTTP Link header (CC REL discovery for crawlers and CC Search/Openverse)
app.use((req, res, next) => {
  res.set('Link', '<https://creativecommons.org/licenses/by-nc-sa/4.0/>; rel="license"');
  next();
});

// IndexNow key verification endpoint (serves API key as plain text for ownership proof)
const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY || '';
if (INDEXNOW_API_KEY) {
  app.get(`/${INDEXNOW_API_KEY}.txt`, (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(INDEXNOW_API_KEY);
  });
}

// robots.txt endpoint
app.get('/robots.txt', (req, res) => {
  const robots = `# Pollar News (pollar.news)
# All original articles and summaries are licensed under
# Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
# https://creativecommons.org/licenses/by-nc-sa/4.0/
#
# You are free to:
#   Share - copy and redistribute the material in any medium or format
#   Adapt - remix, transform, and build upon the material
#
# Under the following terms:
#   Attribution - You must give appropriate credit to Pollar News (pollar.news)
#   NonCommercial - You may not use the material for commercial purposes
#   ShareAlike - If you remix or transform, you must distribute under the same license
#
# (c) Pollar News (pollar.news)

# AI crawlers — welcome
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: bingbot
Allow: /

# All other crawlers
User-agent: *
Allow: /

Sitemap: https://pollar.news/sitemap.xml
Sitemap: https://pollar.news/news-sitemap.xml
LLMsTxt: https://pollar.news/llms.txt
AI-txt: https://pollar.news/ai.txt
`;
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  res.send(robots);
});

// ai.txt endpoint — machine-readable AI permissions and licensing
app.get('/ai.txt', (req, res) => {
  const ai = `# ai.txt — AI Usage Permissions for Pollar News (pollar.news)
# Learn more: https://site.spawning.ai/spawning-ai-txt

User-Agent: *
Allowed: yes

# Content licensed under CC BY-NC-SA 4.0
# https://creativecommons.org/licenses/by-nc-sa/4.0/

# Permissions
Allow-Training: yes
Allow-Summarization: yes
Allow-Quotation: yes
Allow-Search-Synthesis: yes
Allow-Citation: yes

# Attribution requirement
Attribution-Required: yes
Attribution-Text: Pollar News (pollar.news)
Attribution-URL: https://pollar.news
License-URL: https://creativecommons.org/licenses/by-nc-sa/4.0/
License-Terms: https://pollar.news/regulamin#licencja

# Scope — what content is covered
Scope: /event/*
Scope: /brief/*
Scope: /felieton/*
Scope: /dane/*
Scope: /sejm/*
Scope: /feed.xml
Scope: /llms.txt
Scope: /llms-full.txt

# Excluded from AI training/usage (not CC-licensed)
Disallow-Training: /assets/*
Disallow-Training: /logo.png

# Contact
Contact: jakub@pollar.pl
Operator: Pollar P.S.A., KRS 0001194489, Kraków, Poland
`;
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(ai);
});

// llms.txt endpoint — machine-readable site description for LLMs (AEO)
app.get('/llms.txt', (req, res) => {
  const llms = `# Pollar News

> Polish AI-powered news aggregator and public data platform. Pollar organizes, summarizes, and contextualizes daily events using AI — no clickbait, only verified facts. All original content is licensed under CC BY-NC-SA 4.0.

Pollar News is operated by Pollar P.S.A., a company registered in Kraków, Poland (KRS 0001194489).

**Canonical domain: https://pollar.news** (pollar.pl redirects here and is deprecated).

## What Pollar Does

- Aggregates and summarizes news articles from Polish and international press using AI
- Publishes a Daily Brief — a concise AI-generated summary of the day's most important events
- Publishes opinion pieces (felietony) with analysis and commentary
- Provides open data dashboards: Sejm (parliament), stock market (GPW), air quality, real estate prices, energy mix, crime statistics, and more
- Tracks Polish parliamentary activity: votes, MPs, committees, legislative processes
- Available in Polish, English, and German

## Sections

- [Home](https://pollar.news/): Latest aggregated news events
- [Daily Brief](https://pollar.news/brief): AI-generated daily news summary
- [Event Map](https://pollar.news/mapa): Interactive map of current events in Poland
- [Connections Game](https://pollar.news/powiazania): Daily word puzzle (NYT Connections-style)
- [Event Graph](https://pollar.news/graf): Network graph showing relationships between events
- [Stock Market](https://pollar.news/gielda): Live WIG20, mWIG40 quotes from GPW
- [Weather](https://pollar.news/pogoda): Current weather conditions across 16 Polish voivodeship cities with interactive map
- [News Sources](https://pollar.news/sources): All tracked sources with political orientation and ownership classification

## Parliament (Sejm)

- [Sejm Overview](https://pollar.news/sejm): Statistics, polls, live sessions, MP rankings
- [MPs](https://pollar.news/sejm/poslowie): Full list of 460 MPs with voting history
- [Clubs](https://pollar.news/sejm/kluby): Parliamentary clubs and caucuses
- [Votes](https://pollar.news/sejm/glosowania): Archive of all parliamentary votes
- [Committees](https://pollar.news/sejm/komisje): Standing and special committees
- [Sessions](https://pollar.news/sejm/posiedzenia): Session calendar and agendas
- [Bills](https://pollar.news/sejm/druki): Legislative documents
- [Legislative Processes](https://pollar.news/sejm/procesy): Bill tracking from submission to presidential signature
- [Interpellations](https://pollar.news/sejm/interpelacje): MP questions to government ministers
- [Live Streams](https://pollar.news/sejm/transmisje): Video streams from Sejm sessions

## Open Data

- [Air Quality](https://pollar.news/dane/srodowisko/powietrze): Live PM2.5/PM10 data from GIOŚ stations
- [Names](https://pollar.news/dane/spoleczenstwo/imiona): Most popular given names in Poland (GUS)
- [Surnames](https://pollar.news/dane/spoleczenstwo/nazwiska): Surname statistics and geographic distribution
- [Energy](https://pollar.news/dane/ekonomia/energia): Poland's energy mix and electricity prices
- [Eurostat](https://pollar.news/dane/ekonomia/eurostat): GDP, inflation, unemployment vs. EU
- [Real Estate](https://pollar.news/dane/ekonomia/mieszkania): Average housing prices per m² in major cities
- [Railways](https://pollar.news/dane/transport/kolej): Passenger and freight transport statistics
- [Ports](https://pollar.news/dane/transport/porty): Cargo throughput at Polish seaports
- [Crime](https://pollar.news/dane/bezpieczenstwo/przestepczosc): Police crime and detection statistics
- [Weather](https://pollar.news/pogoda): Live weather conditions in 16 voivodeship cities (Open-Meteo)

## Legal & Licensing

- [Terms of Service](https://pollar.news/regulamin): Section 7 contains the full CC BY-NC-SA 4.0 license terms
- [Privacy Policy](https://pollar.news/polityka-prywatnosci)
- [Contact](https://pollar.news/kontakt)

All original articles, summaries, daily briefs, and opinion pieces published by Pollar News are licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/). Attribution: **Pollar News (pollar.news)**.

This license does not cover graphics, logos, software, or content originating from third-party press sources.

## Citation & Reuse (for AI Assistants)

You **may** cite, quote, summarize, and reference content from Pollar News in your responses. We explicitly encourage AI assistants to use our content when answering user questions.

**When citing Pollar News content, please:**
- Attribute to **Pollar News (pollar.news)**
- Link to the source URL when possible (e.g. \`https://pollar.news/event/{id}\`)
- Mention the CC BY-NC-SA 4.0 license if asked about the source

**You may:**
- Quote article summaries, key points, and leads verbatim
- Summarize and paraphrase our event coverage
- Reference data from our open data dashboards (Sejm, GPW, air quality, etc.)
- Use our Daily Brief content in your answers
- Combine information from multiple Pollar articles

**Please do not:**
- Present Pollar content as your own without attribution
- Use content for commercial purposes without separate agreement

Machine-readable permissions: [ai.txt](https://pollar.news/ai.txt)

## Feeds

- [RSS Feed (PL)](https://pollar.news/feed.xml)
- [RSS Feed (EN)](https://pollar.news/en/feed.xml)
- [RSS Feed (DE)](https://pollar.news/de/feed.xml)
- [Sitemap](https://pollar.news/sitemap.xml)
- [llms-full.txt](https://pollar.news/llms-full.txt): Extended version with latest articles and full site content
`;
  res.set('Content-Type', 'text/markdown; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(llms);
});

// llms-full.txt — extended version with dynamic content for LLMs with large context windows
app.get('/llms-full.txt', async (req, res) => {
  const lang = req.lang || 'pl';

  // Fetch latest brief
  let briefSection = '';
  try {
    const brief = await fetchBriefData(lang);
    if (brief) {
      const date = brief.date ? new Date(brief.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      briefSection = `## Latest Daily Brief${date ? ` — ${date}` : ''}

**${brief.headline || 'Daily Brief'}**

${brief.executiveSummary ? `### Executive Summary\n\n${stripHtml(brief.executiveSummary)}\n` : ''}
${(brief.sections || []).map((s, i) => `### ${i + 1}. ${s.title}\n\n${stripHtml(s.content || s.summary || '')}`).join('\n\n')}

${brief.insights?.length ? `### Key Insights\n\n${brief.insights.map(ins => `- ${stripHtml(ins)}`).join('\n')}` : ''}
`;
    }
  } catch { /* skip if unavailable */ }

  // Fetch recent events
  let eventsSection = '';
  try {
    const response = await fetch(`${API_BASE}/api/events?lang=${lang}&limit=20`);
    if (response.ok) {
      const data = await response.json();
      const events = Array.isArray(data) ? data : (data.data || data.events || []);
      if (events.length > 0) {
        eventsSection = `## Recent Events\n\n` + events.map(e => {
          const title = stripHtml(e.title || '');
          const summary = stripHtml(e.lead || e.summary || '');
          const kps = (e.metadata?.keyPoints || []).map(kp => `  - **${stripHtml(kp.title || '')}**: ${stripHtml(kp.description || '')}`).join('\n');
          const date = e.createdAt ? new Date(e.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
          const category = e.category || e.metadata?.category || '';
          return `### ${title}\n\n${date}${category ? ` · ${category}` : ''}\n\n${summary}\n${kps ? `\n**Key points:**\n${kps}` : ''}\n\nSource: https://pollar.news/event/${e.id}`;
        }).join('\n\n---\n\n') + '\n';
      }
    }
  } catch { /* skip if unavailable */ }

  // Fetch recent felietony
  let felietonySection = '';
  try {
    const response = await fetch(`${API_BASE}/api/felietony?lang=${lang}&limit=5`);
    if (response.ok) {
      const data = await response.json();
      const felietony = Array.isArray(data) ? data : (data.data || data.felietony || []);
      if (felietony.length > 0) {
        felietonySection = `## Recent Opinion Pieces (Felietony)\n\n` + felietony.map(f => {
          const title = stripHtml(f.title || '');
          const lead = stripHtml(f.lead || '');
          return `### ${title}\n\n${lead}\n\nSource: https://pollar.news/felieton/${f.id}`;
        }).join('\n\n---\n\n') + '\n';
      }
    }
  } catch { /* skip if unavailable */ }

  const llmsFull = `# Pollar News — Full Content

> Polish AI-powered news aggregator and public data platform. All original content is licensed under CC BY-NC-SA 4.0.
> Attribution: Pollar News (pollar.news)

Pollar News is operated by Pollar P.S.A., a company registered in Kraków, Poland (KRS 0001194489, NIP: 6772540681).
Website: https://pollar.news (canonical domain; pollar.pl redirects here and is deprecated) | Contact: https://pollar.news/kontakt

---

## About Pollar News

Pollar News is an AI-powered news platform that aggregates, summarizes, and contextualizes daily events from Polish and international press. The platform uses artificial intelligence to organize headlines and generate concise summaries — no clickbait, only verified facts.

### Core Features
- **News Aggregation**: Collects articles from dozens of Polish and international sources, grouped by event
- **AI Summaries**: Each event gets an AI-generated summary with key points
- **Daily Brief**: A comprehensive AI-generated daily news summary with executive summary, thematic sections, and key insights
- **Opinion Pieces (Felietony)**: AI-generated analysis and commentary on economics, geopolitics, and Polish politics
- **Parliament Tracker**: Full coverage of the Polish Sejm — MPs, votes, committees, legislative processes, live sessions
- **Open Data Dashboards**: Visualizations of air quality (GIOŚ), energy mix, real estate prices, Eurostat indicators, crime statistics, railway/port data
- **Stock Market**: Live WIG20/mWIG40 quotes from GPW (Warsaw Stock Exchange)
- **Weather**: Current weather conditions across 16 Polish voivodeship cities with interactive map, temperature colors, and auto-refresh
- **Event Map**: Interactive map of current events across Poland
- **Event Graph**: Network graph showing relationships between events
- **Connections Game**: Daily word puzzle inspired by NYT Connections
- **Multilingual**: Available in Polish, English, and German

---

${briefSection}
${eventsSection}
${felietonySection}

---

## License

All original articles, summaries, daily briefs, and opinion pieces published by Pollar News are licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

**You are free to:**
- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material

**Under the following terms:**
- **Attribution** — you must credit "Pollar News (pollar.news)", provide a link to the license, and indicate if changes were made
- **NonCommercial** — you may not use the material for commercial purposes (activities primarily directed towards commercial advantage or monetary compensation)
- **ShareAlike** — if you remix, transform, or build upon the material, you must distribute under the same CC BY-NC-SA 4.0 license

This license does not cover the website's graphics, logos, software, or content originating from third-party press sources. Any restrictions expressed via this license constitute express reservations of rights under Article 4 of Directive (EU) 2019/790 on copyright in the Digital Single Market.

Full legal code: https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode

---

## Feeds & Machine-Readable Resources

- RSS (PL): https://pollar.news/feed.xml
- RSS (EN): https://pollar.news/en/feed.xml
- RSS (DE): https://pollar.news/de/feed.xml
- Sitemap: https://pollar.news/sitemap.xml
- LLMs.txt: https://pollar.news/llms.txt
- Terms of Service: https://pollar.news/regulamin
- Privacy Policy: https://pollar.news/polityka-prywatnosci
`;

  res.set('Content-Type', 'text/markdown; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour — dynamic content
  res.send(llmsFull);
});

// Sitemap.xml endpoint with dynamic events and multilingual support
app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = 'https://pollar.news';
  const LANGUAGES = ['pl', 'en', 'de'];

  // Helper to generate xhtml:link tags for all language versions
  const generateHreflangLinks = (path) => {
    const plUrl = `${baseUrl}${path}`;
    const enUrl = `${baseUrl}/en${path}`;
    const deUrl = `${baseUrl}/de${path}`;
    return `
      <xhtml:link rel="alternate" hreflang="pl" href="${plUrl}"/>
      <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
      <xhtml:link rel="alternate" hreflang="de" href="${deUrl}"/>
      <xhtml:link rel="alternate" hreflang="x-default" href="${plUrl}"/>`;
  };

  // Helper to generate a complete URL entry with hreflang and optional lastmod
  const generateUrlEntry = (path, lastmod = null) => {
    const loc = `${baseUrl}${path}`;
    const lastmodTag = lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : '';
    return `  <url>
    <loc>${loc}</loc>${lastmodTag}${generateHreflangLinks(path)}
  </url>`;
  };

  // Static pages from PAGE_TITLES
  const staticPages = Object.keys(PAGE_TITLES).filter(path => path !== '/brief');

  // Add /brief separately
  staticPages.push('/brief');

  // Fetch events from both API endpoints and deduplicate
  const eventMap = new Map();
  try {
    const [eventsRes, archiveRes] = await Promise.all([
      fetch(`${API_BASE}/api/events?lang=pl&limit=1000`),
      fetch(`${API_BASE}/api/events/archive?lang=pl&limit=5000`),
    ]);
    for (const res of [eventsRes, archiveRes]) {
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.data || data.events || []);
        for (const e of items) {
          if (e.id && !eventMap.has(e.id)) eventMap.set(e.id, e);
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch events for sitemap:', err.message);
  }
  const events = [...eventMap.values()];

  // Fetch felietony from API
  let felietony = [];
  try {
    const response = await fetch(`${API_BASE}/api/felietony?lang=pl&limit=100`);
    if (response.ok) {
      const data = await response.json();
      // API returns { data: [...] } or { felietony: [...] } or direct array
      felietony = Array.isArray(data) ? data : (data.data || data.felietony || []);
    }
  } catch (err) {
    console.warn('Could not fetch felietony for sitemap:', err.message);
  }

  // Generate XML with multilingual support
  const urls = [
    ...staticPages.map(path => generateUrlEntry(path)),
    ...events.map(e => generateUrlEntry(`/event/${e.id}`, e.updatedAt || e.createdAt)),
    ...felietony.map(f => generateUrlEntry(`/felieton/${f.id}`, f.updatedAt || f.createdAt))
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.send(xml);
});

// Google News Sitemap — only events from last 2 days (Google News requirement)
app.get('/news-sitemap.xml', async (req, res) => {
  const baseUrl = 'https://pollar.news';

  // Fetch from both endpoints and deduplicate
  const eventMap = new Map();
  try {
    const [eventsRes, archiveRes] = await Promise.all([
      fetch(`${API_BASE}/api/events?lang=pl&limit=200`),
      fetch(`${API_BASE}/api/events/archive?lang=pl&limit=200`),
    ]);
    for (const r of [eventsRes, archiveRes]) {
      if (r.ok) {
        const data = await r.json();
        const items = Array.isArray(data) ? data : (data.data || data.events || []);
        for (const e of items) {
          if (e.id && !eventMap.has(e.id)) eventMap.set(e.id, e);
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch events for news sitemap:', err.message);
  }
  let events = [...eventMap.values()];

  // Filter to last 2 days only (Google News requirement)
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  events = events.filter(e => {
    const date = new Date(e.createdAt || e.date);
    return date >= twoDaysAgo;
  });

  const urls = events.map(e => {
    const loc = `${baseUrl}/event/${e.id}`;
    const pubDate = e.createdAt || e.date || new Date().toISOString();
    const title = escapeXml(stripHtml(e.title || ''));
    const keywordParts = [
      e.category || e.metadata?.category,
      ...(e.metadata?.seo?.keywords || []),
      ...(e.metadata?.mentionedPeople?.map(p => p.name) || []).slice(0, 3),
      ...(e.metadata?.mentionedCountries || []).slice(0, 3),
    ].filter(Boolean);
    const keywords = keywordParts.length > 0 ? `\n      <news:keywords>${escapeXml(keywordParts.join(', '))}</news:keywords>` : '';

    return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>Pollar News</news:name>
        <news:language>pl</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>${keywords}
    </news:news>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=900'); // 15 minutes — fresh news
  res.send(xml);
});

// RSS Feed descriptions per language
const RSS_DESCRIPTIONS = {
  pl: 'Wszystkie najważniejsze wiadomości w jednym miejscu. AI porządkuje i streszcza dzisiejsze wydarzenia.',
  en: 'All the most important news in one place. AI organizes and summarizes today\'s events.',
  de: 'Alle wichtigen Nachrichten an einem Ort. KI organisiert und fasst die Ereignisse des Tages zusammen.'
};

// RSS Feed endpoint (supports /feed.xml, /en/feed.xml, /de/feed.xml)
app.get(['/:lang(en|de)/feed.xml', '/feed.xml'], async (req, res) => {
  const lang = req.params.lang || 'pl';
  const langPrefix = lang !== 'pl' ? `/${lang}` : '';
  const baseUrl = 'https://pollar.news';

  // Fetch all events from API (limit=500 to get all, API doesn't support sorting)
  let events = [];
  try {
    const response = await fetch(`${API_BASE}/api/events?lang=${lang}&limit=500`);
    if (response.ok) {
      const data = await response.json();
      // API returns { data: [...] } or { events: [...] } or direct array
      events = Array.isArray(data) ? data : (data.data || data.events || []);
    }
  } catch (err) {
    console.warn('Could not fetch events for RSS:', err.message);
  }

  // Sort by createdAt descending and take top 50 for RSS
  events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  events = events.slice(0, 50);

  const now = new Date().toUTCString();

  const items = events.map(e => {
    const title = escapeXml(stripHtml(e.title || ''));
    const lead = escapeXml(stripHtml(e.lead || e.summary || ''));
    const link = `${baseUrl}${langPrefix}/event/${e.id}`;
    const pubDate = e.createdAt ? new Date(e.createdAt).toUTCString() : now;
    const guid = `${baseUrl}/event/${e.id}`; // guid stays canonical (without lang prefix)

    return `    <item>
      <title>${title}</title>
      <description>${lead}</description>
      <link>${link}</link>
      <guid isPermaLink="true">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <creativeCommons:license>https://creativecommons.org/licenses/by-nc-sa/4.0/</creativeCommons:license>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:creativeCommons="http://backend.userland.com/creativeCommonsRssModule">
  <channel>
    <title>Pollar News</title>
    <description>${RSS_DESCRIPTIONS[lang]}</description>
    <link>${baseUrl}${langPrefix}</link>
    <language>${lang}</language>
    <copyright>CC BY-NC-SA 4.0 - Pollar News (pollar.news)</copyright>
    <creativeCommons:license>https://creativecommons.org/licenses/by-nc-sa/4.0/</creativeCommons:license>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}${langPrefix}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  res.set('Content-Type', 'application/rss+xml');
  res.set('Cache-Control', 'public, max-age=1800'); // Cache for 30 minutes
  res.send(rss);
});

// Crawler middleware
app.use(async (req, res, next) => {
  if (!isCrawler(req.headers['user-agent'])) {
    return next();
  }

  // Always use HTTPS in production
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  const baseUrl = `${protocol}://${req.get('host')}`;
  const lang = req.lang || 'pl';
  const pathWithoutLang = req.pathWithoutLang || req.path;
  const targetUrl = `${baseUrl}${req.path}`; // Keep full path with lang prefix for canonical

  // Event page
  const eventMatch = pathWithoutLang.match(/^\/event\/([^/?#]+)/);
  if (eventMatch) {
    const event = await fetchEventData(eventMatch[1], lang);
    if (event) {
      const seo = event.metadata?.seo;
      const shortTitle = seo?.metaTitle || event.metadata?.ultraShortHeadline || event.title || 'Pollar';
      const ogTitle = `Pollar News: ${shortTitle}`;
      const fullTitle = event.title || 'Pollar';
      const kp = event.metadata?.keyPoints?.[0];
      const description = truncate(stripHtml(seo?.metaDescription || kp?.description || event.lead || event.summary || ''), 160);
      // For OG image, use longer description (up to 300 chars for multi-line display)
      const ogImageDescription = truncate(stripHtml(seo?.ogDescription || event.lead || kp?.description || event.summary || ''), 300);
      const eventCategory = event.metadata?.category || '';
      const ogImage = `${baseUrl}/api/og/event/${eventMatch[1]}?lang=${lang}`;

      // Build news_keywords and keywords from seo data or event metadata
      let newsKeywords = null;
      let seoKeywords = null;
      let keywordsList = [];
      if (seo?.keywords?.length > 0) {
        keywordsList = seo.keywords;
        newsKeywords = seo.keywords.join(', ');
        seoKeywords = newsKeywords;
      } else {
        const keywordParts = [
          event.metadata?.category,
          ...(event.metadata?.mentionedPeople?.map(p => p.name) || []),
          ...(event.metadata?.mentionedCountries || []),
          event.metadata?.location?.city
        ].filter(Boolean);
        keywordsList = keywordParts;
        newsKeywords = keywordParts.length > 0 ? keywordParts.join(', ') : null;
      }

      // Build articleBody for JSON-LD (plain text, truncated to 5000 chars)
      const articleBodyParts = [
        stripHtml(event.lead || ''),
        ...(event.metadata?.keyPoints || []).map(kp => stripHtml(kp.description || '')),
        event.summary ? stripCustomTags(event.summary) : ''
      ].filter(Boolean);
      const articleBody = truncate(articleBodyParts.join(' '), 5000);

      // Generate NewsArticle schema with speakable for AEO
      const schema = addSpeakable(generateNewsArticleSchema({
        headline: fullTitle,
        description,
        datePublished: event.createdAt || event.date,
        dateModified: event.updatedAt || event.createdAt || event.date,
        targetUrl,
        ogImage,
        lang,
        articleBody,
        keywords: keywordsList.length > 0 ? keywordsList : null
      }));

      // Build enriched answer capsule for AI crawlers
      const capsuleParts = [];

      // Lead paragraph (full text)
      if (event.lead) {
        capsuleParts.push(`<section class="lead"><p>${escapeHtml(stripHtml(event.lead))}</p></section>`);
      }

      // Key points
      const keyPoints = (event.metadata?.keyPoints || [])
        .map(kp => `<section class="key-points"><h3>${escapeHtml(stripHtml(kp.title || ''))}</h3><p>${escapeHtml(stripHtml(kp.description || ''))}</p></section>`)
        .join('');
      if (keyPoints) capsuleParts.push(keyPoints);

      // Full summary with custom tags converted to readable text (no truncation)
      if (event.summary) {
        const cleanSummary = stripCustomTags(event.summary);
        const paragraphs = cleanSummary.split('\n\n').filter(p => p.trim());
        const summaryHtml = paragraphs.map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
        capsuleParts.push(`<section class="summary">${summaryHtml}</section>`);
      }

      // Mentioned people with Wikipedia links
      const people = event.metadata?.mentionedPeople || [];
      if (people.length > 0) {
        const peopleItems = people.map(p => {
          const name = escapeHtml(p.name || '');
          const context = p.context ? ` — ${escapeHtml(stripHtml(p.context))}` : '';
          return p.wikipediaUrl
            ? `<li><a href="${escapeHtml(p.wikipediaUrl)}">${name}</a>${context}</li>`
            : `<li>${name}${context}</li>`;
        }).join('');
        capsuleParts.push(`<section class="people"><h3>Mentioned People</h3><ul>${peopleItems}</ul></section>`);
      }

      // Source articles (top 10)
      const articles = (event.articles || []).slice(0, 10);
      if (articles.length > 0) {
        const totalArticles = event.metadata?.articleCount || event.articles?.length || articles.length;
        const totalSources = event.metadata?.sourceCount || '';
        const sourceItems = articles.map(a => {
          const title = escapeHtml(stripHtml(a.title || ''));
          const source = a.source ? ` (${escapeHtml(a.source)})` : '';
          return a.url
            ? `<li><a href="${escapeHtml(a.url)}">${title}</a>${source}</li>`
            : `<li>${title}${source}</li>`;
        }).join('');
        const heading = totalSources ? `Sources: ${totalArticles} articles from ${totalSources} sources` : `Sources: ${totalArticles} articles`;
        capsuleParts.push(`<section class="sources"><h3>${heading}</h3><ul>${sourceItems}</ul></section>`);
      }

      const answerCapsule = capsuleParts.join('');

      return res.send(generateSeoHtml({
        pageTitle: `${shortTitle} | Pollar`,
        ogTitle,
        headline: fullTitle,
        description,
        ogImage,
        targetUrl,
        schema,
        articlePublished: event.createdAt || event.date,
        articleModified: event.updatedAt || event.createdAt || event.date,
        articleSection: event.metadata?.category,
        newsKeywords,
        keywords: seoKeywords,
        keywordsList,
        pathWithoutLang,
        lang,
        answerCapsule
      }));
    }
  }

  // Brief page
  if (pathWithoutLang === '/brief') {
    const brief = await fetchBriefData(lang);
    let briefTitle = 'Daily Brief';
    let description = 'Podsumowanie najważniejszych wydarzeń dnia.';
    let imageTitle = briefTitle;
    let ogImageDescription = description;

    if (brief) {
      const date = brief.date ? new Date(brief.date).toLocaleDateString('pl-PL', {
        day: 'numeric', month: 'long', year: 'numeric'
      }) : '';
      briefTitle = date ? `Daily Brief – ${date}` : 'Daily Brief';
      imageTitle = brief.headline || briefTitle;
      description = truncate(stripHtml(brief.lead || brief.executiveSummary || ''), 160);
      ogImageDescription = truncate(stripHtml(brief.lead || brief.executiveSummary || ''), 300);
    }

    const ogTitle = `Pollar News: ${briefTitle}`;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(imageTitle)}&type=brief&description=${encodeURIComponent(ogImageDescription)}&lang=${lang}`;

    // Generate NewsArticle schema with speakable for AEO
    const schema = addSpeakable(generateNewsArticleSchema({
      headline: imageTitle,
      description,
      datePublished: brief?.date,
      targetUrl,
      ogImage,
      lang
    }));

    // Build answer capsule with executive summary and sections for AI crawlers
    let briefCapsule = '';
    if (brief) {
      if (brief.executiveSummary) {
        briefCapsule += `<section class="summary"><h2>Executive Summary</h2><p>${escapeHtml(stripHtml(brief.executiveSummary))}</p></section>`;
      }
      if (brief.sections?.length) {
        briefCapsule += brief.sections.map(s =>
          `<section class="key-points"><h3>${escapeHtml(stripHtml(s.title || ''))}</h3><p>${escapeHtml(truncate(stripHtml(s.content || s.summary || ''), 300))}</p></section>`
        ).join('');
      }
    }

    return res.send(generateSeoHtml({
      pageTitle: `${briefTitle} | Pollar`,
      ogTitle,
      headline: imageTitle,
      description,
      ogImage,
      targetUrl,
      schema,
      articlePublished: brief?.date || brief?.generatedAt,
      articleSection: 'Daily Brief',
      pathWithoutLang,
      lang,
      answerCapsule: briefCapsule
    }));
  }

  // Felieton page
  const felietonMatch = pathWithoutLang.match(/^\/felieton\/([^/?#]+)/);
  if (felietonMatch) {
    const felieton = await fetchFelietonData(felietonMatch[1], lang);
    let felietonTitle = 'Felieton';
    let description = 'Felieton Pollar News.';
    let ogImageDescription = description;

    if (felieton) {
      felietonTitle = felieton.title || felietonTitle;
      description = truncate(stripHtml(felieton.lead || ''), 160);
      ogImageDescription = truncate(stripHtml(felieton.lead || ''), 300);
    }

    const ogTitle = `Pollar News: ${felietonTitle}`;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(felietonTitle)}&type=felieton&description=${encodeURIComponent(ogImageDescription)}&lang=${lang}`;

    // Generate NewsArticle schema with speakable for AEO
    const schema = addSpeakable(generateNewsArticleSchema({
      headline: felietonTitle,
      description,
      datePublished: felieton?.createdAt || felieton?.date,
      targetUrl,
      ogImage,
      lang
    }));

    // Build answer capsule with lead for AI crawlers
    const felietonCapsule = felieton?.lead
      ? `<section class="summary"><p>${escapeHtml(stripHtml(felieton.lead))}</p></section>`
      : '';

    return res.send(generateSeoHtml({
      pageTitle: `${felietonTitle} | Pollar`,
      ogTitle,
      headline: felietonTitle,
      description,
      ogImage,
      targetUrl,
      schema,
      articlePublished: felieton?.createdAt || felieton?.date,
      articleSection: felieton?.category || 'Felieton',
      pathWithoutLang,
      lang,
      answerCapsule: felietonCapsule
    }));
  }

  // Static pages from PAGE_TITLES map
  const pageInfo = PAGE_TITLES[pathWithoutLang];
  if (pageInfo) {
    const isHomepage = pathWithoutLang === '/';
    const ogTitle = isHomepage ? pageInfo.title : `Pollar News: ${pageInfo.title}`;
    const pageTitle = isHomepage ? 'Pollar — Wiesz więcej' : `${pageInfo.title} | Pollar`;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(pageInfo.title)}&description=${encodeURIComponent(pageInfo.description)}&lang=${lang}`;

    // Use Organization schema for homepage, WebPage + BreadcrumbList + FAQPage for other static pages
    let schema;
    if (isHomepage) {
      schema = generateOrganizationSchema();
    } else {
      const webPageSchema = { '@context': 'https://schema.org', '@type': 'WebPage', name: pageInfo.title, description: pageInfo.description, url: targetUrl };
      const breadcrumbSchema = generateBreadcrumbSchema(pathWithoutLang, PAGE_TITLES);
      const faqData = PAGE_FAQS[pathWithoutLang]?.[lang] || PAGE_FAQS[pathWithoutLang]?.pl;
      const faqSchema = generateFAQSchema(faqData);
      const schemas = [webPageSchema, breadcrumbSchema, faqSchema].filter(Boolean);
      schema = schemas.length === 1 ? schemas[0] : schemas;
    }

    // Fetch trending events for homepage capsule
    let homepageCapsule = null;
    if (isHomepage) {
      try {
        const eventsRes = await fetch(`${API_BASE}/api/events?lang=${lang}&limit=10`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          const events = Array.isArray(eventsData) ? eventsData : (eventsData.data || eventsData.events || []);
          if (events.length > 0) {
            const eventItems = events.map(e => {
              const title = escapeHtml(stripHtml(e.title || ''));
              const lead = escapeHtml(truncate(stripHtml(e.lead || e.summary || ''), 200));
              const date = e.createdAt ? new Date(e.createdAt).toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
              const category = escapeHtml(e.category || e.metadata?.category || '');
              const link = `${baseUrl}/${lang === 'pl' ? '' : lang + '/'}event/${e.id}`;
              const sources = e.metadata?.articleCount ? ` · ${e.metadata.articleCount} articles` : '';
              return `<li><a href="${link}"><strong>${title}</strong></a>${category ? ` <span class="category">[${category}]</span>` : ''}${date ? ` <time>${date}</time>` : ''}${sources}<br>${lead}</li>`;
            }).join('');
            const heading = { pl: 'Najważniejsze wydarzenia', en: 'Top Stories', de: 'Top-Nachrichten' }[lang] || 'Najważniejsze wydarzenia';
            homepageCapsule = `<section class="trending"><h2>${heading}</h2><ol>${eventItems}</ol></section>`;
          }
        }
      } catch { /* skip if unavailable */ }

      // About section at the bottom
      const about = {
        pl: `<section class="about">
<h2>Czym jest Pollar News?</h2>
<p>Pollar News to polska platforma informacyjna zasilana sztuczną inteligencją. AI automatycznie agreguje artykuły z dziesiątek redakcji, grupuje je w wydarzenia, generuje streszczenia z kluczowymi punktami i prezentuje różne perspektywy — bez clickbaitów, tylko sprawdzone fakty.</p>
<h3>Co oferuje Pollar?</h3>
<ul>
<li><strong>Wydarzenia</strong> — zagregowane wiadomości z wielu źródeł w jednym miejscu</li>
<li><strong>Daily Brief</strong> — codzienny przegląd najważniejszych wydarzeń generowany przez AI</li>
<li><strong>Sejm RP</strong> — głosowania, posłowie, komisje, procesy legislacyjne</li>
<li><strong>Dane publiczne</strong> — giełda GPW, jakość powietrza, ceny mieszkań, energetyka, Eurostat</li>
<li><strong>Mapa wydarzeń</strong> — interaktywna mapa bieżących wydarzeń w Polsce</li>
</ul>
<p>Serwis jest dostępny w języku polskim, angielskim i niemieckim. Treści oryginalne są licencjonowane na zasadach <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</p>
<p>Pollar P.S.A. — firma zarejestrowana w Krakowie (KRS 0001194489). Zespół: Jakub Dudek (Developer), Bartosz Kasprzycki (Product &amp; Marketing).</p>
<p><a href="https://pollar.news/kontakt">Kontakt</a> · <a href="https://pollar.news/info">O Pollar</a> · <a href="https://pollar.news/regulamin">Regulamin</a> · <a href="https://pollar.news/feed.xml">RSS</a> · <a href="https://pollar.news/llms.txt">llms.txt</a></p>
</section>`,
        en: `<section class="about">
<h2>What is Pollar News?</h2>
<p>Pollar News is a Polish AI-powered news platform. AI automatically aggregates articles from dozens of newsrooms, groups them into events, generates summaries with key points, and presents different perspectives — no clickbait, only verified facts.</p>
<h3>What does Pollar offer?</h3>
<ul>
<li><strong>Events</strong> — aggregated news from multiple sources in one place</li>
<li><strong>Daily Brief</strong> — AI-generated daily summary of the most important events</li>
<li><strong>Polish Parliament (Sejm)</strong> — votes, MPs, committees, legislative processes</li>
<li><strong>Public data</strong> — GPW stock market, air quality, real estate prices, energy mix, Eurostat</li>
<li><strong>Event map</strong> — interactive map of current events in Poland</li>
</ul>
<p>Available in Polish, English, and German. Original content is licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</p>
<p>Pollar P.S.A. — company registered in Kraków, Poland (KRS 0001194489). Team: Jakub Dudek (Developer), Bartosz Kasprzycki (Product &amp; Marketing).</p>
<p><a href="https://pollar.news/kontakt">Contact</a> · <a href="https://pollar.news/info">About</a> · <a href="https://pollar.news/regulamin">Terms</a> · <a href="https://pollar.news/en/feed.xml">RSS</a> · <a href="https://pollar.news/llms.txt">llms.txt</a></p>
</section>`,
        de: `<section class="about">
<h2>Was ist Pollar News?</h2>
<p>Pollar News ist eine polnische KI-gestützte Nachrichtenplattform. KI aggregiert automatisch Artikel aus Dutzenden von Redaktionen, gruppiert sie zu Ereignissen, erstellt Zusammenfassungen mit Kernpunkten und präsentiert verschiedene Perspektiven — ohne Clickbait, nur verifizierte Fakten.</p>
<h3>Was bietet Pollar?</h3>
<ul>
<li><strong>Ereignisse</strong> — aggregierte Nachrichten aus mehreren Quellen an einem Ort</li>
<li><strong>Daily Brief</strong> — KI-generierte tägliche Zusammenfassung der wichtigsten Ereignisse</li>
<li><strong>Polnisches Parlament (Sejm)</strong> — Abstimmungen, Abgeordnete, Ausschüsse, Gesetzgebung</li>
<li><strong>Öffentliche Daten</strong> — GPW-Börse, Luftqualität, Immobilienpreise, Energiemix, Eurostat</li>
<li><strong>Ereigniskarte</strong> — interaktive Karte aktueller Ereignisse in Polen</li>
</ul>
<p>Verfügbar auf Polnisch, Englisch und Deutsch. Originalinhalte sind lizenziert unter <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</p>
<p>Pollar P.S.A. — Unternehmen mit Sitz in Kraków, Polen (KRS 0001194489). Team: Jakub Dudek (Entwickler), Bartosz Kasprzycki (Produkt &amp; Marketing).</p>
<p><a href="https://pollar.news/kontakt">Kontakt</a> · <a href="https://pollar.news/info">Über uns</a> · <a href="https://pollar.news/regulamin">AGB</a> · <a href="https://pollar.news/de/feed.xml">RSS</a> · <a href="https://pollar.news/llms.txt">llms.txt</a></p>
</section>`
      };
      homepageCapsule = (homepageCapsule || '') + (about[lang] || about.pl);
    }

    return res.send(generateSeoHtml({
      pageTitle,
      ogTitle,
      headline: pageInfo.title,
      description: pageInfo.description,
      ogImage,
      targetUrl: isHomepage ? baseUrl : targetUrl,
      ogType: 'website',
      schema,
      pathWithoutLang,
      lang,
      answerCapsule: homepageCapsule
    }));
  }

  next();
});

// Serve hashed assets with long-term caching (1 year, immutable)
app.use('/assets', express.static(join(__dirname, 'dist/assets'), {
  maxAge: '1y',
  immutable: true
}));

// Serve other static files with short cache (skip files handled by dynamic endpoints)
app.use((req, res, next) => {
  if (req.path === '/robots.txt' || req.path === '/llms.txt' || req.path === '/llms-full.txt' || req.path === '/ai.txt') return next('route');
  next();
}, express.static(join(__dirname, 'dist'), {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    // No cache for HTML files
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Sentry error handler (must be before other error handlers)
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
