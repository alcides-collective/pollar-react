import { LocalizedLink } from '@/components/LocalizedLink';
import { GrainImage } from '../components/common/GrainImage';
import privacyImg from '../assets/images/privacy.webp';

export function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <article className="prose prose-zinc max-w-none">
        <h1 className="text-3xl font-bold mb-6 text-zinc-900">Regulamin serwisu POLLAR P.S.A.</h1>
        <GrainImage
          src={privacyImg}
          alt="Regulamin"
          className="w-full aspect-[21/9] object-cover rounded-lg mb-8 not-prose"
        />

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">1. Postanowienia ogólne</h2>
          <p className="text-zinc-600 mb-4">Niniejszy Regulamin określa zasady korzystania z serwisu internetowego dostępnego pod adresem <a href="https://pollar.pl" className="text-red-600 hover:underline">https://pollar.pl</a> („<strong>Serwis</strong>") oraz powiązanych aplikacji mobilnych i telewizyjnych („<strong>Aplikacje</strong>"), prowadzonych przez <strong>Pollar P.S.A.</strong> z siedzibą w Krakowie przy ul. Piastowskiej 46/12, 30-067 Kraków, wpisaną do rejestru przedsiębiorców Krajowego Rejestru Sądowego prowadzonego przez Sąd Rejonowy dla Krakowa - Śródmieścia w Krakowie, XI Wydział Gospodarczy KRS, pod numerem KRS 0001194489, NIP: 6772540681 („<strong>Pollar</strong>", „<strong>Usługodawca</strong>").</p>
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
            <LocalizedLink
              to="/polityka-prywatnosci"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
            >
              Polityka prywatności
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </LocalizedLink>
          </div>
        </section>
      </article>
    </div>
  );
}
