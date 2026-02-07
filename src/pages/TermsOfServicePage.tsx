import { useState, useEffect, useRef, useCallback } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { GrainImage } from '../components/common/GrainImage';
import termsImg from '../assets/images/terms.webp';
import { useLanguage } from '@/stores/languageStore';

const COMPANY_INFO = 'Pollar P.S.A. z siedzibą w Krakowie przy ul. Piastowskiej 46/12, 30-067 Kraków, wpisaną do rejestru przedsiębiorców Krajowego Rejestru Sądowego prowadzonego przez Sąd Rejonowy dla Krakowa - Śródmieścia w Krakowie, XI Wydział Gospodarczy KRS, pod numerem KRS 0001194489, NIP: 6772540681';

interface Section {
  id: string;
  title: string;
}

const SECTIONS: Record<string, Section[]> = {
  pl: [
    { id: 'postanowienia', title: 'Postanowienia ogólne' },
    { id: 'definicje', title: 'Definicje' },
    { id: 'zakres', title: 'Rodzaje i zakres Usług' },
    { id: 'warunki', title: 'Warunki korzystania' },
    { id: 'rejestracja', title: 'Rejestracja i Konto' },
    { id: 'wlasnosc', title: 'Treści i własność intelektualna' },
    { id: 'licencja', title: 'Licencja CC BY-NC-SA 4.0' },
    { id: 'odpowiedzialnosc', title: 'Odpowiedzialność' },
    { id: 'reklamacje', title: 'Reklamacje' },
    { id: 'dane', title: 'Ochrona danych osobowych' },
    { id: 'zmiany', title: 'Zmiany Regulaminu' },
  ],
  en: [
    { id: 'general', title: 'General Provisions' },
    { id: 'definitions', title: 'Definitions' },
    { id: 'scope', title: 'Scope of Services' },
    { id: 'requirements', title: 'Requirements' },
    { id: 'registration', title: 'Registration and Account' },
    { id: 'ip', title: 'Content and IP' },
    { id: 'license', title: 'CC BY-NC-SA 4.0 License' },
    { id: 'liability', title: 'Liability' },
    { id: 'complaints', title: 'Complaints' },
    { id: 'data', title: 'Personal Data' },
    { id: 'changes', title: 'Changes to the Terms' },
  ],
  de: [
    { id: 'allgemein', title: 'Allgemeine Bestimmungen' },
    { id: 'definitionen', title: 'Definitionen' },
    { id: 'umfang', title: 'Umfang der Dienste' },
    { id: 'voraussetzungen', title: 'Voraussetzungen' },
    { id: 'registrierung', title: 'Registrierung und Konto' },
    { id: 'eigentum', title: 'Inhalte und geistiges Eigentum' },
    { id: 'lizenz', title: 'CC BY-NC-SA 4.0 Lizenz' },
    { id: 'haftung', title: 'Haftung' },
    { id: 'beschwerden', title: 'Beschwerden' },
    { id: 'daten', title: 'Personenbezogene Daten' },
    { id: 'aenderungen', title: 'Änderungen der Bedingungen' },
  ],
};

const HERO_ALT: Record<string, string> = {
  pl: 'Regulamin',
  en: 'Terms of Service',
  de: 'Nutzungsbedingungen',
};

const TITLE: Record<string, string> = {
  pl: 'Regulamin serwisu POLLAR P.S.A.',
  en: 'Terms of Service — POLLAR P.S.A.',
  de: 'Nutzungsbedingungen — POLLAR P.S.A.',
};

function useSectionObserver(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-10% 0px -70% 0px' }
    );

    const el = contentRef.current;
    if (el) {
      sectionIds.forEach(id => {
        const section = el.querySelector(`#${id}`);
        if (section) observer.observe(section);
      });
    }

    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return { activeSection, contentRef, scrollToSection };
}

