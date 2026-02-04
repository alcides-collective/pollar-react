import { LocalizedLink } from '@/components/LocalizedLink';
import { GrainImage } from '../components/common/GrainImage';
import privacyImg from '../assets/images/privacy.webp';

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <article className="prose prose-zinc max-w-none">
        <h1 className="text-3xl font-bold mb-6 text-zinc-900">Polityka prywatności POLLAR P.S.A.</h1>
        <GrainImage
          src={privacyImg}
          alt="Polityka prywatności"
          className="w-full aspect-[21/9] object-cover rounded-lg mb-8 not-prose"
        />
        <p className="text-zinc-600 mb-4">W Pollar szanujemy Twoją prywatność. Chcemy, abyś wiedział, w jaki sposób gromadzimy Twoje dane, dlaczego są nam potrzebne i jakie prawa Ci przysługują. Ta Polityka wyjaśnia, jak korzystamy z Twoich danych i jak możesz sprawować nad nimi kontrolę.</p>
        <p className="text-zinc-600 mb-4">Ta Polityka opisuje zasady przetwarzania danych na naszej stronie internetowej <a href="https://pollar.pl" className="text-red-600 hover:underline">https://pollar.pl</a> („<strong>Strona Internetowa</strong>") oraz aplikacji web, mobilnych i TV („<strong>Aplikacje</strong>").</p>
        <p className="text-zinc-600 mb-4">Dokument został przygotowany w języku polskim z myślą o użytkownikach w Polsce.</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">1. Kim jesteśmy?</h2>
          <p className="text-zinc-600 mb-4">Administratorem Twoich danych osobowych jest <strong>Pollar P.S.A.</strong> z siedzibą w Krakowie przy ul. Piastowskiej 46/12, 30-067 Kraków, zarejestrowaną w rejestrze przedsiębiorców Krajowego Rejestru Sądowego prowadzonym przez Sąd Rejonowy dla Krakowa - Śródmieścia w Krakowie, XI Wydział Gospodarczy KRS, pod numerem KRS 00011944689, o numerze NIP: 6772540681 („<strong>Pollar</strong>", „<strong>my</strong>", „<strong>nas</strong>").</p>
          <p className="text-zinc-600 mb-4">Jesteśmy twórcami Pollar – agregatora wiadomości, który wykorzystuje sztuczną inteligencję do grupowania i podsumowywania artykułów prasowych. W związku z tym przetwarzamy dane osób, które:</p>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li>odwiedzają naszą Stronę Internetową,</li>
            <li>korzystają z naszych Aplikacji,</li>
            <li>zapisały się do naszego newslettera lub są na liście oczekujących (waitlist),</li>
            <li>odwiedzają nasze profile w mediach społecznościowych (np. Instagram).</li>
          </ul>
          <p className="text-zinc-600">W sprawach dotyczących przetwarzania danych osobowych możesz się z nami skontaktować pod adresem e-mail: <strong>jakub@pollar.pl</strong>, z dopiskiem „<strong>RODO</strong>".</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">2. Skąd otrzymujemy Twoje dane?</h2>
          <p className="text-zinc-600 mb-4">Co do zasady dane, które przetwarzamy, przekazujesz nam <strong>bezpośrednio</strong>. Dzieje się to wtedy, gdy:</p>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li><strong>odwiedzasz naszą Stronę Internetową</strong> – wówczas zapisują się pliki cookies lub logi serwera,</li>
            <li><strong>korzystasz z naszych Aplikacji</strong> – przekazujesz nam swoje dane podczas zakładania konta, aby móc korzystać z pełni funkcjonalności serwisu na konkretnym urządzeniu mobilnym lub telewizorze,</li>
            <li><strong>zapisujesz się do naszego newslettera lub na listę oczekujących</strong> – podajesz nam adres e-mail, abyśmy mogli wysyłać Ci informacje marketingowe, także w zakresie informacji o starcie naszych usług oraz ich aktualizacjach,</li>
            <li><strong>odwiedzasz nasze profile w mediach społecznościowych</strong> – zostawiasz ślad w postaci komentarza, polubienia lub wiadomości, które są widoczne dla nas i dla operatora danej platformy.</li>
          </ul>
          <p className="text-zinc-600 mb-4">Dane, które otrzymujemy <strong>pośrednio</strong>, to dane, które otrzymujemy w sytuacji, gdy:</p>
          <ul className="list-disc pl-6 text-zinc-600">
            <li><strong>jesteś twórcą artykułów, które analizujemy w ramach naszych usług</strong> – dane takie jak Twoje imię i nazwisko oraz treść artykułu pozyskujemy w sposób zautomatyzowany z publicznie dostępnych stron internetowych serwisów informacyjnych, które agregujemy.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">3. Cele i podstawy przetwarzania Twoich danych osobowych</h2>
          <p className="text-zinc-600 mb-4">W zależności od tego, w jaki sposób korzystasz z naszej Strony Internetowej i Aplikacji, możemy przetwarzać Twoje dane w różnych celach. Poniżej znajdziesz najważniejsze z nich:</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Odwiedzasz naszą Stronę Internetową:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li>żeby świadczyć Ci usługę, polegającą na dostępie do zagregowanych wiadomości,</li>
            <li>żeby zapewnić jej poprawne działanie i bezpieczeństwo (art. 6 ust. 1 lit. f RODO),</li>
            <li>żeby analizować statystyki odwiedzin i ulepszać treści (art. 6 ust. 1 lit. f RODO).</li>
          </ul>
          <p className="text-zinc-500 italic mb-4">Dzięki tym danym strona działa płynnie i możemy ją rozwijać zgodnie z Twoimi potrzebami.</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Korzystasz z naszych Aplikacji:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li>żeby świadczyć Ci usługę, czyli umożliwić założenie konta i korzystanie z funkcjonalności aplikacji (art. 6 ust. 1 lit. b RODO),</li>
            <li>żeby zapewniać bezpieczeństwo usługi i chronić ją przed nadużyciami (art. 6 ust. 1 lit. f RODO),</li>
            <li>żeby analizować, jak korzystasz z aplikacji, w celu jej ulepszania i rozwoju (art. 6 ust. 1 lit. f RODO),</li>
            <li>w razie ewentualnego sporu, w celu obrony lub dochodzenia roszczeń (art. 6 ust. 1 lit. f RODO).</li>
          </ul>
          <p className="text-zinc-500 italic mb-4">Bez tych danych nie moglibyśmy zapewnić Ci dostępu do konta ani zagwarantować bezpieczeństwa naszej usługi.</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Zapisujesz się do naszego newslettera lub na listę oczekujących:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li>żeby wysyłać Ci informacje marketingowe i ofertowe, a także informować Cię o starcie naszych usług i ich ważnych aktualizacjach (art. 6 ust. 1 lit. a RODO w zw. z przepisami ustawy – Prawo komunikacji elektronicznej i ustawy o świadczeniu usług drogą elektroniczną).</li>
          </ul>
          <p className="text-zinc-500 italic mb-4">Dzięki temu będziesz na bieżąco z nowościami w Pollar.</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Odwiedzasz nasze profile w mediach społecznościowych:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li>żeby prowadzić rozmowy, odpowiadać na komentarze i wiadomości (art. 6 ust. 1 lit. f RODO),</li>
            <li>żeby prezentować naszą ofertę i budować markę (art. 6 ust. 1 lit. f RODO).</li>
          </ul>
          <p className="text-zinc-500 italic mb-4">Dane te wykorzystujemy, by móc odpowiedzieć Ci na komentarze lub wiadomości.</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Jesteś twórcą artykułów, które analizujemy w ramach naszych usług:</h3>
          <ul className="list-disc pl-6 text-zinc-600 space-y-2">
            <li>żeby przetwarzać i agregować publicznie dostępne treści informacyjne, co jest podstawą działania naszej usługi (art. 6 ust. 1 lit. f RODO),</li>
            <li>żeby wskazać Cię jako autora przytaczanego fragmentu artykułu, realizując cele informacyjne i szanując prawo autorskie (art. 6 ust. 1 lit. f RODO).</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">4. Jakie dane przetwarzamy?</h2>
          <p className="text-zinc-600 mb-4">Zakres danych, które od Ciebie zbieramy, zależy od tego, w jaki sposób korzystasz z naszej Strony Internetowej i usług:</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Jeśli odwiedzasz naszą Stronę Internetową:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4">
            <li>dane techniczne, takie jak zanonimizowany adres IP, informacje o urządzeniu i przeglądarce oraz logi serwera.</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Jeśli korzystasz z naszych Aplikacji:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li><strong>w przypadku posiadania konta:</strong> adres e-mail oraz zahaszowane hasło (zabezpieczone algorytmem);</li>
            <li><strong>w każdym przypadku:</strong> dane techniczne i eksploatacyjne w postaci tokenów sesji służących do uwierzytelniania, a także zanonimizowane i zagregowane metryki użytkowania.</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Jeśli zapisujesz się do naszego newslettera lub na listę oczekujących:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4">
            <li>adres e-mail.</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Jeśli odwiedzasz nasze profile w mediach społecznościowych:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4">
            <li>dane widoczne publicznie w ramach Twojej aktywności (np. imię i nazwisko lub nick, komentarze, polubienia, treści wiadomości, zdjęcie profilowe).</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Jeśli jesteś twórcą artykułów, które analizujemy w ramach naszych usług:</h3>
          <ul className="list-disc pl-6 text-zinc-600">
            <li>Twoje imię i nazwisko, jeśli zostały podane w publicznie dostępnym artykule, a także jego treść.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">5. Jak długo przechowujemy Twoje dane?</h2>
          <p className="text-zinc-600 mb-4">Przechowujemy Twoje dane tylko tak długo, jak to naprawdę potrzebne – zgodnie z celem ich przetwarzania i przepisami prawa. W przypadku, gdy:</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Odwiedzasz naszą Stronę Internetową:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li>Twój adres IP przechowujemy maksymalnie 7 dni w logach serwera,</li>
            <li>pliki cookies – zgodnie z informacją podaną w banerze cookies i ustawieniami Twojej przeglądarki.</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Korzystasz z naszych Aplikacji:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li>dane Twojego konta przechowujemy przez cały okres jego posiadania. Zostaną usunięte, gdy zdecydujesz się zamknąć konto,</li>
            <li>logi aplikacji, służące do diagnostyki i zapewnienia bezpieczeństwa, przechowujemy do 7 dni,</li>
            <li>zagregowane dane analityczne (metryki), które pomagają nam polepszać nasze usługi, przechowujemy do 90 dni.</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Zapisujesz się do naszego newslettera lub na listę oczekujących:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4">
            <li>dane przechowujemy do momentu, w którym wypiszesz się z listy mailingowej (wycofując zgodę).</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Odwiedzasz nasze profile w mediach społecznościowych:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li>dane przechowujemy tak długo, jak obserwujesz nasze profile lub wchodzisz w interakcje (komentarze, wiadomości),</li>
            <li>Twoje reakcje (np. polubienia) mogą być widoczne dłużej – chyba że je usuniesz. Dane te wykorzystujemy, by móc odpowiedzieć Ci na komentarze lub wiadomości.</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Jesteś twórcą artykułów, które analizujemy w ramach naszych usług:</h3>
          <ul className="list-disc pl-6 text-zinc-600">
            <li>dane pozyskane z treści artykułów (w tym Twoje imię i nazwisko) przechowujemy w naszej bazie przez 72 godziny od momentu ich pobrania, po czym są one automatycznie usuwane.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">6. Komu możemy ujawnić dane osobowe?</h2>
          <p className="text-zinc-600 mb-4">Twoje dane możemy przekazywać zaufanym partnerom i dostawcom, którzy pomagają nam świadczyć nasze usługi. W zależności od tego, jak korzystasz z usług Pollar, Twoje dane mogą trafić do następujących kategorii odbiorców:</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Odwiedzasz naszą Stronę Internetową lub korzystasz z Aplikacji:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4">
            <li>dostawcy usług hostingowych i infrastruktury chmurowej, którzy zapewniają działanie naszych serwerów i baz danych (np. Railway Corp, Google Firebase).</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Zapisujesz się do naszego newslettera lub na listę oczekujących:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4">
            <li>dostawcy systemów do obsługi masowej korespondencji e-mail, którzy pomagają nam wysyłać wiadomości.</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Odwiedzasz nasze profile w mediach społecznościowych:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4">
            <li>Twoje dane są widoczne dla operatorów tych platform i przetwarzane zgodnie z ich regulaminami i politykami prywatności.</li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Jesteś twórcą artykułów, które analizujemy:</h3>
          <ul className="list-disc pl-6 text-zinc-600 mb-4">
            <li>dane zawarte w publicznie dostępnych artykułach (w tym Twoje imię i nazwisko) przekazujemy do naszych partnerów technologicznych – dostawców modeli sztucznej inteligencji (takich jak OpenAI, OpenRouter, Google Gemini), którzy wykonują dla nas operacje podsumowywania i kategoryzacji treści.</li>
          </ul>
          <p className="text-zinc-600 mb-4"><strong>Nigdy nie przekazujemy danych osobowych naszych zarejestrowanych użytkowników (takich jak adres e-mail) do dostawców modeli AI.</strong></p>
          <p className="text-zinc-600">Twoje dane mogą być przekazywane poza Europejski Obszar Gospodarczy (EOG), ponieważ niektórzy z naszych dostawców (np. Google, OpenAI, Railway Corp) mają siedzibę w Stanach Zjednoczonych. W takich sytuacjach zawsze stosujemy zabezpieczenia wymagane przez RODO, w szczególności standardowe klauzule umowne zatwierdzone przez Komisję Europejską (art. 46 ust. 2 lit. c RODO), aby zapewnić Twoim danym odpowiedni poziom ochrony.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">7. Jakie przysługują Ci prawa w związku z przetwarzaniem danych?</h2>
          <p className="text-zinc-600 mb-4">Masz pełną kontrolę nad swoimi danymi. Zgodnie z RODO możesz:</p>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-2">
            <li><strong>dostęp do danych</strong> – poprosić nas o informację, czy przetwarzamy Twoje dane i otrzymać ich kopię,</li>
            <li><strong>sprostowanie danych</strong> – poprawić dane, jeśli są nieaktualne lub nieprawidłowe,</li>
            <li><strong>usunięcie danych</strong> („prawo do bycia zapomnianym") – zażądać usunięcia swoich danych, jeśli nie musimy ich już przetwarzać,</li>
            <li><strong>ograniczenie przetwarzania</strong> – wstrzymać czasowo korzystanie z Twoich danych, np. gdy sprawdzamy ich poprawność,</li>
            <li><strong>przenoszenie danych</strong> – otrzymać dane w ustrukturyzowanym formacie i przekazać je innemu administratorowi (w przypadku, gdy Twoje dane są przetwarzane na podstawie Twojej zgody),</li>
            <li><strong>sprzeciw</strong> – sprzeciwić się przetwarzaniu Twoich danych w przypadku danych przetwarzanych w oparciu o nasz uzasadniony interes,</li>
            <li><strong>cofnięcie zgody</strong> – w dowolnym momencie wycofać zgodę, jeśli na niej opieramy przetwarzanie (np. newsletter, konkursy). Wycofanie zgody nie wpływa na zgodność wcześniejszego przetwarzania,</li>
            <li><strong>skarga do organu nadzorczego</strong> – jeżeli uważasz, że naruszamy zasady ochrony danych, możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych w Warszawie.</li>
          </ul>
          <p className="text-zinc-600">Aby skorzystać ze swoich praw, możesz skontaktować się z nami pod adresem <strong>jakub@pollar.pl</strong>, z dopiskiem „<strong>RODO</strong>".</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">8. Narzędzia analityczne i marketingowe</h2>
          <p className="text-zinc-600 mb-4">Na naszej Stronie Internetowej oraz w ramach naszych profili w mediach społecznościowych możemy korzystać z narzędzi analitycznych i reklamowych, które pomagają nam lepiej rozumieć potrzeby użytkowników i skuteczniej prowadzić działania marketingowe. Poniżej znajdziesz podstawowe informacje o tych rozwiązaniach. Szczegóły zawsze są dostępne w politykach prywatności dostawców poszczególnych narzędzi.</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Statystyki stron Facebook i Instagram</h3>
          <p className="text-zinc-600 mb-4">Meta udostępnia nam zagregowane dane statystyczne dotyczące odwiedzin naszych profili. Dzięki temu możemy zobaczyć, jak użytkownicy wchodzą w interakcje z naszymi treściami. W tym zakresie działamy jako współadministrator danych razem z Meta Ireland Limited.</p>
          <ul className="list-disc pl-6 text-zinc-600 mb-4 space-y-1">
            <li><a href="https://pl-pl.facebook.com/privacy/explanation" className="text-red-600 hover:underline">Zasady dotyczące danych (Facebook)</a></li>
            <li><a href="https://pl-pl.facebook.com/help/instagram/519522125107875" className="text-red-600 hover:underline">Zasady dotyczące danych (Instagram)</a></li>
          </ul>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Google Analytics</h3>
          <p className="text-zinc-600 mb-4">Korzystamy z Google Analytics, aby badać, w jaki sposób użytkownicy korzystają ze Strony Internetowej. Narzędzie to zbiera informacje przy pomocy plików cookies i pozwala nam analizować ruch oraz ulepszać treści. Dane przetwarzane przez Google nie służą do identyfikacji konkretnych osób. <a href="https://policies.google.com/technologies/partner-sites?hl=pl" className="text-red-600 hover:underline">Więcej informacji</a>.</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Google Ads</h3>
          <p className="text-zinc-600 mb-4">Google Ads pozwala nam mierzyć skuteczność naszych kampanii reklamowych oraz wyświetlać treści promocyjne osobom, które odwiedziły wcześniej Stronę Internetową. Narzędzie wykorzystuje cookies i inne technologie śledzące w celu dopasowania reklam. <a href="https://policies.google.com/technologies/ads?hl=pl" className="text-red-600 hover:underline">Szczegółowe informacje</a>.</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Facebook Pixel</h3>
          <p className="text-zinc-600 mb-4">Na naszej Stronie Internetowej możemy korzystać z Facebook Pixel. To narzędzie, które pozwala nam sprawdzać, jak użytkownicy reagują na nasze treści i reklamy w mediach społecznościowych, a także lepiej dopasowywać przyszłe kampanie. <a href="https://pl-pl.facebook.com/help/443357099140264?helpref=about_content" className="text-red-600 hover:underline">Szczegóły</a>.</p>
          <h3 className="font-semibold mt-6 mb-3 text-zinc-800">Facebook Ads</h3>
          <p className="text-zinc-600">Facebook Ads to rozwiązanie oferowane przez Meta, które umożliwia tworzenie i prowadzenie kampanii reklamowych na Facebooku, Instagramie i innych usługach Meta. Umożliwia nam kierowanie reklam do wybranych grup odbiorców na podstawie danych demograficznych, zainteresowań i zachowań. <a href="https://www.facebook.com/privacy/policy" className="text-red-600 hover:underline">Więcej informacji</a>.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">9. Social Media</h2>
          <p className="text-zinc-600 mb-4">Przetwarzamy dane osobowe użytkowników, którzy śledzą nasze profile w mediach społecznościowych takich jak Facebook, Instagram, YouTube i TikTok oraz wchodzą z nimi w interakcje. Szczegółowe informacje na temat przetwarzania danych przez poszczególne portale znajdziesz pod poniższymi linkami:</p>
          <ul className="list-disc pl-6 text-zinc-600 space-y-1">
            <li><a href="https://pl-pl.facebook.com/privacy/explanation" className="text-red-600 hover:underline">Zasady dotyczące danych dla Facebooka i Instagrama</a></li>
            <li><a href="https://policies.google.com/privacy?hl=pl" className="text-red-600 hover:underline">Polityka Prywatności YouTube</a> oraz <a href="https://www.youtube.com/t/terms_dataprocessing" className="text-red-600 hover:underline">Warunki przetwarzania danych osobowych przez YouTube</a></li>
            <li><a href="https://www.tiktok.com/legal/privacy-policy?lang=pl" className="text-red-600 hover:underline">Polityka Prywatności TikTok</a></li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">10. Pliki cookies</h2>
          <p className="text-zinc-600 mb-4">Na naszej Stronie Internetowej korzystamy z plików cookies oraz podobnych technologii. Dzięki nim strona działa prawidłowo, możemy zapewnić bezpieczeństwo, analizować statystyki odwiedzin oraz prowadzić działania marketingowe.</p>
          <p className="text-zinc-600 mb-4">Pliki cookies mogą być zapisywane na Twoim urządzeniu przez nas (tzw. cookies własne) albo przez naszych partnerów (tzw. cookies podmiotów trzecich, np. YouTube, Facebook, HubSpot).</p>
          <p className="text-zinc-600 mb-4">Niektóre cookies są niezbędne do działania strony i nie można ich wyłączyć, inne wymagają Twojej zgody – możesz nimi zarządzać w ustawieniach przeglądarki lub w banerze cookies widocznym przy pierwszej wizycie.</p>
          <p className="text-zinc-600 mb-4">Poniżej znajdziesz listę plików cookies, z których korzystamy, wraz z informacją o ich przeznaczeniu, czasie przechowywania i rodzaju:</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-zinc-300">
              <thead>
                <tr className="bg-zinc-100">
                  <th className="border border-zinc-300 px-3 py-2 text-left font-semibold text-zinc-900">Nazwa</th>
                  <th className="border border-zinc-300 px-3 py-2 text-left font-semibold text-zinc-900">Domena</th>
                  <th className="border border-zinc-300 px-3 py-2 text-left font-semibold text-zinc-900">Opis</th>
                  <th className="border border-zinc-300 px-3 py-2 text-left font-semibold text-zinc-900">Okres przechowywania</th>
                  <th className="border border-zinc-300 px-3 py-2 text-left font-semibold text-zinc-900">Rodzaj</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600">
                <tr>
                  <td className="border border-zinc-300 px-3 py-2">guest_id_marketing</td>
                  <td className="border border-zinc-300 px-3 py-2">.twitter.com</td>
                  <td className="border border-zinc-300 px-3 py-2">Twitter ustawia ten plik cookie w celu identyfikacji i śledzenia osoby odwiedzającej witrynę.</td>
                  <td className="border border-zinc-300 px-3 py-2">1 rok, 1 miesiąc, 4 dni</td>
                  <td className="border border-zinc-300 px-3 py-2">Reklamowe</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 px-3 py-2">guest_id_ads</td>
                  <td className="border border-zinc-300 px-3 py-2">.twitter.com</td>
                  <td className="border border-zinc-300 px-3 py-2">Twitter ustawia ten plik cookie w celu identyfikacji i śledzenia osoby odwiedzającej witrynę.</td>
                  <td className="border border-zinc-300 px-3 py-2">1 rok, 1 miesiąc, 4 dni</td>
                  <td className="border border-zinc-300 px-3 py-2">Reklamowe</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 px-3 py-2">personalization_id</td>
                  <td className="border border-zinc-300 px-3 py-2">.twitter.com</td>
                  <td className="border border-zinc-300 px-3 py-2">Twitter ustawia ten plik cookie w celu integracji i udostępniania funkcji mediów społecznościowych, a także przechowywania informacji o tym, jak użytkownik korzysta ze strony internetowej, do celów śledzenia i targetowania.</td>
                  <td className="border border-zinc-300 px-3 py-2">1 rok, 1 miesiąc, 4 dni</td>
                  <td className="border border-zinc-300 px-3 py-2">Reklamowe</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 px-3 py-2">guest_id</td>
                  <td className="border border-zinc-300 px-3 py-2">.twitter.com</td>
                  <td className="border border-zinc-300 px-3 py-2">Twitter ustawia ten plik cookie do identyfikacji i śledzenia osoby odwiedzającej witrynę. Rejestruje, czy użytkownik jest zalogowany na platformie Twitter i zbiera informacje o preferencjach reklamowych.</td>
                  <td className="border border-zinc-300 px-3 py-2">1 rok, 1 miesiąc, 4 dni</td>
                  <td className="border border-zinc-300 px-3 py-2">Reklamowe</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 px-3 py-2">_ga_*</td>
                  <td className="border border-zinc-300 px-3 py-2">.pollar.pl</td>
                  <td className="border border-zinc-300 px-3 py-2">Google Analytics ustawia ten plik cookie do przechowywania i zliczania odsłon.</td>
                  <td className="border border-zinc-300 px-3 py-2">1 rok, 1 miesiąc, 4 dni</td>
                  <td className="border border-zinc-300 px-3 py-2">Analityczne</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 px-3 py-2">_ga</td>
                  <td className="border border-zinc-300 px-3 py-2">.pollar.pl</td>
                  <td className="border border-zinc-300 px-3 py-2">Plik cookie _ga, instalowany przez Google Analytics, oblicza dane o odwiedzających, sesjach i kampaniach, a także śledzi wykorzystanie witryny na potrzeby raportu analitycznego. Plik cookie przechowuje informacje anonimowo i przypisuje losowo wygenerowany numer w celu rozpoznawania unikalnych użytkowników.</td>
                  <td className="border border-zinc-300 px-3 py-2">1 rok, 1 miesiąc, 4 dni</td>
                  <td className="border border-zinc-300 px-3 py-2">Analityczne</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 px-3 py-2">muc_ads</td>
                  <td className="border border-zinc-300 px-3 py-2">.t.co</td>
                  <td className="border border-zinc-300 px-3 py-2">Twitter ustawia ten plik cookie w celu zbierania danych o zachowaniu i interakcjach użytkownika w celu optymalizacji strony internetowej.</td>
                  <td className="border border-zinc-300 px-3 py-2">1 rok, 1 miesiąc, 4 dni</td>
                  <td className="border border-zinc-300 px-3 py-2">Reklamowe</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 px-3 py-2">pollar.theme</td>
                  <td className="border border-zinc-300 px-3 py-2">pollar.pl</td>
                  <td className="border border-zinc-300 px-3 py-2">Wykorzystywane do zapamiętywania wybranego motywu strony.</td>
                  <td className="border border-zinc-300 px-3 py-2">Bezterminowo</td>
                  <td className="border border-zinc-300 px-3 py-2">Funkcjonalne</td>
                </tr>
                <tr>
                  <td className="border border-zinc-300 px-3 py-2">pollar.language</td>
                  <td className="border border-zinc-300 px-3 py-2">pollar.pl</td>
                  <td className="border border-zinc-300 px-3 py-2">Wykorzystywane do zapamiętywania użytego języka.</td>
                  <td className="border border-zinc-300 px-3 py-2">Bezterminowo</td>
                  <td className="border border-zinc-300 px-3 py-2">Funkcjonalne</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-zinc-900">11. Zmiany w Polityce prywatności</h2>
          <p className="text-zinc-600 mb-4">Chcemy, aby nasze zasady dotyczące ochrony danych były przejrzyste i dopasowane do tego, jak faktycznie korzystasz ze Strony Internetowej. Dlatego ta Polityka może być co jakiś czas aktualizowana.</p>
          <p className="text-zinc-600 mb-4">Zawsze najnowsza wersja dokumentu będzie dostępna na tej stronie, razem z datą, od której obowiązuje.</p>
          <p className="text-zinc-600 font-semibold">Ta wersja Polityki obowiązuje od: 7 października 2025</p>
        </section>

        <section className="mt-12 pt-8 border-t border-zinc-200">
          <div className="bg-zinc-50 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-1">Zarządzaj ustawieniami cookies</h3>
              <p className="text-sm text-zinc-600">Zmień swoje preferencje dotyczące plików cookie w każdej chwili.</p>
            </div>
            <LocalizedLink
              to="/cookies"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors shrink-0"
            >
              Ustawienia cookies
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
