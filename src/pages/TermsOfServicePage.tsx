import { LocalizedLink } from '@/components/LocalizedLink';
import { GrainImage } from '../components/common/GrainImage';
import privacyImg from '../assets/images/privacy.webp';
import { useLanguage } from '@/stores/languageStore';

const COMPANY_INFO = 'Pollar P.S.A. z siedzibą w Krakowie przy ul. Piastowskiej 46/12, 30-067 Kraków, wpisaną do rejestru przedsiębiorców Krajowego Rejestru Sądowego prowadzonego przez Sąd Rejonowy dla Krakowa - Śródmieścia w Krakowie, XI Wydział Gospodarczy KRS, pod numerem KRS 0001194489, NIP: 6772540681';

function TermsOfServicePL() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-zinc-900">Regulamin serwisu POLLAR P.S.A.</h1>
      <GrainImage src={privacyImg} alt="Regulamin" className="w-full aspect-[21/9] object-cover rounded-lg mb-8 not-prose" />

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">1. Postanowienia ogólne</h2>
        <p className="text-zinc-600 mb-4">Niniejszy Regulamin określa zasady korzystania z serwisu internetowego dostępnego pod adresem <a href="https://pollar.pl" className="text-red-600 hover:underline">https://pollar.pl</a> („<strong>Serwis</strong>") oraz powiązanych aplikacji mobilnych i telewizyjnych („<strong>Aplikacje</strong>"), prowadzonych przez <strong>{COMPANY_INFO}</strong> („<strong>Pollar</strong>", „<strong>Usługodawca</strong>").</p>
        <p className="text-zinc-600 mb-4">Korzystanie z Serwisu i Aplikacji oznacza akceptację niniejszego Regulaminu.</p>
        <p className="text-zinc-600">Regulamin jest udostępniany nieodpłatnie za pośrednictwem Serwisu w formie umożliwiającej jego pobranie, utrwalenie i wydrukowanie.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">2. Definicje</h2>
        <ul className="list-disc pl-6 text-zinc-600 space-y-2">
          <li><strong>Użytkownik</strong> – każda osoba korzystająca z Serwisu lub Aplikacji.</li>
          <li><strong>Konto</strong> – indywidualne konto Użytkownika w Serwisie, utworzone w procesie rejestracji.</li>
          <li><strong>Usługi</strong> – usługi świadczone drogą elektroniczną przez Usługodawcę za pośrednictwem Serwisu i Aplikacji.</li>
          <li><strong>Treści</strong> – materiały informacyjne udostępniane w Serwisie, w tym zagregowane i przetworzone artykuły prasowe, podsumowania oraz analizy generowane z wykorzystaniem sztucznej inteligencji.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">3. Rodzaje i zakres Usług</h2>
        <p className="text-zinc-600 mb-4">Usługodawca świadczy następujące Usługi:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>udostępnianie zagregowanych wiadomości i artykułów prasowych,</li>
          <li>generowanie podsumowań i analiz z wykorzystaniem sztucznej inteligencji,</li>
          <li>umożliwienie tworzenia Konta i personalizacji treści,</li>
          <li>udostępnianie danych publicznych (dane sejmowe, giełdowe, statystyczne),</li>
          <li>wysyłka newslettera (po wyrażeniu odrębnej zgody).</li>
        </ul>
        <p className="text-zinc-600">Usługi są świadczone nieodpłatnie, chyba że wyraźnie wskazano inaczej.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">4. Warunki korzystania z Serwisu</h2>
        <p className="text-zinc-600 mb-4">Do korzystania z Serwisu niezbędne jest:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>urządzenie z dostępem do sieci Internet,</li>
          <li>przeglądarka internetowa obsługująca JavaScript i pliki cookies,</li>
          <li>aktywny adres e-mail (w przypadku rejestracji Konta).</li>
        </ul>
        <p className="text-zinc-600">Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z obowiązującym prawem, niniejszym Regulaminem oraz zasadami współżycia społecznego.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">5. Rejestracja i Konto</h2>
        <p className="text-zinc-600 mb-4">Rejestracja Konta jest dobrowolna. Część funkcjonalności Serwisu dostępna jest bez rejestracji.</p>
        <p className="text-zinc-600 mb-4">Aby utworzyć Konto, Użytkownik podaje:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>imię (nazwę wyświetlaną),</li>
          <li>adres e-mail,</li>
          <li>hasło (w przypadku rejestracji przez e-mail).</li>
        </ul>
        <p className="text-zinc-600 mb-4">Rejestracja możliwa jest również za pośrednictwem konta Google lub Apple.</p>
        <p className="text-zinc-600 mb-4">Użytkownik zobowiązuje się do podania prawdziwych danych oraz do nieudostępniania danych logowania osobom trzecim.</p>
        <p className="text-zinc-600">Użytkownik może w każdym momencie usunąć swoje Konto w ustawieniach profilu lub kontaktując się z Usługodawcą pod adresem <strong>jakub@pollar.pl</strong>.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">6. Treści i własność intelektualna</h2>
        <p className="text-zinc-600 mb-4">Serwis agreguje i przetwarza publicznie dostępne artykuły prasowe. Pollar nie jest autorem ani wydawcą oryginalnych artykułów — pełna treść artykułów dostępna jest na stronach ich wydawców.</p>
        <p className="text-zinc-600 mb-4">Podsumowania i analizy generowane przez sztuczną inteligencję mają charakter informacyjny i nie stanowią porad prawnych, finansowych ani inwestycyjnych.</p>
        <p className="text-zinc-600">Elementy graficzne Serwisu, układ treści, logotypy oraz oprogramowanie stanowią własność Usługodawcy lub są wykorzystywane na podstawie odpowiednich licencji i podlegają ochronie prawnej.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">7. Odpowiedzialność</h2>
        <p className="text-zinc-600 mb-4">Usługodawca dokłada wszelkich starań, aby Serwis działał prawidłowo i nieprzerwanie, jednak nie gwarantuje braku przerw technicznych ani błędów.</p>
        <p className="text-zinc-600 mb-4">Usługodawca nie ponosi odpowiedzialności za:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>treść artykułów pochodzących ze źródeł zewnętrznych,</li>
          <li>decyzje podjęte na podstawie Treści udostępnianych w Serwisie,</li>
          <li>przerwy w dostępie do Serwisu wynikające z przyczyn niezależnych od Usługodawcy,</li>
          <li>działania Użytkowników niezgodne z Regulaminem.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">8. Reklamacje</h2>
        <p className="text-zinc-600 mb-4">Reklamacje dotyczące funkcjonowania Serwisu można składać na adres e-mail: <strong>jakub@pollar.pl</strong>.</p>
        <p className="text-zinc-600">Reklamacja powinna zawierać opis problemu oraz dane kontaktowe Użytkownika. Usługodawca rozpatruje reklamacje w terminie 14 dni od dnia ich otrzymania.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">9. Ochrona danych osobowych</h2>
        <p className="text-zinc-600 mb-4">Zasady przetwarzania danych osobowych Użytkowników opisane są w <LocalizedLink to="/polityka-prywatnosci" className="text-red-600 hover:underline">Polityce prywatności</LocalizedLink>.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">10. Zmiany Regulaminu</h2>
        <p className="text-zinc-600 mb-4">Usługodawca zastrzega sobie prawo do zmiany niniejszego Regulaminu. O zmianach Użytkownicy posiadający Konto zostaną poinformowani drogą e-mailową z odpowiednim wyprzedzeniem.</p>
        <p className="text-zinc-600 mb-4">Korzystanie z Serwisu po wejściu w życie zmian oznacza ich akceptację.</p>
        <p className="text-zinc-600 font-semibold">Ta wersja Regulaminu obowiązuje od: 6 lutego 2026</p>
      </section>

      <section className="mt-12 pt-8 border-t border-zinc-200">
        <div className="bg-zinc-50 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