function SidebarNav({ sections, activeSection, scrollToSection }: {
  sections: Section[];
  activeSection: string;
  scrollToSection: (id: string) => void;
}) {
  return (
    <>
      {/* Mobile navigation */}
      <div className="lg:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-zinc-200 -mx-6 px-6 py-3 mb-8">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${
                activeSection === s.id
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop sidebar */}
      <nav className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 space-y-0.5">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`group w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-baseline gap-3 ${
                activeSection === s.id
                  ? 'bg-zinc-900 text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <span className={`text-xs tabular-nums ${activeSection === s.id ? 'text-zinc-400' : 'text-zinc-300 group-hover:text-zinc-400'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {s.title}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

function TermsContentPL() {
  return (
    <>
      <section id="postanowienia" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">1. Postanowienia ogólne</h2>
        <p className="text-zinc-600 mb-3">Niniejszy Regulamin określa zasady korzystania z serwisu internetowego dostępnego pod adresem <a href="https://pollar.news" className="text-red-600 hover:underline">https://pollar.news</a> (&bdquo;<strong>Serwis</strong>&rdquo;) oraz powiązanych aplikacji mobilnych i telewizyjnych (&bdquo;<strong>Aplikacje</strong>&rdquo;), prowadzonych przez <strong>{COMPANY_INFO}</strong> (&bdquo;<strong>Pollar</strong>&rdquo;, &bdquo;<strong>Usługodawca</strong>&rdquo;).</p>
        <p className="text-zinc-600 mb-3">Korzystanie z Serwisu i Aplikacji oznacza akceptację niniejszego Regulaminu.</p>
        <p className="text-zinc-600">Regulamin jest udostępniany nieodpłatnie za pośrednictwem Serwisu w formie umożliwiającej jego pobranie, utrwalenie i wydrukowanie.</p>
      </section>

      <section id="definicje" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">2. Definicje</h2>
        <ul className="list-disc pl-6 text-zinc-600 space-y-1.5">
          <li><strong>Użytkownik</strong> – każda osoba korzystająca z Serwisu lub Aplikacji.</li>
          <li><strong>Konto</strong> – indywidualne konto Użytkownika w Serwisie, utworzone w procesie rejestracji.</li>
          <li><strong>Usługi</strong> – usługi świadczone drogą elektroniczną przez Usługodawcę za pośrednictwem Serwisu i Aplikacji.</li>
          <li><strong>Treści</strong> – materiały informacyjne udostępniane w Serwisie, w tym zagregowane i przetworzone artykuły prasowe, podsumowania oraz analizy generowane z wykorzystaniem sztucznej inteligencji.</li>
        </ul>
      </section>

      <section id="zakres" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">3. Rodzaje i zakres Usług</h2>
        <p className="text-zinc-600 mb-3">Usługodawca świadczy następujące Usługi:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>udostępnianie zagregowanych wiadomości i artykułów prasowych,</li>
          <li>generowanie podsumowań i analiz z wykorzystaniem sztucznej inteligencji,</li>
          <li>umożliwienie tworzenia Konta i personalizacji treści,</li>
          <li>udostępnianie danych publicznych (dane sejmowe, giełdowe, statystyczne),</li>
          <li>wysyłka newslettera (po wyrażeniu odrębnej zgody).</li>
        </ul>
        <p className="text-zinc-600">Usługi są świadczone nieodpłatnie, chyba że wyraźnie wskazano inaczej.</p>
      </section>

      <section id="warunki" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">4. Warunki korzystania z Serwisu</h2>
        <p className="text-zinc-600 mb-3">Do korzystania z Serwisu niezbędne jest:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>urządzenie z dostępem do sieci Internet,</li>
          <li>przeglądarka internetowa obsługująca JavaScript i pliki cookies,</li>
          <li>aktywny adres e-mail (w przypadku rejestracji Konta).</li>
        </ul>
        <p className="text-zinc-600">Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z obowiązującym prawem, niniejszym Regulaminem oraz zasadami współżycia społecznego.</p>
      </section>

      <section id="rejestracja" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">5. Rejestracja i Konto</h2>
        <p className="text-zinc-600 mb-3">Rejestracja Konta jest dobrowolna. Część funkcjonalności Serwisu dostępna jest bez rejestracji.</p>
        <p className="text-zinc-600 mb-3">Aby utworzyć Konto, Użytkownik podaje:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>imię (nazwę wyświetlaną),</li>
          <li>adres e-mail,</li>
          <li>hasło (w przypadku rejestracji przez e-mail).</li>
        </ul>
        <p className="text-zinc-600 mb-3">Rejestracja możliwa jest również za pośrednictwem konta Google lub Apple.</p>
        <p className="text-zinc-600 mb-3">Użytkownik zobowiązuje się do podania prawdziwych danych oraz do nieudostępniania danych logowania osobom trzecim.</p>
        <p className="text-zinc-600">Użytkownik może w każdym momencie usunąć swoje Konto w ustawieniach profilu lub kontaktując się z Usługodawcą pod adresem <strong>jakub@pollar.pl</strong>.</p>
      </section>

      <section id="wlasnosc" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">6. Treści i własność intelektualna</h2>
        <p className="text-zinc-600 mb-3">Serwis agreguje i przetwarza publicznie dostępne artykuły prasowe. Pollar nie jest autorem ani wydawcą oryginalnych artykułów — pełna treść artykułów dostępna jest na stronach ich wydawców.</p>
        <p className="text-zinc-600 mb-3">Podsumowania i analizy generowane przez sztuczną inteligencję mają charakter informacyjny i nie stanowią porad prawnych, finansowych ani inwestycyjnych.</p>
        <p className="text-zinc-600">Elementy graficzne Serwisu, układ treści, logotypy oraz oprogramowanie stanowią własność Usługodawcy lub są wykorzystywane na podstawie odpowiednich licencji i podlegają ochronie prawnej.</p>
      </section>

      <section id="licencja" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">7. Licencja Creative Commons</h2>
        <p className="text-zinc-600 mb-3">Oryginalne treści publikowane w Serwisie — w tym podsumowania, analizy, artykuły briefów dziennych oraz felietony generowane przez Usługodawcę — udostępniane są na warunkach licencji <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.pl" target="_blank" rel="license noopener noreferrer" className="text-red-600 hover:underline">Creative Commons Uznanie autorstwa – Użycie niekomercyjne – Na tych samych warunkach 4.0 Międzynarodowe (CC BY-NC-SA 4.0)</a>.</p>
        <p className="text-zinc-600 mb-3">Licencjodawca udziela ogólnoświatowej, nieodpłatnej, niewyłącznej i nieodwołalnej licencji na korzystanie z Treści wyłącznie w celach niekomercyjnych, obejmującej prawo do:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>kopiowania i rozpowszechniania Treści w dowolnym medium lub formacie,</li>
          <li>remiksowania, przekształcania i tworzenia na podstawie Treści utworów zależnych.</li>
        </ul>
        <p className="text-zinc-600 mb-3">Warunki korzystania:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li><strong>Uznanie autorstwa</strong> — należy podać autora jako &bdquo;Pollar News (pollar.news)&rdquo;, dołączyć link do licencji oraz wskazać, czy dokonano zmian w materiale.</li>
          <li><strong>Użycie niekomercyjne</strong> — Treści nie mogą być wykorzystywane w celach komercyjnych, tj. działaniach ukierunkowanych przede wszystkim na osiągnięcie korzyści majątkowej lub wynagrodzenia pieniężnego.</li>
          <li><strong>Na tych samych warunkach</strong> — w przypadku remiksowania, przekształcania lub tworzenia na podstawie Treści, utwory zależne muszą być udostępniane na tej samej licencji CC BY-NC-SA 4.0 lub licencji z nią kompatybilnej.</li>
        </ul>
        <p className="text-zinc-600 mb-3">Licencja nie obejmuje elementów graficznych Serwisu, logotypów, oprogramowania ani treści pochodzących z zewnętrznych źródeł prasowych. Wszelkie ograniczenia wyrażone za pośrednictwem niniejszej licencji stanowią wyraźne zastrzeżenie praw w rozumieniu art. 4 Dyrektywy Parlamentu Europejskiego i Rady (UE) 2019/790 w sprawie prawa autorskiego i praw pokrewnych na jednolitym rynku cyfrowym.</p>
        <p className="text-zinc-600">Pełny tekst prawny licencji dostępny jest pod adresem: <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.pl" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">creativecommons.org/licenses/by-nc-sa/4.0/legalcode</a>.</p>
      </section>

      <section id="odpowiedzialnosc" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">8. Odpowiedzialność</h2>
        <p className="text-zinc-600 mb-3">Usługodawca dokłada wszelkich starań, aby Serwis działał prawidłowo i nieprzerwanie, jednak nie gwarantuje braku przerw technicznych ani błędów.</p>
        <p className="text-zinc-600 mb-3">Usługodawca nie ponosi odpowiedzialności za:</p>
        <ul className="list-disc pl-6 text-zinc-600 space-y-1.5">
          <li>treść artykułów pochodzących ze źródeł zewnętrznych,</li>
          <li>decyzje podjęte na podstawie Treści udostępnianych w Serwisie,</li>
          <li>przerwy w dostępie do Serwisu wynikające z przyczyn niezależnych od Usługodawcy,</li>
          <li>działania Użytkowników niezgodne z Regulaminem.</li>
        </ul>
      </section>

      <section id="reklamacje" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">9. Reklamacje</h2>
        <p className="text-zinc-600 mb-3">Reklamacje dotyczące funkcjonowania Serwisu można składać na adres e-mail: <strong>jakub@pollar.pl</strong>.</p>
        <p className="text-zinc-600">Reklamacja powinna zawierać opis problemu oraz dane kontaktowe Użytkownika. Usługodawca rozpatruje reklamacje w terminie 14 dni od dnia ich otrzymania.</p>
      </section>

      <section id="dane" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">10. Ochrona danych osobowych</h2>
        <p className="text-zinc-600">Zasady przetwarzania danych osobowych Użytkowników opisane są w <LocalizedLink to="/polityka-prywatnosci" className="text-red-600 hover:underline">Polityce prywatności</LocalizedLink>.</p>
      </section>

      <section id="zmiany" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">11. Zmiany Regulaminu</h2>
        <p className="text-zinc-600 mb-3">Usługodawca zastrzega sobie prawo do zmiany niniejszego Regulaminu. O zmianach Użytkownicy posiadający Konto zostaną poinformowani drogą e-mailową z odpowiednim wyprzedzeniem.</p>
        <p className="text-zinc-600 mb-3">Korzystanie z Serwisu po wejściu w życie zmian oznacza ich akceptację.</p>
        <p className="text-zinc-600 font-semibold">Ta wersja Regulaminu obowiązuje od: 6 lutego 2026</p>
      </section>

      <section className="mt-12 pt-8 border-t border-zinc-200">
        <div className="bg-zinc-50 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Polityka prywatności</h3>
            <p className="text-sm text-zinc-600">Dowiedz się, jak przetwarzamy Twoje dane osobowe.</p>
          </div>
          <LocalizedLink to="/polityka-prywatnosci" className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors shrink-0">
            Polityka prywatności
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </LocalizedLink>
        </div>
      </section>
    </>
  );
}

function TermsContentEN() {
  return (
    <>
      <section id="general" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">1. General Provisions</h2>
        <p className="text-zinc-600 mb-3">These Terms of Service govern the use of the website available at <a href="https://pollar.news" className="text-red-600 hover:underline">https://pollar.news</a> (the &ldquo;<strong>Website</strong>&rdquo;) and related mobile and TV applications (the &ldquo;<strong>Applications</strong>&rdquo;), operated by <strong>Pollar P.S.A.</strong>, seated in Kraków at ul. Piastowska 46/12, 30-067 Kraków, Poland, entered in the National Court Register maintained by the District Court for Kraków-Śródmieście, 11th Commercial Division, under KRS number 0001194489, NIP: 6772540681 (&ldquo;<strong>Pollar</strong>&rdquo;, the &ldquo;<strong>Provider</strong>&rdquo;).</p>
        <p className="text-zinc-600 mb-3">By using the Website and Applications you accept these Terms of Service.</p>
        <p className="text-zinc-600">These Terms are made available free of charge via the Website in a form that allows downloading, saving and printing.</p>
      </section>

      <section id="definitions" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">2. Definitions</h2>
        <ul className="list-disc pl-6 text-zinc-600 space-y-1.5">
          <li><strong>User</strong> — any person using the Website or Applications.</li>
          <li><strong>Account</strong> — an individual User account on the Website, created during registration.</li>
          <li><strong>Services</strong> — services provided electronically by the Provider through the Website and Applications.</li>
          <li><strong>Content</strong> — informational materials available on the Website, including aggregated and processed press articles, summaries and analyses generated using artificial intelligence.</li>
        </ul>
      </section>

      <section id="scope" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">3. Scope of Services</h2>
        <p className="text-zinc-600 mb-3">The Provider offers the following Services:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>access to aggregated news articles,</li>
          <li>AI-generated summaries and analyses,</li>
          <li>Account creation and content personalisation,</li>
          <li>access to public data (parliamentary, stock-market, statistical),</li>
          <li>newsletter delivery (subject to separate consent).</li>
        </ul>
        <p className="text-zinc-600">Services are provided free of charge unless explicitly stated otherwise.</p>
      </section>

      <section id="requirements" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">4. Requirements</h2>
        <p className="text-zinc-600 mb-3">To use the Website you need:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>a device with Internet access,</li>
          <li>a web browser supporting JavaScript and cookies,</li>
          <li>a valid email address (for Account registration).</li>
        </ul>
        <p className="text-zinc-600">Users agree to use the Website in accordance with applicable law and these Terms.</p>
      </section>

      <section id="registration" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">5. Registration and Account</h2>
        <p className="text-zinc-600 mb-3">Account registration is voluntary. Some features are available without an Account.</p>
        <p className="text-zinc-600 mb-3">To create an Account the User provides:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>a display name,</li>
          <li>an email address,</li>
          <li>a password (for email registration).</li>
        </ul>
        <p className="text-zinc-600 mb-3">Registration is also possible via a Google or Apple account.</p>
        <p className="text-zinc-600 mb-3">Users agree to provide accurate information and not to share their login credentials with third parties.</p>
        <p className="text-zinc-600">Users may delete their Account at any time from the profile settings or by contacting the Provider at <strong>jakub@pollar.pl</strong>.</p>
      </section>

      <section id="ip" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">6. Content and Intellectual Property</h2>
        <p className="text-zinc-600 mb-3">The Website aggregates and processes publicly available press articles. Pollar is not the author or publisher of the original articles — full article text is available on the publishers' websites.</p>
        <p className="text-zinc-600 mb-3">AI-generated summaries and analyses are informational only and do not constitute legal, financial or investment advice.</p>
        <p className="text-zinc-600">Graphics, layout, logos and software are the property of the Provider or are used under appropriate licences and are protected by law.</p>
      </section>

      <section id="license" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">7. Creative Commons License</h2>
        <p className="text-zinc-600 mb-3">Original content published on the Website — including summaries, analyses, daily brief articles and opinion pieces generated by the Provider — is made available under the terms of the <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.en" target="_blank" rel="license noopener noreferrer" className="text-red-600 hover:underline">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC-SA 4.0)</a>.</p>
        <p className="text-zinc-600 mb-3">The Licensor hereby grants a worldwide, royalty-free, non-sublicensable, non-exclusive, irrevocable license to exercise rights in the Content for noncommercial purposes only, including the right to:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>copy and redistribute the Content in any medium or format,</li>
          <li>remix, transform and build upon the Content to produce derivative works.</li>
        </ul>
        <p className="text-zinc-600 mb-3">Terms of use:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li><strong>Attribution</strong> — you must credit the author as &ldquo;Pollar News (pollar.news)&rdquo;, provide a link to the license, and indicate if changes were made to the material.</li>
          <li><strong>NonCommercial</strong> — the Content may not be used for commercial purposes, i.e. activities primarily intended for or directed towards commercial advantage or monetary compensation.</li>
          <li><strong>ShareAlike</strong> — if you remix, transform or build upon the Content, you must distribute your contributions under the same CC BY-NC-SA 4.0 license or a compatible license.</li>
        </ul>
        <p className="text-zinc-600 mb-3">This license does not cover the Website's graphics, logos, software or content originating from third-party press sources. Any restrictions expressed via this license constitute express reservations of rights under Article 4 of Directive (EU) 2019/790 of the European Parliament and of the Council on copyright and related rights in the Digital Single Market.</p>
        <p className="text-zinc-600">The full legal code of the license is available at: <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.en" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">creativecommons.org/licenses/by-nc-sa/4.0/legalcode</a>.</p>
      </section>

      <section id="liability" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">8. Liability</h2>
        <p className="text-zinc-600 mb-3">The Provider makes every effort to ensure the Website operates correctly and continuously, but does not guarantee the absence of technical interruptions or errors.</p>
        <p className="text-zinc-600 mb-3">The Provider is not liable for:</p>
        <ul className="list-disc pl-6 text-zinc-600 space-y-1.5">
          <li>the content of articles from external sources,</li>
          <li>decisions made based on Content provided on the Website,</li>
          <li>service interruptions due to causes beyond the Provider's control,</li>
          <li>User actions that violate these Terms.</li>
        </ul>
      </section>

      <section id="complaints" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">9. Complaints</h2>
        <p className="text-zinc-600 mb-3">Complaints regarding the Website may be submitted by email to: <strong>jakub@pollar.pl</strong>.</p>
        <p className="text-zinc-600">A complaint should include a description of the issue and the User's contact details. The Provider processes complaints within 14 days of receipt.</p>
      </section>

      <section id="data" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">10. Personal Data</h2>
        <p className="text-zinc-600">The rules for processing Users' personal data are described in the <LocalizedLink to="/polityka-prywatnosci" className="text-red-600 hover:underline">Privacy Policy</LocalizedLink>.</p>
      </section>

      <section id="changes" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">11. Changes to the Terms</h2>
        <p className="text-zinc-600 mb-3">The Provider reserves the right to amend these Terms. Account holders will be notified of changes by email in advance.</p>
        <p className="text-zinc-600 mb-3">Continued use of the Website after the changes take effect constitutes acceptance.</p>
        <p className="text-zinc-600 font-semibold">This version of the Terms is effective from: 6 February 2026</p>
      </section>

      <section className="mt-12 pt-8 border-t border-zinc-200">
        <div className="bg-zinc-50 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Privacy Policy</h3>
            <p className="text-sm text-zinc-600">Learn how we process your personal data.</p>
          </div>
          <LocalizedLink to="/polityka-prywatnosci" className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors shrink-0">
            Privacy Policy
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </LocalizedLink>
        </div>
      </section>
    </>
  );
}

function TermsContentDE() {
  return (
    <>
      <section id="allgemein" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">1. Allgemeine Bestimmungen</h2>
        <p className="text-zinc-600 mb-3">Diese Nutzungsbedingungen regeln die Nutzung der unter <a href="https://pollar.news" className="text-red-600 hover:underline">https://pollar.news</a> verfügbaren Website (die &bdquo;<strong>Website</strong>&ldquo;) sowie der zugehörigen mobilen und TV-Anwendungen (die &bdquo;<strong>Anwendungen</strong>&ldquo;), betrieben von <strong>Pollar P.S.A.</strong> mit Sitz in Kraków, ul. Piastowska 46/12, 30-067 Kraków, Polen, eingetragen im Handelsregister des Amtsgerichts Kraków-Śródmieście, 11. Wirtschaftsabteilung, unter der KRS-Nummer 0001194489, NIP: 6772540681 (&bdquo;<strong>Pollar</strong>&ldquo;, der &bdquo;<strong>Anbieter</strong>&ldquo;).</p>
        <p className="text-zinc-600 mb-3">Durch die Nutzung der Website und der Anwendungen akzeptieren Sie diese Nutzungsbedingungen.</p>
        <p className="text-zinc-600">Diese Bedingungen werden kostenlos über die Website in einer Form bereitgestellt, die das Herunterladen, Speichern und Drucken ermöglicht.</p>
      </section>

      <section id="definitionen" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">2. Definitionen</h2>
        <ul className="list-disc pl-6 text-zinc-600 space-y-1.5">
          <li><strong>Nutzer</strong> — jede Person, die die Website oder die Anwendungen nutzt.</li>
          <li><strong>Konto</strong> — ein individuelles Nutzerkonto auf der Website, das bei der Registrierung erstellt wird.</li>
          <li><strong>Dienste</strong> — elektronisch vom Anbieter über die Website und die Anwendungen erbrachte Dienste.</li>
          <li><strong>Inhalte</strong> — auf der Website verfügbare Informationsmaterialien, einschließlich aggregierter und verarbeiteter Presseartikel, Zusammenfassungen und Analysen, die mithilfe künstlicher Intelligenz erstellt werden.</li>
        </ul>
      </section>

      <section id="umfang" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">3. Umfang der Dienste</h2>
        <p className="text-zinc-600 mb-3">Der Anbieter bietet folgende Dienste an:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>Zugang zu aggregierten Nachrichtenartikeln,</li>
          <li>KI-generierte Zusammenfassungen und Analysen,</li>
          <li>Kontoerstellung und Personalisierung von Inhalten,</li>
          <li>Zugang zu öffentlichen Daten (Parlaments-, Börsen-, Statistikdaten),</li>
          <li>Newsletter-Versand (vorbehaltlich gesonderter Zustimmung).</li>
        </ul>
        <p className="text-zinc-600">Die Dienste werden kostenlos erbracht, sofern nicht ausdrücklich anders angegeben.</p>
      </section>

      <section id="voraussetzungen" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">4. Voraussetzungen</h2>
        <p className="text-zinc-600 mb-3">Zur Nutzung der Website benötigen Sie:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>ein Gerät mit Internetzugang,</li>
          <li>einen Webbrowser mit JavaScript- und Cookie-Unterstützung,</li>
          <li>eine gültige E-Mail-Adresse (für die Kontoregistrierung).</li>
        </ul>
        <p className="text-zinc-600">Die Nutzer verpflichten sich, die Website im Einklang mit geltendem Recht und diesen Bedingungen zu nutzen.</p>
      </section>

      <section id="registrierung" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">5. Registrierung und Konto</h2>
        <p className="text-zinc-600 mb-3">Die Kontoregistrierung ist freiwillig. Einige Funktionen sind ohne Konto verfügbar.</p>
        <p className="text-zinc-600 mb-3">Zur Kontoerstellung gibt der Nutzer an:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>einen Anzeigenamen,</li>
          <li>eine E-Mail-Adresse,</li>
          <li>ein Passwort (bei E-Mail-Registrierung).</li>
        </ul>
        <p className="text-zinc-600 mb-3">Die Registrierung ist auch über ein Google- oder Apple-Konto möglich.</p>
        <p className="text-zinc-600 mb-3">Die Nutzer verpflichten sich, korrekte Angaben zu machen und ihre Anmeldedaten nicht an Dritte weiterzugeben.</p>
        <p className="text-zinc-600">Nutzer können ihr Konto jederzeit in den Profileinstellungen löschen oder den Anbieter unter <strong>jakub@pollar.pl</strong> kontaktieren.</p>
      </section>

      <section id="eigentum" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">6. Inhalte und geistiges Eigentum</h2>
        <p className="text-zinc-600 mb-3">Die Website aggregiert und verarbeitet öffentlich zugängliche Presseartikel. Pollar ist nicht Autor oder Herausgeber der Originalartikel — der vollständige Artikeltext ist auf den Websites der Herausgeber verfügbar.</p>
        <p className="text-zinc-600 mb-3">KI-generierte Zusammenfassungen und Analysen dienen ausschließlich Informationszwecken und stellen keine Rechts-, Finanz- oder Anlageberatung dar.</p>
        <p className="text-zinc-600">Grafiken, Layout, Logos und Software sind Eigentum des Anbieters oder werden unter entsprechenden Lizenzen verwendet und sind gesetzlich geschützt.</p>
      </section>

      <section id="lizenz" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">7. Creative-Commons-Lizenz</h2>
        <p className="text-zinc-600 mb-3">Originale Inhalte, die auf der Website veröffentlicht werden — einschließlich Zusammenfassungen, Analysen, täglicher Briefings und Kolumnen, die vom Anbieter erstellt werden — werden unter den Bedingungen der <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.de" target="_blank" rel="license noopener noreferrer" className="text-red-600 hover:underline">Creative Commons Namensnennung – Nicht kommerziell – Weitergabe unter gleichen Bedingungen 4.0 International Lizenz (CC BY-NC-SA 4.0)</a> bereitgestellt.</p>
        <p className="text-zinc-600 mb-3">Der Lizenzgeber gewährt eine weltweite, gebührenfreie, nicht unterlizenzierbare, nicht-exklusive und unwiderrufliche Lizenz zur Nutzung der Inhalte ausschließlich zu nicht-kommerziellen Zwecken, einschließlich des Rechts:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li>die Inhalte in jedem Medium oder Format zu kopieren und weiterzuverbreiten,</li>
          <li>die Inhalte zu remixen, zu verändern und darauf aufzubauen, um abgeleitete Werke zu erstellen.</li>
        </ul>
        <p className="text-zinc-600 mb-3">Nutzungsbedingungen:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-3 space-y-1.5">
          <li><strong>Namensnennung</strong> — Sie müssen den Urheber als &bdquo;Pollar News (pollar.news)&ldquo; angeben, einen Link zur Lizenz beifügen und angeben, ob Änderungen am Material vorgenommen wurden.</li>
          <li><strong>Nicht kommerziell</strong> — die Inhalte dürfen nicht für kommerzielle Zwecke verwendet werden, d.&thinsp;h. für Tätigkeiten, die in erster Linie auf einen kommerziellen Vorteil oder eine geldwerte Vergütung abzielen.</li>
          <li><strong>Weitergabe unter gleichen Bedingungen</strong> — wenn Sie die Inhalte remixen, verändern oder darauf aufbauen, müssen Sie Ihre Beiträge unter derselben CC BY-NC-SA 4.0 Lizenz oder einer kompatiblen Lizenz verbreiten.</li>
        </ul>
        <p className="text-zinc-600 mb-3">Diese Lizenz erstreckt sich nicht auf Grafiken, Logos, Software oder Inhalte aus externen Pressequellen der Website. Sämtliche über diese Lizenz ausgedrückten Einschränkungen stellen ausdrückliche Rechtevorbehalte im Sinne von Art. 4 der Richtlinie (EU) 2019/790 des Europäischen Parlaments und des Rates über das Urheberrecht und die verwandten Schutzrechte im digitalen Binnenmarkt dar.</p>
        <p className="text-zinc-600">Der vollständige Lizenztext ist verfügbar unter: <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.de" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">creativecommons.org/licenses/by-nc-sa/4.0/legalcode</a>.</p>
      </section>

      <section id="haftung" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">8. Haftung</h2>
        <p className="text-zinc-600 mb-3">Der Anbieter bemüht sich nach besten Kräften, den ordnungsgemäßen und kontinuierlichen Betrieb der Website sicherzustellen, garantiert jedoch nicht das Ausbleiben technischer Unterbrechungen oder Fehler.</p>
        <p className="text-zinc-600 mb-3">Der Anbieter haftet nicht für:</p>
        <ul className="list-disc pl-6 text-zinc-600 space-y-1.5">
          <li>den Inhalt von Artikeln aus externen Quellen,</li>
          <li>Entscheidungen, die auf Grundlage der auf der Website bereitgestellten Inhalte getroffen werden,</li>
          <li>Dienstunterbrechungen aufgrund von Ursachen, die außerhalb der Kontrolle des Anbieters liegen,</li>
          <li>Nutzerhandlungen, die gegen diese Bedingungen verstoßen.</li>
        </ul>
      </section>

      <section id="beschwerden" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">9. Beschwerden</h2>
        <p className="text-zinc-600 mb-3">Beschwerden bezüglich der Website können per E-Mail an <strong>jakub@pollar.pl</strong> gerichtet werden.</p>
        <p className="text-zinc-600">Eine Beschwerde sollte eine Beschreibung des Problems und die Kontaktdaten des Nutzers enthalten. Der Anbieter bearbeitet Beschwerden innerhalb von 14 Tagen nach Eingang.</p>
      </section>

      <section id="daten" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">10. Personenbezogene Daten</h2>
        <p className="text-zinc-600">Die Regeln zur Verarbeitung personenbezogener Daten der Nutzer sind in der <LocalizedLink to="/polityka-prywatnosci" className="text-red-600 hover:underline">Datenschutzrichtlinie</LocalizedLink> beschrieben.</p>
      </section>

      <section id="aenderungen" className="mb-14 scroll-mt-24">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">11. Änderungen der Bedingungen</h2>
        <p className="text-zinc-600 mb-3">Der Anbieter behält sich das Recht vor, diese Bedingungen zu ändern. Kontoinhaber werden vorab per E-Mail über Änderungen informiert.</p>
        <p className="text-zinc-600 mb-3">Die weitere Nutzung der Website nach Inkrafttreten der Änderungen gilt als Zustimmung.</p>
        <p className="text-zinc-600 font-semibold">Diese Fassung der Bedingungen gilt ab: 6. Februar 2026</p>
      </section>

      <section className="mt-12 pt-8 border-t border-zinc-200">
        <div className="bg-zinc-50 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-1">Datenschutzrichtlinie</h3>
            <p className="text-sm text-zinc-600">Erfahren Sie, wie wir Ihre personenbezogenen Daten verarbeiten.</p>
          </div>
          <LocalizedLink to="/polityka-prywatnosci" className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors shrink-0">
            Datenschutzrichtlinie
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </LocalizedLink>
        </div>
      </section>
    </>
  );
}

const CONTENT_MAP: Record<string, React.ReactNode> = {
  pl: <TermsContentPL />,
  en: <TermsContentEN />,
  de: <TermsContentDE />,
};

export function TermsOfServicePage() {
  const language = useLanguage();
  const sections = SECTIONS[language] || SECTIONS.pl;
  const sectionIds = sections.map(s => s.id);
  const { activeSection, contentRef, scrollToSection } = useSectionObserver(sectionIds);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6 text-zinc-900">{TITLE[language] || TITLE.pl}</h1>
        <GrainImage
          src={termsImg}
          alt={HERO_ALT[language] || HERO_ALT.pl}
          className="w-full aspect-[21/9] object-cover rounded-2xl not-prose"
        />
      </div>

      <SidebarNav
        sections={sections}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      {/* Two-panel layout */}
      <div className="flex gap-10 lg:gap-16">
        {/* Desktop sidebar placeholder (rendered by SidebarNav above on mobile, below on desktop) */}
        <nav className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 space-y-0.5">
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`group w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-baseline gap-3 ${
                  activeSection === s.id
                    ? 'bg-zinc-900 text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <span className={`text-xs tabular-nums ${activeSection === s.id ? 'text-zinc-400' : 'text-zinc-300 group-hover:text-zinc-400'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {s.title}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div ref={contentRef} className="flex-1 min-w-0 text-[15px] leading-relaxed">
          {CONTENT_MAP[language] || CONTENT_MAP.pl}
        </div>
      </div>
    </div>
  );
}