function TermsOfServiceEN() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-zinc-900">Terms of Service — POLLAR P.S.A.</h1>
      <GrainImage src={privacyImg} alt="Terms of Service" className="w-full aspect-[21/9] object-cover rounded-lg mb-8 not-prose" />

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">1. General Provisions</h2>
        <p className="text-zinc-600 mb-4">These Terms of Service govern the use of the website available at <a href="https://pollar.pl" className="text-red-600 hover:underline">https://pollar.pl</a> (the "<strong>Website</strong>") and related mobile and TV applications (the "<strong>Applications</strong>"), operated by <strong>Pollar P.S.A.</strong>, seated in Kraków at ul. Piastowska 46/12, 30-067 Kraków, Poland, entered in the National Court Register maintained by the District Court for Kraków-Śródmieście, 11th Commercial Division, under KRS number 0001194489, NIP: 6772540681 ("<strong>Pollar</strong>", the "<strong>Provider</strong>").</p>
        <p className="text-zinc-600 mb-4">By using the Website and Applications you accept these Terms of Service.</p>
        <p className="text-zinc-600">These Terms are made available free of charge via the Website in a form that allows downloading, saving and printing.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">2. Definitions</h2>
        <ul className="list-disc pl-6 text-zinc-600 space-y-2">
          <li><strong>User</strong> — any person using the Website or Applications.</li>
          <li><strong>Account</strong> — an individual User account on the Website, created during registration.</li>
          <li><strong>Services</strong> — services provided electronically by the Provider through the Website and Applications.</li>
          <li><strong>Content</strong> — informational materials available on the Website, including aggregated and processed press articles, summaries and analyses generated using artificial intelligence.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">3. Scope of Services</h2>
        <p className="text-zinc-600 mb-4">The Provider offers the following Services:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>access to aggregated news articles,</li>
          <li>AI-generated summaries and analyses,</li>
          <li>Account creation and content personalisation,</li>
          <li>access to public data (parliamentary, stock-market, statistical),</li>
          <li>newsletter delivery (subject to separate consent).</li>
        </ul>
        <p className="text-zinc-600">Services are provided free of charge unless explicitly stated otherwise.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">4. Requirements</h2>
        <p className="text-zinc-600 mb-4">To use the Website you need:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>a device with Internet access,</li>
          <li>a web browser supporting JavaScript and cookies,</li>
          <li>a valid email address (for Account registration).</li>
        </ul>
        <p className="text-zinc-600">Users agree to use the Website in accordance with applicable law and these Terms.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">5. Registration and Account</h2>
        <p className="text-zinc-600 mb-4">Account registration is voluntary. Some features are available without an Account.</p>
        <p className="text-zinc-600 mb-4">To create an Account the User provides:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>a display name,</li>
          <li>an email address,</li>
          <li>a password (for email registration).</li>
        </ul>
        <p className="text-zinc-600 mb-4">Registration is also possible via a Google or Apple account.</p>
        <p className="text-zinc-600 mb-4">Users agree to provide accurate information and not to share their login credentials with third parties.</p>
        <p className="text-zinc-600">Users may delete their Account at any time from the profile settings or by contacting the Provider at <strong>jakub@pollar.pl</strong>.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">6. Content and Intellectual Property</h2>
        <p className="text-zinc-600 mb-4">The Website aggregates and processes publicly available press articles. Pollar is not the author or publisher of the original articles — full article text is available on the publishers' websites.</p>
        <p className="text-zinc-600 mb-4">AI-generated summaries and analyses are informational only and do not constitute legal, financial or investment advice.</p>
        <p className="text-zinc-600">Graphics, layout, logos and software are the property of the Provider or are used under appropriate licences and are protected by law.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">7. Liability</h2>
        <p className="text-zinc-600 mb-4">The Provider makes every effort to ensure the Website operates correctly and continuously, but does not guarantee the absence of technical interruptions or errors.</p>
        <p className="text-zinc-600 mb-4">The Provider is not liable for:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>the content of articles from external sources,</li>
          <li>decisions made based on Content provided on the Website,</li>
          <li>service interruptions due to causes beyond the Provider's control,</li>
          <li>User actions that violate these Terms.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">8. Complaints</h2>
        <p className="text-zinc-600 mb-4">Complaints regarding the Website may be submitted by email to: <strong>jakub@pollar.pl</strong>.</p>
        <p className="text-zinc-600">A complaint should include a description of the issue and the User's contact details. The Provider processes complaints within 14 days of receipt.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">9. Personal Data</h2>
        <p className="text-zinc-600 mb-4">The rules for processing Users' personal data are described in the <LocalizedLink to="/polityka-prywatnosci" className="text-red-600 hover:underline">Privacy Policy</LocalizedLink>.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">10. Changes to the Terms</h2>
        <p className="text-zinc-600 mb-4">The Provider reserves the right to amend these Terms. Account holders will be notified of changes by email in advance.</p>
        <p className="text-zinc-600 mb-4">Continued use of the Website after the changes take effect constitutes acceptance.</p>
        <p className="text-zinc-600 font-semibold">This version of the Terms is effective from: 6 February 2026</p>
      </section>

      <section className="mt-12 pt-8 border-t border-zinc-200">
        <div className="bg-zinc-50 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

function TermsOfServiceDE() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-zinc-900">Nutzungsbedingungen — POLLAR P.S.A.</h1>
      <GrainImage src={privacyImg} alt="Nutzungsbedingungen" className="w-full aspect-[21/9] object-cover rounded-lg mb-8 not-prose" />

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">1. Allgemeine Bestimmungen</h2>
        <p className="text-zinc-600 mb-4">Diese Nutzungsbedingungen regeln die Nutzung der unter <a href="https://pollar.pl" className="text-red-600 hover:underline">https://pollar.pl</a> verfügbaren Website (die „<strong>Website</strong>") sowie der zugehörigen mobilen und TV-Anwendungen (die „<strong>Anwendungen</strong>"), betrieben von <strong>Pollar P.S.A.</strong> mit Sitz in Kraków, ul. Piastowska 46/12, 30-067 Kraków, Polen, eingetragen im Handelsregister des Amtsgerichts Kraków-Śródmieście, 11. Wirtschaftsabteilung, unter der KRS-Nummer 0001194489, NIP: 6772540681 („<strong>Pollar</strong>", der „<strong>Anbieter</strong>").</p>
        <p className="text-zinc-600 mb-4">Durch die Nutzung der Website und der Anwendungen akzeptieren Sie diese Nutzungsbedingungen.</p>
        <p className="text-zinc-600">Diese Bedingungen werden kostenlos über die Website in einer Form bereitgestellt, die das Herunterladen, Speichern und Drucken ermöglicht.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">2. Definitionen</h2>
        <ul className="list-disc pl-6 text-zinc-600 space-y-2">
          <li><strong>Nutzer</strong> — jede Person, die die Website oder die Anwendungen nutzt.</li>
          <li><strong>Konto</strong> — ein individuelles Nutzerkonto auf der Website, das bei der Registrierung erstellt wird.</li>
          <li><strong>Dienste</strong> — elektronisch vom Anbieter über die Website und die Anwendungen erbrachte Dienste.</li>
          <li><strong>Inhalte</strong> — auf der Website verfügbare Informationsmaterialien, einschließlich aggregierter und verarbeiteter Presseartikel, Zusammenfassungen und Analysen, die mithilfe künstlicher Intelligenz erstellt werden.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">3. Umfang der Dienste</h2>
        <p className="text-zinc-600 mb-4">Der Anbieter bietet folgende Dienste an:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>Zugang zu aggregierten Nachrichtenartikeln,</li>
          <li>KI-generierte Zusammenfassungen und Analysen,</li>
          <li>Kontoerstellung und Personalisierung von Inhalten,</li>
          <li>Zugang zu öffentlichen Daten (Parlaments-, Börsen-, Statistikdaten),</li>
          <li>Newsletter-Versand (vorbehaltlich gesonderter Zustimmung).</li>
        </ul>
        <p className="text-zinc-600">Die Dienste werden kostenlos erbracht, sofern nicht ausdrücklich anders angegeben.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">4. Voraussetzungen</h2>
        <p className="text-zinc-600 mb-4">Zur Nutzung der Website benötigen Sie:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>ein Gerät mit Internetzugang,</li>
          <li>einen Webbrowser mit JavaScript- und Cookie-Unterstützung,</li>
          <li>eine gültige E-Mail-Adresse (für die Kontoregistrierung).</li>
        </ul>
        <p className="text-zinc-600">Die Nutzer verpflichten sich, die Website im Einklang mit geltendem Recht und diesen Bedingungen zu nutzen.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">5. Registrierung und Konto</h2>
        <p className="text-zinc-600 mb-4">Die Kontoregistrierung ist freiwillig. Einige Funktionen sind ohne Konto verfügbar.</p>
        <p className="text-zinc-600 mb-4">Zur Kontoerstellung gibt der Nutzer an:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>einen Anzeigenamen,</li>
          <li>eine E-Mail-Adresse,</li>
          <li>ein Passwort (bei E-Mail-Registrierung).</li>
        </ul>
        <p className="text-zinc-600 mb-4">Die Registrierung ist auch über ein Google- oder Apple-Konto möglich.</p>
        <p className="text-zinc-600 mb-4">Die Nutzer verpflichten sich, korrekte Angaben zu machen und ihre Anmeldedaten nicht an Dritte weiterzugeben.</p>
        <p className="text-zinc-600">Nutzer können ihr Konto jederzeit in den Profileinstellungen löschen oder den Anbieter unter <strong>jakub@pollar.pl</strong> kontaktieren.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">6. Inhalte und geistiges Eigentum</h2>
        <p className="text-zinc-600 mb-4">Die Website aggregiert und verarbeitet öffentlich zugängliche Presseartikel. Pollar ist nicht Autor oder Herausgeber der Originalartikel — der vollständige Artikeltext ist auf den Websites der Herausgeber verfügbar.</p>
        <p className="text-zinc-600 mb-4">KI-generierte Zusammenfassungen und Analysen dienen ausschließlich Informationszwecken und stellen keine Rechts-, Finanz- oder Anlageberatung dar.</p>
        <p className="text-zinc-600">Grafiken, Layout, Logos und Software sind Eigentum des Anbieters oder werden unter entsprechenden Lizenzen verwendet und sind gesetzlich geschützt.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">7. Haftung</h2>
        <p className="text-zinc-600 mb-4">Der Anbieter bemüht sich nach besten Kräften, den ordnungsgemäßen und kontinuierlichen Betrieb der Website sicherzustellen, garantiert jedoch nicht das Ausbleiben technischer Unterbrechungen oder Fehler.</p>
        <p className="text-zinc-600 mb-4">Der Anbieter haftet nicht für:</p>
        <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
          <li>den Inhalt von Artikeln aus externen Quellen,</li>
          <li>Entscheidungen, die auf Grundlage der auf der Website bereitgestellten Inhalte getroffen werden,</li>
          <li>Dienstunterbrechungen aufgrund von Ursachen, die außerhalb der Kontrolle des Anbieters liegen,</li>
          <li>Nutzerhandlungen, die gegen diese Bedingungen verstoßen.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">8. Beschwerden</h2>
        <p className="text-zinc-600 mb-4">Beschwerden bezüglich der Website können per E-Mail an <strong>jakub@pollar.pl</strong> gerichtet werden.</p>
        <p className="text-zinc-600">Eine Beschwerde sollte eine Beschreibung des Problems und die Kontaktdaten des Nutzers enthalten. Der Anbieter bearbeitet Beschwerden innerhalb von 14 Tagen nach Eingang.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">9. Personenbezogene Daten</h2>
        <p className="text-zinc-600 mb-4">Die Regeln zur Verarbeitung personenbezogener Daten der Nutzer sind in der <LocalizedLink to="/polityka-prywatnosci" className="text-red-600 hover:underline">Datenschutzrichtlinie</LocalizedLink> beschrieben.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900">10. Änderungen der Bedingungen</h2>
        <p className="text-zinc-600 mb-4">Der Anbieter behält sich das Recht vor, diese Bedingungen zu ändern. Kontoinhaber werden vorab per E-Mail über Änderungen informiert.</p>
        <p className="text-zinc-600 mb-4">Die weitere Nutzung der Website nach Inkrafttreten der Änderungen gilt als Zustimmung.</p>
        <p className="text-zinc-600 font-semibold">Diese Fassung der Bedingungen gilt ab: 6. Februar 2026</p>
      </section>

      <section className="mt-12 pt-8 border-t border-zinc-200">
        <div className="bg-zinc-50 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

export function TermsOfServicePage() {
  const language = useLanguage();

  const content = {
    pl: <TermsOfServicePL />,
    en: <TermsOfServiceEN />,
    de: <TermsOfServiceDE />,
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <article className="prose prose-zinc max-w-none">
        {content[language] || content.pl}
      </article>
    </div>
  );
}
