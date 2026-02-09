/**
 * Unique SEO descriptions for each category × country combination.
 * Key: Polish category → Polish country → { pl, en, de }
 * Used by crawlerSsr.js for single-country category pages.
 */

export const CATEGORY_COUNTRY_DESCRIPTIONS = {
  // ═══════════════════════════════════════════
  // ŚWIAT (World)
  // ═══════════════════════════════════════════
  'Świat': {
    'Polska': {
      pl: 'Polska na arenie międzynarodowej — dyplomacja, NATO, Unia Europejska i relacje dwustronne. AI agreguje najważniejsze wydarzenia z polskiej polityki zagranicznej.',
      en: 'Poland on the world stage — diplomacy, NATO, the European Union and bilateral relations. AI aggregates the most important Polish foreign policy events.',
      de: 'Polen auf der Weltbühne — Diplomatie, NATO, Europäische Union und bilaterale Beziehungen. KI aggregiert die wichtigsten Ereignisse der polnischen Außenpolitik.',
    },
    'Niemcy': {
      pl: 'Niemcy na arenie międzynarodowej — polityka zagraniczna Berlina, rola w UE i NATO, relacje transatlantyckie.',
      en: 'Germany on the world stage — Berlin\'s foreign policy, role in the EU and NATO, transatlantic relations.',
      de: 'Deutschland auf der Weltbühne — Berlins Außenpolitik, Rolle in der EU und NATO, transatlantische Beziehungen.',
    },
    'Włochy': {
      pl: 'Włochy na arenie międzynarodowej — polityka śródziemnomorska, rola w G7, migracja i relacje z UE.',
      en: 'Italy on the world stage — Mediterranean policy, G7 role, migration and EU relations.',
      de: 'Italien auf der Weltbühne — Mittelmeerpolitik, G7-Rolle, Migration und EU-Beziehungen.',
    },
    'USA': {
      pl: 'USA na arenie międzynarodowej — polityka zagraniczna Waszyngtonu, NATO, konflikty globalne i relacje z mocarstwami.',
      en: 'The USA on the world stage — Washington\'s foreign policy, NATO, global conflicts and great power relations.',
      de: 'Die USA auf der Weltbühne — Washingtons Außenpolitik, NATO, globale Konflikte und Großmachtbeziehungen.',
    },
    'Hiszpania': {
      pl: 'Hiszpania na arenie międzynarodowej — relacje z Ameryką Łacińską, rola w UE i polityka śródziemnomorska.',
      en: 'Spain on the world stage — Latin American relations, EU role and Mediterranean policy.',
      de: 'Spanien auf der Weltbühne — Beziehungen zu Lateinamerika, EU-Rolle und Mittelmeerpolitik.',
    },
    'Francja': {
      pl: 'Francja na arenie międzynarodowej — polityka Pałacu Elizejskiego, Rada Bezpieczeństwa ONZ, Afryka frankofońska.',
      en: 'France on the world stage — Élysée Palace policy, UN Security Council, Francophone Africa.',
      de: 'Frankreich auf der Weltbühne — Élysée-Politik, UN-Sicherheitsrat, frankphones Afrika.',
    },
    'Rosja': {
      pl: 'Rosja na arenie międzynarodowej — polityka Kremla, sankcje, ekspansja wojskowa i konflikty regionalne.',
      en: 'Russia on the world stage — Kremlin policy, sanctions, military expansion and regional conflicts.',
      de: 'Russland auf der Weltbühne — Kreml-Politik, Sanktionen, militärische Expansion und regionale Konflikte.',
    },
    'Ukraina': {
      pl: 'Ukraina na arenie międzynarodowej — wojna z Rosją, pomoc zachodnia, droga do UE i NATO.',
      en: 'Ukraine on the world stage — war with Russia, Western aid, path to EU and NATO membership.',
      de: 'Die Ukraine auf der Weltbühne — Krieg mit Russland, westliche Hilfe, Weg zur EU- und NATO-Mitgliedschaft.',
    },
    'Austria': {
      pl: 'Austria na arenie międzynarodowej — neutralność, polityka alpejska, rola w OBWE i relacje z Europą Środkową.',
      en: 'Austria on the world stage — neutrality, Alpine politics, OSCE role and Central European relations.',
      de: 'Österreich auf der Weltbühne — Neutralität, Alpenpolitik, OSZE-Rolle und mitteleuropäische Beziehungen.',
    },
    'Wielka Brytania': {
      pl: 'Wielka Brytania na arenie międzynarodowej — post-Brexit, relacje z Commonwealth, NATO i rola w Radzie Bezpieczeństwa ONZ.',
      en: 'The United Kingdom on the world stage — post-Brexit relations, the Commonwealth, NATO and UN Security Council role.',
      de: 'Großbritannien auf der Weltbühne — Post-Brexit-Beziehungen, Commonwealth, NATO und Rolle im UN-Sicherheitsrat.',
    },
    'Chiny': {
      pl: 'Chiny na arenie międzynarodowej — rywalizacja z USA, Nowy Jedwabny Szlak, Tajwan i ekspansja wpływów.',
      en: 'China on the world stage — rivalry with the US, Belt and Road, Taiwan and expanding influence.',
      de: 'China auf der Weltbühne — Rivalität mit den USA, Seidenstraße, Taiwan und wachsender Einfluss.',
    },
    'Czechy': {
      pl: 'Czechy na arenie międzynarodowej — Grupa Wyszehradzka, relacje z UE i polityka środkowoeuropejska.',
      en: 'The Czech Republic on the world stage — Visegrád Group, EU relations and Central European politics.',
      de: 'Tschechien auf der Weltbühne — Visegrád-Gruppe, EU-Beziehungen und mitteleuropäische Politik.',
    },
    'Szwajcaria': {
      pl: 'Szwajcaria na arenie międzynarodowej — neutralność, mediacje dyplomatyczne, organizacje międzynarodowe w Genewie.',
      en: 'Switzerland on the world stage — neutrality, diplomatic mediation, international organizations in Geneva.',
      de: 'Die Schweiz auf der Weltbühne — Neutralität, diplomatische Vermittlung, internationale Organisationen in Genf.',
    },
    'Izrael': {
      pl: 'Izrael na arenie międzynarodowej — konflikt bliskowschodni, relacje z USA, normalizacja stosunków z krajami arabskimi.',
      en: 'Israel on the world stage — the Middle East conflict, US relations, normalization with Arab countries.',
      de: 'Israel auf der Weltbühne — Nahostkonflikt, US-Beziehungen, Normalisierung mit arabischen Staaten.',
    },
    'Holandia': {
      pl: 'Holandia na arenie międzynarodowej — Haga i Trybunał, handel globalny, polityka europejska i klimatyczna.',
      en: 'The Netherlands on the world stage — The Hague tribunals, global trade, European and climate policy.',
      de: 'Die Niederlande auf der Weltbühne — Den Haager Tribunale, Welthandel, europäische und Klimapolitik.',
    },
  },

  // ═══════════════════════════════════════════
  // GOSPODARKA (Economy)
  // ═══════════════════════════════════════════
  'Gospodarka': {
    'Polska': {
      pl: 'Gospodarka Polski — PKB, inflacja, rynek pracy, inwestycje zagraniczne i polityka NBP. AI agreguje kluczowe dane ekonomiczne.',
      en: 'Poland\'s economy — GDP, inflation, labor market, foreign investment and central bank policy. AI aggregates key economic data.',
      de: 'Polens Wirtschaft — BIP, Inflation, Arbeitsmarkt, Auslandsinvestitionen und Zentralbankpolitik. KI aggregiert wichtige Wirtschaftsdaten.',
    },
    'Niemcy': {
      pl: 'Gospodarka Niemiec — przemysł motoryzacyjny, eksport, Mittelstand, polityka Bundesbanku i strefa euro.',
      en: 'Germany\'s economy — automotive industry, exports, Mittelstand, Bundesbank policy and the eurozone.',
      de: 'Deutschlands Wirtschaft — Automobilindustrie, Exporte, Mittelstand, Bundesbank-Politik und die Eurozone.',
    },
    'Włochy': {
      pl: 'Gospodarka Włoch — przemysł modowy i motoryzacyjny, turystyka, dług publiczny i strefa euro.',
      en: 'Italy\'s economy — fashion and automotive industries, tourism, public debt and the eurozone.',
      de: 'Italiens Wirtschaft — Mode- und Automobilindustrie, Tourismus, Staatsverschuldung und die Eurozone.',
    },
    'USA': {
      pl: 'Gospodarka USA — Wall Street, Fed, Big Tech, rynek pracy i dolar jako waluta rezerwowa.',
      en: 'The US economy — Wall Street, the Fed, Big Tech, the labor market and the dollar as reserve currency.',
      de: 'Die US-Wirtschaft — Wall Street, die Fed, Big Tech, der Arbeitsmarkt und der Dollar als Reservewährung.',
    },
    'Hiszpania': {
      pl: 'Gospodarka Hiszpanii — turystyka, nieruchomości, rolnictwo, bezrobocie i strefa euro.',
      en: 'Spain\'s economy — tourism, real estate, agriculture, unemployment and the eurozone.',
      de: 'Spaniens Wirtschaft — Tourismus, Immobilien, Landwirtschaft, Arbeitslosigkeit und die Eurozone.',
    },
    'Francja': {
      pl: 'Gospodarka Francji — luksus, lotnictwo, energetyka jądrowa, reformy Makrona i strefa euro.',
      en: 'France\'s economy — luxury goods, aviation, nuclear energy, Macron\'s reforms and the eurozone.',
      de: 'Frankreichs Wirtschaft — Luxusgüter, Luftfahrt, Kernenergie, Macrons Reformen und die Eurozone.',
    },
    'Rosja': {
      pl: 'Gospodarka Rosji — sankcje, ropa i gaz, rubel, izolacja gospodarcza i ekonomia wojenna.',
      en: 'Russia\'s economy — sanctions, oil and gas, the ruble, economic isolation and war economy.',
      de: 'Russlands Wirtschaft — Sanktionen, Öl und Gas, der Rubel, wirtschaftliche Isolation und Kriegswirtschaft.',
    },
    'Ukraina': {
      pl: 'Gospodarka Ukrainy — odbudowa wojenna, pomoc międzynarodowa, rolnictwo, eksport zbóż i droga do UE.',
      en: 'Ukraine\'s economy — wartime reconstruction, international aid, agriculture, grain exports and EU accession path.',
      de: 'Die Wirtschaft der Ukraine — Wiederaufbau, internationale Hilfe, Landwirtschaft, Getreideexporte und EU-Beitrittsweg.',
    },
    'Austria': {
      pl: 'Gospodarka Austrii — turystyka alpejska, bankowość, przemysł i rola w gospodarce Europy Środkowej.',
      en: 'Austria\'s economy — Alpine tourism, banking, industry and its role in the Central European economy.',
      de: 'Österreichs Wirtschaft — Alpentourismus, Bankwesen, Industrie und die Rolle in der mitteleuropäischen Wirtschaft.',
    },
    'Wielka Brytania': {
      pl: 'Gospodarka Wielkiej Brytanii — City of London, funt, post-Brexit, rynek nieruchomości i Bank Anglii.',
      en: 'The UK economy — the City of London, the pound, post-Brexit trade, the housing market and the Bank of England.',
      de: 'Die britische Wirtschaft — die City of London, das Pfund, Post-Brexit-Handel, Immobilienmarkt und die Bank of England.',
    },
    'Chiny': {
      pl: 'Gospodarka Chin — handel globalny, technologia, nieruchomości, juan i rywalizacja z USA.',
      en: 'China\'s economy — global trade, technology, real estate, the yuan and rivalry with the US.',
      de: 'Chinas Wirtschaft — Welthandel, Technologie, Immobilien, der Yuan und die Rivalität mit den USA.',
    },
    'Czechy': {
      pl: 'Gospodarka Czech — przemysł motoryzacyjny, korona czeska, inwestycje i relacje handlowe z Polską.',
      en: 'Czech economy — automotive industry, the Czech koruna, investment and trade relations with Poland.',
      de: 'Tschechiens Wirtschaft — Automobilindustrie, die Tschechische Krone, Investitionen und Handelsbeziehungen mit Polen.',
    },
    'Szwajcaria': {
      pl: 'Gospodarka Szwajcarii — bankowość, farmacja, zegarki, frank szwajcarski i neutralność finansowa.',
      en: 'Switzerland\'s economy — banking, pharmaceuticals, watchmaking, the Swiss franc and financial neutrality.',
      de: 'Die Schweizer Wirtschaft — Bankwesen, Pharma, Uhrenindustrie, der Schweizer Franken und finanzielle Neutralität.',
    },
    'Izrael': {
      pl: 'Gospodarka Izraela — startup nation, cyberbezpieczeństwo, hi-tech, diamentowy handel i szekel.',
      en: 'Israel\'s economy — startup nation, cybersecurity, hi-tech, the diamond trade and the shekel.',
      de: 'Israels Wirtschaft — Start-up-Nation, Cybersicherheit, Hi-Tech, der Diamantenhandel und der Schekel.',
    },
    'Holandia': {
      pl: 'Gospodarka Holandii — port w Rotterdamie, rolnictwo, Eindhoven tech hub, handel i strefa euro.',
      en: 'The Dutch economy — Port of Rotterdam, agriculture, the Eindhoven tech hub, trade and the eurozone.',
      de: 'Die niederländische Wirtschaft — Hafen Rotterdam, Landwirtschaft, Tech-Hub Eindhoven, Handel und die Eurozone.',
    },
  },

  // ═══════════════════════════════════════════
  // SPOŁECZEŃSTWO (Society)
  // ═══════════════════════════════════════════
  'Społeczeństwo': {
    'Polska': {
      pl: 'Społeczeństwo w Polsce — edukacja, zdrowie, demografia, migracje i nierówności społeczne.',
      en: 'Society in Poland — education, healthcare, demographics, migration and social inequality.',
      de: 'Gesellschaft in Polen — Bildung, Gesundheit, Demografie, Migration und soziale Ungleichheit.',
    },
    'Niemcy': {
      pl: 'Społeczeństwo w Niemczech — integracja imigrantów, system socjalny, edukacja i zmiany demograficzne.',
      en: 'Society in Germany — immigrant integration, social welfare, education and demographic change.',
      de: 'Gesellschaft in Deutschland — Integration, Sozialstaat, Bildung und demografischer Wandel.',
    },
    'Włochy': {
      pl: 'Społeczeństwo we Włoszech — starzenie się, emigracja młodych, Południe vs Północ i system zdrowia.',
      en: 'Society in Italy — aging population, youth emigration, South vs North divide and healthcare.',
      de: 'Gesellschaft in Italien — Überalterung, Abwanderung der Jugend, Süd-Nord-Gefälle und Gesundheitswesen.',
    },
    'USA': {
      pl: 'Społeczeństwo w USA — polaryzacja, nierówności rasowe, opieka zdrowotna, broń i imigracja.',
      en: 'Society in the USA — polarization, racial inequality, healthcare, guns and immigration.',
      de: 'Gesellschaft in den USA — Polarisierung, Rassenungleichheit, Gesundheitswesen, Waffen und Einwanderung.',
    },
    'Hiszpania': {
      pl: 'Społeczeństwo w Hiszpanii — bezrobocie młodych, autonomie regionalne, imigracja i system zdrowia.',
      en: 'Society in Spain — youth unemployment, regional autonomies, immigration and healthcare.',
      de: 'Gesellschaft in Spanien — Jugendarbeitslosigkeit, regionale Autonomien, Einwanderung und Gesundheitswesen.',
    },
    'Francja': {
      pl: 'Społeczeństwo we Francji — protesty społeczne, imigracja, laickość, emerytury i banlieue.',
      en: 'Society in France — social protests, immigration, secularism, pensions and the banlieues.',
      de: 'Gesellschaft in Frankreich — soziale Proteste, Einwanderung, Laizismus, Renten und die Banlieues.',
    },
    'Rosja': {
      pl: 'Społeczeństwo w Rosji — wolność słowa, mobilizacja, emigracja, propaganda i prawa człowieka.',
      en: 'Society in Russia — freedom of speech, mobilization, emigration, propaganda and human rights.',
      de: 'Gesellschaft in Russland — Meinungsfreiheit, Mobilisierung, Emigration, Propaganda und Menschenrechte.',
    },
    'Ukraina': {
      pl: 'Społeczeństwo na Ukrainie — uchodźcy, trauma wojenna, wolontariat, odbudowa społeczna i edukacja.',
      en: 'Society in Ukraine — refugees, war trauma, volunteering, social reconstruction and education.',
      de: 'Gesellschaft in der Ukraine — Flüchtlinge, Kriegstrauma, Freiwilligenarbeit, sozialer Wiederaufbau und Bildung.',
    },
    'Austria': {
      pl: 'Społeczeństwo w Austrii — integracja, system edukacji, jakość życia i polityka mieszkaniowa.',
      en: 'Society in Austria — integration, the education system, quality of life and housing policy.',
      de: 'Gesellschaft in Österreich — Integration, Bildungssystem, Lebensqualität und Wohnungspolitik.',
    },
    'Wielka Brytania': {
      pl: 'Społeczeństwo w Wielkiej Brytanii — NHS, imigracja, nierówności, Szkocja i wielokulturowość.',
      en: 'Society in the UK — the NHS, immigration, inequality, Scotland and multiculturalism.',
      de: 'Gesellschaft in Großbritannien — NHS, Einwanderung, Ungleichheit, Schottland und Multikulturalismus.',
    },
    'Chiny': {
      pl: 'Społeczeństwo w Chinach — kontrola społeczna, urbanizacja, edukacja, demografia i prawa człowieka.',
      en: 'Society in China — social control, urbanization, education, demographics and human rights.',
      de: 'Gesellschaft in China — soziale Kontrolle, Urbanisierung, Bildung, Demografie und Menschenrechte.',
    },
    'Czechy': {
      pl: 'Społeczeństwo w Czechach — edukacja, opieka zdrowotna, mniejszości i relacje polsko-czeskie.',
      en: 'Society in the Czech Republic — education, healthcare, minorities and Czech-Polish relations.',
      de: 'Gesellschaft in Tschechien — Bildung, Gesundheitswesen, Minderheiten und tschechisch-polnische Beziehungen.',
    },
    'Szwajcaria': {
      pl: 'Społeczeństwo w Szwajcarii — demokracja bezpośrednia, wielojęzyczność, jakość życia i imigracja.',
      en: 'Society in Switzerland — direct democracy, multilingualism, quality of life and immigration.',
      de: 'Gesellschaft in der Schweiz — direkte Demokratie, Mehrsprachigkeit, Lebensqualität und Einwanderung.',
    },
    'Izrael': {
      pl: 'Społeczeństwo w Izraelu — religia a państwo, służba wojskowa, imigracja i napięcia wewnętrzne.',
      en: 'Society in Israel — religion and state, military service, immigration and internal tensions.',
      de: 'Gesellschaft in Israel — Religion und Staat, Militärdienst, Einwanderung und innere Spannungen.',
    },
    'Holandia': {
      pl: 'Społeczeństwo w Holandii — tolerancja, rynek mieszkaniowy, integracja i system opieki zdrowotnej.',
      en: 'Society in the Netherlands — tolerance, the housing market, integration and the healthcare system.',
      de: 'Gesellschaft in den Niederlanden — Toleranz, Wohnungsmarkt, Integration und das Gesundheitssystem.',
    },
  },

  // ═══════════════════════════════════════════
  // POLITYKA (Politics)
  // ═══════════════════════════════════════════
  'Polityka': {
    'Polska': {
      pl: 'Polityka w Polsce — Sejm, Senat, rząd, prezydent, wybory i reformy ustrojowe.',
      en: 'Politics in Poland — the Sejm, Senate, government, president, elections and constitutional reforms.',
      de: 'Politik in Polen — Sejm, Senat, Regierung, Präsident, Wahlen und Verfassungsreformen.',
    },
    'Niemcy': {
      pl: 'Polityka w Niemczech — Bundestag, kanclerz, koalicje, AfD i polityka europejska Berlina.',
      en: 'Politics in Germany — the Bundestag, chancellor, coalitions, the AfD and Berlin\'s European policy.',
      de: 'Politik in Deutschland — Bundestag, Kanzler, Koalitionen, AfD und Berlins Europapolitik.',
    },
    'Włochy': {
      pl: 'Polityka we Włoszech — rząd, koalicje, populizm, Giorgia Meloni i niestabilność polityczna.',
      en: 'Politics in Italy — government, coalitions, populism, Giorgia Meloni and political instability.',
      de: 'Politik in Italien — Regierung, Koalitionen, Populismus, Giorgia Meloni und politische Instabilität.',
    },
    'USA': {
      pl: 'Polityka w USA — Biały Dom, Kongres, Sąd Najwyższy, wybory i polaryzacja partyjna.',
      en: 'Politics in the USA — the White House, Congress, the Supreme Court, elections and partisan polarization.',
      de: 'Politik in den USA — das Weiße Haus, Kongress, der Oberste Gerichtshof, Wahlen und Parteipolarisierung.',
    },
    'Hiszpania': {
      pl: 'Polityka w Hiszpanii — Cortes, rząd, Katalonia, Kraj Basków i monarchia konstytucyjna.',
      en: 'Politics in Spain — the Cortes, government, Catalonia, the Basque Country and the constitutional monarchy.',
      de: 'Politik in Spanien — die Cortes, Regierung, Katalonien, das Baskenland und die konstitutionelle Monarchie.',
    },
    'Francja': {
      pl: 'Polityka we Francji — Pałac Elizejski, Zgromadzenie Narodowe, wybory, Marine Le Pen i reformy.',
      en: 'Politics in France — the Élysée Palace, the National Assembly, elections, Marine Le Pen and reforms.',
      de: 'Politik in Frankreich — der Élysée-Palast, die Nationalversammlung, Wahlen, Marine Le Pen und Reformen.',
    },
    'Rosja': {
      pl: 'Polityka w Rosji — Kreml, Putin, Duma, opozycja i autorytaryzm.',
      en: 'Politics in Russia — the Kremlin, Putin, the Duma, opposition and authoritarianism.',
      de: 'Politik in Russland — der Kreml, Putin, die Duma, Opposition und Autoritarismus.',
    },
    'Ukraina': {
      pl: 'Polityka na Ukrainie — Zełenski, Rada Najwyższa, reformy, korupcja i integracja z Zachodem.',
      en: 'Politics in Ukraine — Zelenskyy, the Verkhovna Rada, reforms, corruption and Western integration.',
      de: 'Politik in der Ukraine — Selenskyj, die Werchowna Rada, Reformen, Korruption und westliche Integration.',
    },
    'Austria': {
      pl: 'Polityka w Austrii — kanclerz, koalicje, FPÖ, polityka neutralności i relacje z UE.',
      en: 'Politics in Austria — the chancellor, coalitions, the FPÖ, neutrality policy and EU relations.',
      de: 'Politik in Österreich — Kanzler, Koalitionen, FPÖ, Neutralitätspolitik und EU-Beziehungen.',
    },
    'Wielka Brytania': {
      pl: 'Polityka w Wielkiej Brytanii — Westminster, premier, Partia Pracy, Torysi i dewolucja.',
      en: 'Politics in the UK — Westminster, the Prime Minister, Labour, the Conservatives and devolution.',
      de: 'Politik in Großbritannien — Westminster, Premierminister, Labour, die Konservativen und Devolution.',
    },
    'Chiny': {
      pl: 'Polityka w Chinach — Partia Komunistyczna, Xi Jinping, Hongkong, Tajwan i cenzura.',
      en: 'Politics in China — the Communist Party, Xi Jinping, Hong Kong, Taiwan and censorship.',
      de: 'Politik in China — die Kommunistische Partei, Xi Jinping, Hongkong, Taiwan und Zensur.',
    },
    'Czechy': {
      pl: 'Polityka w Czechach — rząd, prezydent, relacje z Polską i Grupą Wyszehradzką.',
      en: 'Politics in the Czech Republic — government, president, relations with Poland and the Visegrád Group.',
      de: 'Politik in Tschechien — Regierung, Präsident, Beziehungen zu Polen und der Visegrád-Gruppe.',
    },
    'Szwajcaria': {
      pl: 'Polityka w Szwajcarii — Rada Federalna, referenda, kantony i demokracja bezpośrednia.',
      en: 'Politics in Switzerland — the Federal Council, referendums, cantons and direct democracy.',
      de: 'Politik in der Schweiz — der Bundesrat, Volksabstimmungen, Kantone und direkte Demokratie.',
    },
    'Izrael': {
      pl: 'Polityka w Izraelu — Kneset, Netanjahu, koalicje, osadnictwo i reforma sądownictwa.',
      en: 'Politics in Israel — the Knesset, Netanyahu, coalitions, settlements and judicial reform.',
      de: 'Politik in Israel — die Knesset, Netanjahu, Koalitionen, Siedlungen und Justizreform.',
    },
    'Holandia': {
      pl: 'Polityka w Holandii — Wilders, koalicje, polityka migracyjna i rola w UE.',
      en: 'Politics in the Netherlands — Wilders, coalitions, migration policy and the EU role.',
      de: 'Politik in den Niederlanden — Wilders, Koalitionen, Migrationspolitik und die EU-Rolle.',
    },
  },

  // ═══════════════════════════════════════════
  // SPORT
  // ═══════════════════════════════════════════
  'Sport': {
    'Polska': {
      pl: 'Sport w Polsce — Ekstraklasa, reprezentacja, siatkówka, lekkoatletyka i skoki narciarskie.',
      en: 'Sports in Poland — the Ekstraklasa, national team, volleyball, athletics and ski jumping.',
      de: 'Sport in Polen — Ekstraklasa, Nationalmannschaft, Volleyball, Leichtathletik und Skispringen.',
    },
    'Niemcy': {
      pl: 'Sport w Niemczech — Bundesliga, Bayern Monachium, Borussia Dortmund, Formuła 1 i reprezentacja.',
      en: 'Sports in Germany — the Bundesliga, Bayern Munich, Borussia Dortmund, Formula 1 and the national team.',
      de: 'Sport in Deutschland — Bundesliga, Bayern München, Borussia Dortmund, Formel 1 und die Nationalmannschaft.',
    },
    'Włochy': {
      pl: 'Sport we Włoszech — Serie A, Juventus, Inter, AC Milan, Formuła 1 w Monzy i reprezentacja.',
      en: 'Sports in Italy — Serie A, Juventus, Inter, AC Milan, Formula 1 at Monza and the national team.',
      de: 'Sport in Italien — Serie A, Juventus, Inter, AC Milan, Formel 1 in Monza und die Nationalmannschaft.',
    },
    'USA': {
      pl: 'Sport w USA — NBA, NFL, MLB, NHL, MLS i igrzyska olimpijskie. Polacy w amerykańskich ligach.',
      en: 'Sports in the USA — the NBA, NFL, MLB, NHL, MLS and the Olympics.',
      de: 'Sport in den USA — NBA, NFL, MLB, NHL, MLS und die Olympischen Spiele.',
    },
    'Hiszpania': {
      pl: 'Sport w Hiszpanii — La Liga, Real Madryt, FC Barcelona, tenis i reprezentacja.',
      en: 'Sports in Spain — La Liga, Real Madrid, FC Barcelona, tennis and the national team.',
      de: 'Sport in Spanien — La Liga, Real Madrid, FC Barcelona, Tennis und die Nationalmannschaft.',
    },
    'Francja': {
      pl: 'Sport we Francji — Ligue 1, PSG, Tour de France, rugby i reprezentacja piłkarska.',
      en: 'Sports in France — Ligue 1, PSG, the Tour de France, rugby and the national football team.',
      de: 'Sport in Frankreich — Ligue 1, PSG, Tour de France, Rugby und die Fußballnationalmannschaft.',
    },
    'Rosja': {
      pl: 'Sport w Rosji — wykluczenie z rywalizacji, doping, KHL i historia olimpijska.',
      en: 'Sports in Russia — competition bans, doping, the KHL and Olympic history.',
      de: 'Sport in Russland — Wettkampfsperren, Doping, die KHL und olympische Geschichte.',
    },
    'Ukraina': {
      pl: 'Sport na Ukrainie — piłka nożna w czasie wojny, Szachtar Donieck, Dynamo Kijów i boks.',
      en: 'Sports in Ukraine — wartime football, Shakhtar Donetsk, Dynamo Kyiv and boxing.',
      de: 'Sport in der Ukraine — Fußball in Kriegszeiten, Schachtar Donezk, Dynamo Kiew und Boxen.',
    },
    'Austria': {
      pl: 'Sport w Austrii — narciarstwo alpejskie, Bundesliga, skoki narciarskie i Formuła 1 w Spielbergu.',
      en: 'Sports in Austria — Alpine skiing, the Bundesliga, ski jumping and Formula 1 at Spielberg.',
      de: 'Sport in Österreich — Ski Alpin, Bundesliga, Skispringen und Formel 1 in Spielberg.',
    },
    'Wielka Brytania': {
      pl: 'Sport w Wielkiej Brytanii — Premier League, Wimbledon, F1 w Silverstone, rugby i krykiet.',
      en: 'Sports in the UK — the Premier League, Wimbledon, F1 at Silverstone, rugby and cricket.',
      de: 'Sport in Großbritannien — Premier League, Wimbledon, F1 in Silverstone, Rugby und Cricket.',
    },
    'Chiny': {
      pl: 'Sport w Chinach — igrzyska olimpijskie, ping-pong, badminton, piłka nożna i esport.',
      en: 'Sports in China — the Olympics, table tennis, badminton, football and esports.',
      de: 'Sport in China — Olympische Spiele, Tischtennis, Badminton, Fußball und E-Sport.',
    },
    'Czechy': {
      pl: 'Sport w Czechach — hokej na lodzie, piłka nożna, tenis i liga czeska.',
      en: 'Sports in the Czech Republic — ice hockey, football, tennis and the Czech league.',
      de: 'Sport in Tschechien — Eishockey, Fußball, Tennis und die tschechische Liga.',
    },
    'Szwajcaria': {
      pl: 'Sport w Szwajcarii — tenis, narciarstwo, hokej, piłka nożna i Roger Federer legacy.',
      en: 'Sports in Switzerland — tennis, skiing, hockey, football and the Roger Federer legacy.',
      de: 'Sport in der Schweiz — Tennis, Skifahren, Hockey, Fußball und das Roger-Federer-Erbe.',
    },
    'Izrael': {
      pl: 'Sport w Izraelu — Maccabi Tel Awiw, piłka nożna, koszykówka i sporty walki.',
      en: 'Sports in Israel — Maccabi Tel Aviv, football, basketball and combat sports.',
      de: 'Sport in Israel — Maccabi Tel Aviv, Fußball, Basketball und Kampfsport.',
    },
    'Holandia': {
      pl: 'Sport w Holandii — Eredivisie, Ajax, PSV, łyżwiarstwo szybkie, kolarstwo i reprezentacja.',
      en: 'Sports in the Netherlands — the Eredivisie, Ajax, PSV, speed skating, cycling and the national team.',
      de: 'Sport in den Niederlanden — Eredivisie, Ajax, PSV, Eisschnelllauf, Radsport und die Nationalmannschaft.',
    },
  },

  // ═══════════════════════════════════════════
  // KULTURA (Culture)
  // ═══════════════════════════════════════════
  'Kultura': {
    'Polska': {
      pl: 'Kultura w Polsce — kino, literatura, muzyka, teatr i sztuka współczesna. Polscy twórcy na świecie.',
      en: 'Culture in Poland — cinema, literature, music, theater and contemporary art. Polish creators worldwide.',
      de: 'Kultur in Polen — Kino, Literatur, Musik, Theater und zeitgenössische Kunst. Polnische Künstler weltweit.',
    },
    'Niemcy': {
      pl: 'Kultura w Niemczech — Berlinale, Documenta, muzyka elektroniczna, literatura i muzea.',
      en: 'Culture in Germany — the Berlinale, Documenta, electronic music, literature and museums.',
      de: 'Kultur in Deutschland — Berlinale, Documenta, elektronische Musik, Literatur und Museen.',
    },
    'Włochy': {
      pl: 'Kultura we Włoszech — Biennale w Wenecji, moda, opera, kino i dziedzictwo renesansu.',
      en: 'Culture in Italy — the Venice Biennale, fashion, opera, cinema and Renaissance heritage.',
      de: 'Kultur in Italien — die Biennale in Venedig, Mode, Oper, Kino und das Renaissance-Erbe.',
    },
    'USA': {
      pl: 'Kultura w USA — Hollywood, Broadway, muzyka pop, streaming i popkultura globalna.',
      en: 'Culture in the USA — Hollywood, Broadway, pop music, streaming and global pop culture.',
      de: 'Kultur in den USA — Hollywood, Broadway, Popmusik, Streaming und globale Popkultur.',
    },
    'Hiszpania': {
      pl: 'Kultura w Hiszpanii — flamenco, Gaudí, kino Almodóvara, festiwale i literatura.',
      en: 'Culture in Spain — flamenco, Gaudí, Almodóvar\'s cinema, festivals and literature.',
      de: 'Kultur in Spanien — Flamenco, Gaudí, Almodóvars Kino, Festivals und Literatur.',
    },
    'Francja': {
      pl: 'Kultura we Francji — Cannes, Luwr, moda paryska, literatura i gastronomia.',
      en: 'Culture in France — Cannes, the Louvre, Parisian fashion, literature and gastronomy.',
      de: 'Kultur in Frankreich — Cannes, der Louvre, Pariser Mode, Literatur und Gastronomie.',
    },
    'Rosja': {
      pl: 'Kultura w Rosji — balet, literatura klasyczna, kino, propaganda kulturowa i emigracja artystów.',
      en: 'Culture in Russia — ballet, classical literature, cinema, cultural propaganda and artist emigration.',
      de: 'Kultur in Russland — Ballett, klassische Literatur, Kino, kulturelle Propaganda und Künstleremigration.',
    },
    'Ukraina': {
      pl: 'Kultura na Ukrainie — sztuka wojenna, muzyka, kino, dziedzictwo i tożsamość kulturowa.',
      en: 'Culture in Ukraine — wartime art, music, cinema, heritage and cultural identity.',
      de: 'Kultur in der Ukraine — Kriegskunst, Musik, Kino, Kulturerbe und kulturelle Identität.',
    },
    'Austria': {
      pl: 'Kultura w Austrii — Wiedeń muzyczny, opera, Klimt, Salzburg i tradycja kawiarniana.',
      en: 'Culture in Austria — musical Vienna, opera, Klimt, Salzburg and the coffeehouse tradition.',
      de: 'Kultur in Österreich — das musikalische Wien, Oper, Klimt, Salzburg und die Kaffeehauskultur.',
    },
    'Wielka Brytania': {
      pl: 'Kultura w Wielkiej Brytanii — BBC, West End, muzea, muzyka brytyjska i literatura.',
      en: 'Culture in the UK — the BBC, the West End, museums, British music and literature.',
      de: 'Kultur in Großbritannien — BBC, West End, Museen, britische Musik und Literatur.',
    },
    'Chiny': {
      pl: 'Kultura w Chinach — kino, cenzura, tradycja i nowoczesność, festiwale i soft power.',
      en: 'Culture in China — cinema, censorship, tradition and modernity, festivals and soft power.',
      de: 'Kultur in China — Kino, Zensur, Tradition und Moderne, Festivals und Soft Power.',
    },
    'Czechy': {
      pl: 'Kultura w Czechach — Praga literacka, kino czeskie, piwo, muzyka i festiwale filmowe.',
      en: 'Culture in the Czech Republic — literary Prague, Czech cinema, beer, music and film festivals.',
      de: 'Kultur in Tschechien — das literarische Prag, tschechisches Kino, Bier, Musik und Filmfestivals.',
    },
    'Szwajcaria': {
      pl: 'Kultura w Szwajcarii — Art Basel, wielojęzyczność, design, architektura i festiwale jazzowe.',
      en: 'Culture in Switzerland — Art Basel, multilingualism, design, architecture and jazz festivals.',
      de: 'Kultur in der Schweiz — Art Basel, Mehrsprachigkeit, Design, Architektur und Jazzfestivals.',
    },
    'Izrael': {
      pl: 'Kultura w Izraelu — Tel Awiw, startupy kreatywne, kino, muzyka i wielokulturowość.',
      en: 'Culture in Israel — Tel Aviv, creative startups, cinema, music and multiculturalism.',
      de: 'Kultur in Israel — Tel Aviv, kreative Start-ups, Kino, Musik und Multikulturalismus.',
    },
    'Holandia': {
      pl: 'Kultura w Holandii — Van Gogh, Rijksmuseum, design, festiwale muzyczne i architektura.',
      en: 'Culture in the Netherlands — Van Gogh, the Rijksmuseum, design, music festivals and architecture.',
      de: 'Kultur in den Niederlanden — Van Gogh, Rijksmuseum, Design, Musikfestivals und Architektur.',
    },
  },

  // ═══════════════════════════════════════════
  // PRZESTĘPCZOŚĆ (Crime)
  // ═══════════════════════════════════════════
  'Przestępczość': {
    'Polska': {
      pl: 'Przestępczość w Polsce — cyberprzestępczość, oszustwa, kradzieże, wymiar sprawiedliwości i policja.',
      en: 'Crime in Poland — cybercrime, fraud, theft, the justice system and police.',
      de: 'Kriminalität in Polen — Cyberkriminalität, Betrug, Diebstahl, Justiz und Polizei.',
    },
    'Niemcy': {
      pl: 'Przestępczość w Niemczech — przestępczość zorganizowana, klany, cyberprzestępczość i bezpieczeństwo.',
      en: 'Crime in Germany — organized crime, clan crime, cybercrime and public safety.',
      de: 'Kriminalität in Deutschland — organisierte Kriminalität, Clankriminalität, Cyberkriminalität und Sicherheit.',
    },
    'Włochy': {
      pl: 'Przestępczość we Włoszech — mafia, Cosa Nostra, \'Ndrangheta, Camorra i walka z korupcją.',
      en: 'Crime in Italy — the Mafia, Cosa Nostra, \'Ndrangheta, the Camorra and the fight against corruption.',
      de: 'Kriminalität in Italien — Mafia, Cosa Nostra, \'Ndrangheta, Camorra und der Kampf gegen Korruption.',
    },
    'USA': {
      pl: 'Przestępczość w USA — strzelaniny, narkotyki, gangi, wymiar sprawiedliwości i reformy policji.',
      en: 'Crime in the USA — shootings, drugs, gangs, the justice system and police reform.',
      de: 'Kriminalität in den USA — Schießereien, Drogen, Gangs, Justiz und Polizeireform.',
    },
    'Hiszpania': {
      pl: 'Przestępczość w Hiszpanii — przemyt, przestępczość turystyczna, ETA legacy i korupcja.',
      en: 'Crime in Spain — smuggling, tourist crime, the ETA legacy and corruption.',
      de: 'Kriminalität in Spanien — Schmuggel, Tourismuskriminalität, ETA-Erbe und Korruption.',
    },
    'Francja': {
      pl: 'Przestępczość we Francji — terroryzm, zamieszki, narkotyki, przestępczość w banlieue i korupcja.',
      en: 'Crime in France — terrorism, riots, drugs, suburban crime and corruption.',
      de: 'Kriminalität in Frankreich — Terrorismus, Unruhen, Drogen, Vorstadtkriminalität und Korruption.',
    },
    'Rosja': {
      pl: 'Przestępczość w Rosji — korupcja, oligarchowie, mafie, represje polityczne i cyberprzestępczość.',
      en: 'Crime in Russia — corruption, oligarchs, organized crime, political repression and cybercrime.',
      de: 'Kriminalität in Russland — Korruption, Oligarchen, organisierte Kriminalität, politische Repression und Cyberkriminalität.',
    },
    'Ukraina': {
      pl: 'Przestępczość na Ukrainie — zbrodnie wojenne, korupcja, cyberprzestępczość i wymiar sprawiedliwości.',
      en: 'Crime in Ukraine — war crimes, corruption, cybercrime and the justice system.',
      de: 'Kriminalität in der Ukraine — Kriegsverbrechen, Korruption, Cyberkriminalität und Justiz.',
    },
    'Austria': {
      pl: 'Przestępczość w Austrii — przestępczość transgraniczna, oszustwa, korupcja i bezpieczeństwo publiczne.',
      en: 'Crime in Austria — cross-border crime, fraud, corruption and public safety.',
      de: 'Kriminalität in Österreich — grenzüberschreitende Kriminalität, Betrug, Korruption und öffentliche Sicherheit.',
    },
    'Wielka Brytania': {
      pl: 'Przestępczość w Wielkiej Brytanii — przestępczość nożowa, gangi, oszustwa i Scotland Yard.',
      en: 'Crime in the UK — knife crime, gangs, fraud and Scotland Yard.',
      de: 'Kriminalität in Großbritannien — Messerkriminalität, Gangs, Betrug und Scotland Yard.',
    },
    'Chiny': {
      pl: 'Przestępczość w Chinach — korupcja, cyberprzestępczość, nadzór masowy i system karny.',
      en: 'Crime in China — corruption, cybercrime, mass surveillance and the penal system.',
      de: 'Kriminalität in China — Korruption, Cyberkriminalität, Massenüberwachung und das Strafsystem.',
    },
    'Czechy': {
      pl: 'Przestępczość w Czechach — cyberprzestępczość, oszustwa, bezpieczeństwo i współpraca policyjna z Polską.',
      en: 'Crime in the Czech Republic — cybercrime, fraud, public safety and police cooperation with Poland.',
      de: 'Kriminalität in Tschechien — Cyberkriminalität, Betrug, Sicherheit und Polizeikooperation mit Polen.',
    },
    'Szwajcaria': {
      pl: 'Przestępczość w Szwajcarii — pranie pieniędzy, oszustwa bankowe, cyberbezpieczeństwo i przestępczość białych kołnierzyków.',
      en: 'Crime in Switzerland — money laundering, banking fraud, cybersecurity and white-collar crime.',
      de: 'Kriminalität in der Schweiz — Geldwäsche, Bankbetrug, Cybersicherheit und Wirtschaftskriminalität.',
    },
    'Izrael': {
      pl: 'Przestępczość w Izraelu — przestępczość zorganizowana, terroryzm, cyberbezpieczeństwo i korupcja.',
      en: 'Crime in Israel — organized crime, terrorism, cybersecurity and corruption.',
      de: 'Kriminalität in Israel — organisierte Kriminalität, Terrorismus, Cybersicherheit und Korruption.',
    },
    'Holandia': {
      pl: 'Przestępczość w Holandii — narkotyki, mafie mokro, zabójstwa zlecone i cyberprzestępczość.',
      en: 'Crime in the Netherlands — drugs, the Mocro Mafia, contract killings and cybercrime.',
      de: 'Kriminalität in den Niederlanden — Drogen, die Mocro-Mafia, Auftragsmorde und Cyberkriminalität.',
    },
  },

  // ═══════════════════════════════════════════
  // STYL ŻYCIA (Lifestyle)
  // ═══════════════════════════════════════════
  'Styl Życia': {
    'Polska': {
      pl: 'Styl życia w Polsce — zdrowie, moda, podróże, gastronomia i trendy konsumenckie.',
      en: 'Lifestyle in Poland — health, fashion, travel, gastronomy and consumer trends.',
      de: 'Lebensstil in Polen — Gesundheit, Mode, Reisen, Gastronomie und Verbrauchertrends.',
    },
    'Niemcy': {
      pl: 'Styl życia w Niemczech — ekologia, rowerowa kultura, piwo rzemieślnicze, podróże i wellness.',
      en: 'Lifestyle in Germany — ecology, cycling culture, craft beer, travel and wellness.',
      de: 'Lebensstil in Deutschland — Ökologie, Fahrradkultur, Craft-Bier, Reisen und Wellness.',
    },
    'Włochy': {
      pl: 'Styl życia we Włoszech — la dolce vita, kuchnia, moda, wino i kultura kawiarniana.',
      en: 'Lifestyle in Italy — la dolce vita, cuisine, fashion, wine and café culture.',
      de: 'Lebensstil in Italien — la dolce vita, Küche, Mode, Wein und Cafékultur.',
    },
    'USA': {
      pl: 'Styl życia w USA — wellness, fitness, fast food vs zdrowe jedzenie, technologia i trendy.',
      en: 'Lifestyle in the USA — wellness, fitness, fast food vs healthy eating, technology and trends.',
      de: 'Lebensstil in den USA — Wellness, Fitness, Fast Food vs. gesundes Essen, Technologie und Trends.',
    },
    'Hiszpania': {
      pl: 'Styl życia w Hiszpanii — sjesta, tapas, plaże, fiesty i kultura śródziemnomorska.',
      en: 'Lifestyle in Spain — siesta, tapas, beaches, fiestas and Mediterranean culture.',
      de: 'Lebensstil in Spanien — Siesta, Tapas, Strände, Fiestas und mediterrane Kultur.',
    },
    'Francja': {
      pl: 'Styl życia we Francji — gastronomia, wino, moda paryska, art de vivre i wellness.',
      en: 'Lifestyle in France — gastronomy, wine, Parisian fashion, art de vivre and wellness.',
      de: 'Lebensstil in Frankreich — Gastronomie, Wein, Pariser Mode, Art de vivre und Wellness.',
    },
    'Rosja': {
      pl: 'Styl życia w Rosji — daczy, kuchnia rosyjska, bania, zima i tradycje kulturowe.',
      en: 'Lifestyle in Russia — dachas, Russian cuisine, the banya, winter and cultural traditions.',
      de: 'Lebensstil in Russland — Datschen, russische Küche, Banja, Winter und kulturelle Traditionen.',
    },
    'Ukraina': {
      pl: 'Styl życia na Ukrainie — życie codzienne w czasie wojny, kuchnia, tradycje i odporność.',
      en: 'Lifestyle in Ukraine — daily life during wartime, cuisine, traditions and resilience.',
      de: 'Lebensstil in der Ukraine — Alltag in Kriegszeiten, Küche, Traditionen und Widerstandsfähigkeit.',
    },
    'Austria': {
      pl: 'Styl życia w Austrii — kultura kawiarni, narciarstwo, Heuriger, tradycje alpejskie i jakość życia.',
      en: 'Lifestyle in Austria — café culture, skiing, Heuriger, Alpine traditions and quality of life.',
      de: 'Lebensstil in Österreich — Kaffeehauskultur, Skifahren, Heuriger, alpine Traditionen und Lebensqualität.',
    },
    'Wielka Brytania': {
      pl: 'Styl życia w Wielkiej Brytanii — herbata, puby, ogrodnictwo, moda londyńska i BBC lifestyle.',
      en: 'Lifestyle in the UK — tea, pubs, gardening, London fashion and BBC lifestyle.',
      de: 'Lebensstil in Großbritannien — Tee, Pubs, Gartenarbeit, Londoner Mode und BBC Lifestyle.',
    },
    'Chiny': {
      pl: 'Styl życia w Chinach — herbata, e-commerce, social media, tradycyjna medycyna i megamiasta.',
      en: 'Lifestyle in China — tea, e-commerce, social media, traditional medicine and megacities.',
      de: 'Lebensstil in China — Tee, E-Commerce, Social Media, traditionelle Medizin und Megacities.',
    },
    'Czechy': {
      pl: 'Styl życia w Czechach — piwo, Praga, kultura kawiarniana, turystyka i tradycje kulinarne.',
      en: 'Lifestyle in the Czech Republic — beer, Prague, café culture, tourism and culinary traditions.',
      de: 'Lebensstil in Tschechien — Bier, Prag, Cafékultur, Tourismus und kulinarische Traditionen.',
    },
    'Szwajcaria': {
      pl: 'Styl życia w Szwajcarii — czekolada, zegarki, góry, jakość życia i outdoor.',
      en: 'Lifestyle in Switzerland — chocolate, watches, mountains, quality of life and outdoor activities.',
      de: 'Lebensstil in der Schweiz — Schokolade, Uhren, Berge, Lebensqualität und Outdoor-Aktivitäten.',
    },
    'Izrael': {
      pl: 'Styl życia w Izraelu — Tel Awiw, plaże, kuchnia lewantyńska, startupy i innowacje.',
      en: 'Lifestyle in Israel — Tel Aviv, beaches, Levantine cuisine, startups and innovation.',
      de: 'Lebensstil in Israel — Tel Aviv, Strände, levantinische Küche, Start-ups und Innovation.',
    },
    'Holandia': {
      pl: 'Styl życia w Holandii — rowery, design, tulipany, kawiarniana kultura i work-life balance.',
      en: 'Lifestyle in the Netherlands — cycling, design, tulips, café culture and work-life balance.',
      de: 'Lebensstil in den Niederlanden — Radfahren, Design, Tulpen, Cafékultur und Work-Life-Balance.',
    },
  },

  // ═══════════════════════════════════════════
  // POGODA I ŚRODOWISKO (Weather & Environment)
  // ═══════════════════════════════════════════
  'Pogoda i Środowisko': {
    'Polska': {
      pl: 'Pogoda i środowisko w Polsce — smog, powodzie, prognozy, Bałtyk i polityka klimatyczna.',
      en: 'Weather and environment in Poland — smog, floods, forecasts, the Baltic Sea and climate policy.',
      de: 'Wetter und Umwelt in Polen — Smog, Hochwasser, Vorhersagen, die Ostsee und Klimapolitik.',
    },
    'Niemcy': {
      pl: 'Pogoda i środowisko w Niemczech — Energiewende, powodzie, las deszczowy, wiatraki i transformacja energetyczna.',
      en: 'Weather and environment in Germany — the Energiewende, floods, forests, wind farms and the energy transition.',
      de: 'Wetter und Umwelt in Deutschland — Energiewende, Hochwasser, Wälder, Windkraft und Energietransformation.',
    },
    'Włochy': {
      pl: 'Pogoda i środowisko we Włoszech — klimat śródziemnomorski, powodzie, Etna, susze i ochrona wybrzeża.',
      en: 'Weather and environment in Italy — Mediterranean climate, floods, Etna, droughts and coastal protection.',
      de: 'Wetter und Umwelt in Italien — Mittelmeerklima, Hochwasser, Ätna, Dürren und Küstenschutz.',
    },
    'USA': {
      pl: 'Pogoda i środowisko w USA — huragany, pożary, tornada, zmiany klimatyczne i polityka EPA.',
      en: 'Weather and environment in the USA — hurricanes, wildfires, tornadoes, climate change and EPA policy.',
      de: 'Wetter und Umwelt in den USA — Hurrikane, Waldbrände, Tornados, Klimawandel und EPA-Politik.',
    },
    'Hiszpania': {
      pl: 'Pogoda i środowisko w Hiszpanii — susze, pożary, pustynnienie, upały i odnawialne źródła energii.',
      en: 'Weather and environment in Spain — droughts, wildfires, desertification, heatwaves and renewable energy.',
      de: 'Wetter und Umwelt in Spanien — Dürren, Waldbrände, Wüstenbildung, Hitzewellen und erneuerbare Energien.',
    },
    'Francja': {
      pl: 'Pogoda i środowisko we Francji — energia jądrowa, fale upałów, powodzie, Alpy i polityka klimatyczna.',
      en: 'Weather and environment in France — nuclear energy, heatwaves, floods, the Alps and climate policy.',
      de: 'Wetter und Umwelt in Frankreich — Kernenergie, Hitzewellen, Hochwasser, die Alpen und Klimapolitik.',
    },
    'Rosja': {
      pl: 'Pogoda i środowisko w Rosji — topnienie wiecznej zmarzliny, pożary Syberii, Arktyka i emisje CO₂.',
      en: 'Weather and environment in Russia — melting permafrost, Siberian fires, the Arctic and CO₂ emissions.',
      de: 'Wetter und Umwelt in Russland — schmelzender Permafrost, sibirische Brände, die Arktis und CO₂-Emissionen.',
    },
    'Ukraina': {
      pl: 'Pogoda i środowisko na Ukrainie — zniszczenia wojenne, katastrofa ekologiczna w Kachowce, rolnictwo i rekultywacja.',
      en: 'Weather and environment in Ukraine — wartime destruction, the Kakhovka ecological disaster, agriculture and land reclamation.',
      de: 'Wetter und Umwelt in der Ukraine — Kriegszerstörungen, die Kachowka-Umweltkatastrophe, Landwirtschaft und Rekultivierung.',
    },
    'Austria': {
      pl: 'Pogoda i środowisko w Austrii — Alpy, lodowce, lawiny, energia wodna i zrównoważony rozwój.',
      en: 'Weather and environment in Austria — the Alps, glaciers, avalanches, hydropower and sustainability.',
      de: 'Wetter und Umwelt in Österreich — die Alpen, Gletscher, Lawinen, Wasserkraft und Nachhaltigkeit.',
    },
    'Wielka Brytania': {
      pl: 'Pogoda i środowisko w Wielkiej Brytanii — sztormy, powodzie, farmy wiatrowe, Morze Północne i net zero.',
      en: 'Weather and environment in the UK — storms, floods, wind farms, the North Sea and net zero.',
      de: 'Wetter und Umwelt in Großbritannien — Stürme, Hochwasser, Windparks, die Nordsee und Netto-Null.',
    },
    'Chiny': {
      pl: 'Pogoda i środowisko w Chinach — smog, powodzie, Jangcy, panele solarne i największy emitent CO₂.',
      en: 'Weather and environment in China — smog, floods, the Yangtze, solar panels and the world\'s largest CO₂ emitter.',
      de: 'Wetter und Umwelt in China — Smog, Hochwasser, der Jangtse, Solarpanels und der weltweit größte CO₂-Emittent.',
    },
    'Czechy': {
      pl: 'Pogoda i środowisko w Czechach — węgiel brunatny, jakość powietrza, lasy i transformacja energetyczna.',
      en: 'Weather and environment in the Czech Republic — brown coal, air quality, forests and the energy transition.',
      de: 'Wetter und Umwelt in Tschechien — Braunkohle, Luftqualität, Wälder und Energietransformation.',
    },
    'Szwajcaria': {
      pl: 'Pogoda i środowisko w Szwajcarii — topniejące lodowce, Alpy, energia wodna i ochrona przyrody.',
      en: 'Weather and environment in Switzerland — melting glaciers, the Alps, hydropower and nature conservation.',
      de: 'Wetter und Umwelt in der Schweiz — schmelzende Gletscher, die Alpen, Wasserkraft und Naturschutz.',
    },
    'Izrael': {
      pl: 'Pogoda i środowisko w Izraelu — pustynnienie, odsalanie wody, innowacje rolnicze i Morze Martwe.',
      en: 'Weather and environment in Israel — desertification, water desalination, agricultural innovation and the Dead Sea.',
      de: 'Wetter und Umwelt in Israel — Wüstenbildung, Wasserentsalzung, landwirtschaftliche Innovation und das Tote Meer.',
    },
    'Holandia': {
      pl: 'Pogoda i środowisko w Holandii — ochrona przed morzem, Delta Works, wiatraki, rolnictwo i polder.',
      en: 'Weather and environment in the Netherlands — sea defense, the Delta Works, wind turbines, agriculture and polders.',
      de: 'Wetter und Umwelt in den Niederlanden — Meeresschutz, die Deltawerke, Windkraft, Landwirtschaft und Polder.',
    },
  },

  // ═══════════════════════════════════════════
  // NAUKA I TECHNOLOGIA (Science & Technology)
  // ═══════════════════════════════════════════
  'Nauka i Technologia': {
    'Polska': {
      pl: 'Nauka i technologia w Polsce — startupy, uczelnie, badania kosmiczne, AI i inwestycje w R&D.',
      en: 'Science and technology in Poland — startups, universities, space research, AI and R&D investment.',
      de: 'Wissenschaft und Technologie in Polen — Start-ups, Universitäten, Weltraumforschung, KI und F&E-Investitionen.',
    },
    'Niemcy': {
      pl: 'Nauka i technologia w Niemczech — Fraunhofer, Industrie 4.0, motoryzacja elektryczna, AI i patenty.',
      en: 'Science and technology in Germany — Fraunhofer, Industry 4.0, electric vehicles, AI and patents.',
      de: 'Wissenschaft und Technologie in Deutschland — Fraunhofer, Industrie 4.0, Elektromobilität, KI und Patente.',
    },
    'Włochy': {
      pl: 'Nauka i technologia we Włoszech — ESA, CERN, robotyka, lotnictwo i design przemysłowy.',
      en: 'Science and technology in Italy — ESA, CERN, robotics, aviation and industrial design.',
      de: 'Wissenschaft und Technologie in Italien — ESA, CERN, Robotik, Luftfahrt und Industriedesign.',
    },
    'USA': {
      pl: 'Nauka i technologia w USA — Dolina Krzemowa, NASA, AI, Big Tech i biotechnologia.',
      en: 'Science and technology in the USA — Silicon Valley, NASA, AI, Big Tech and biotechnology.',
      de: 'Wissenschaft und Technologie in den USA — Silicon Valley, NASA, KI, Big Tech und Biotechnologie.',
    },
    'Hiszpania': {
      pl: 'Nauka i technologia w Hiszpanii — energia słoneczna, startupy, telekomunikacja i badania morskie.',
      en: 'Science and technology in Spain — solar energy, startups, telecommunications and marine research.',
      de: 'Wissenschaft und Technologie in Spanien — Solarenergie, Start-ups, Telekommunikation und Meeresforschung.',
    },
    'Francja': {
      pl: 'Nauka i technologia we Francji — Ariane, ITER, AI, startupy i badania jądrowe.',
      en: 'Science and technology in France — Ariane, ITER, AI, startups and nuclear research.',
      de: 'Wissenschaft und Technologie in Frankreich — Ariane, ITER, KI, Start-ups und Kernforschung.',
    },
    'Rosja': {
      pl: 'Nauka i technologia w Rosji — Roskosmos, izolacja naukowa, cyberwojna i militaryzacja technologii.',
      en: 'Science and technology in Russia — Roscosmos, scientific isolation, cyberwarfare and technology militarization.',
      de: 'Wissenschaft und Technologie in Russland — Roskosmos, wissenschaftliche Isolation, Cyberkrieg und Technologiemilitarisierung.',
    },
    'Ukraina': {
      pl: 'Nauka i technologia na Ukrainie — drony, IT, cyberbezpieczeństwo, innowacje wojenne i Diia.',
      en: 'Science and technology in Ukraine — drones, IT, cybersecurity, wartime innovation and Diia.',
      de: 'Wissenschaft und Technologie in der Ukraine — Drohnen, IT, Cybersicherheit, Kriegsinnovationen und Diia.',
    },
    'Austria': {
      pl: 'Nauka i technologia w Austrii — badania medyczne, fizyka kwantowa, AI i współpraca z CERN.',
      en: 'Science and technology in Austria — medical research, quantum physics, AI and CERN collaboration.',
      de: 'Wissenschaft und Technologie in Österreich — Medizinforschung, Quantenphysik, KI und CERN-Zusammenarbeit.',
    },
    'Wielka Brytania': {
      pl: 'Nauka i technologia w Wielkiej Brytanii — Oxford, Cambridge, DeepMind, fintech i farmacja.',
      en: 'Science and technology in the UK — Oxford, Cambridge, DeepMind, fintech and pharmaceuticals.',
      de: 'Wissenschaft und Technologie in Großbritannien — Oxford, Cambridge, DeepMind, Fintech und Pharma.',
    },
    'Chiny': {
      pl: 'Nauka i technologia w Chinach — 5G, AI, kosmonautyka, kwanty i rywalizacja technologiczna z USA.',
      en: 'Science and technology in China — 5G, AI, space program, quantum computing and tech rivalry with the US.',
      de: 'Wissenschaft und Technologie in China — 5G, KI, Raumfahrt, Quantencomputer und Technologierivalität mit den USA.',
    },
    'Czechy': {
      pl: 'Nauka i technologia w Czechach — laser ELI, IT, cyberbezpieczeństwo i współpraca naukowa z Polską.',
      en: 'Science and technology in the Czech Republic — the ELI laser, IT, cybersecurity and scientific cooperation with Poland.',
      de: 'Wissenschaft und Technologie in Tschechien — der ELI-Laser, IT, Cybersicherheit und wissenschaftliche Zusammenarbeit mit Polen.',
    },
    'Szwajcaria': {
      pl: 'Nauka i technologia w Szwajcarii — CERN, ETH Zürich, farmacja, fintech i innowacje medyczne.',
      en: 'Science and technology in Switzerland — CERN, ETH Zurich, pharmaceuticals, fintech and medical innovation.',
      de: 'Wissenschaft und Technologie in der Schweiz — CERN, ETH Zürich, Pharma, Fintech und medizinische Innovation.',
    },
    'Izrael': {
      pl: 'Nauka i technologia w Izraelu — cyberbezpieczeństwo, startup nation, AI, agritech i Iron Dome.',
      en: 'Science and technology in Israel — cybersecurity, startup nation, AI, agritech and Iron Dome.',
      de: 'Wissenschaft und Technologie in Israel — Cybersicherheit, Start-up-Nation, KI, Agritech und Iron Dome.',
    },
    'Holandia': {
      pl: 'Nauka i technologia w Holandii — ASML, Eindhoven, chipy, agritech i inżynieria wodna.',
      en: 'Science and technology in the Netherlands — ASML, Eindhoven, semiconductors, agritech and water engineering.',
      de: 'Wissenschaft und Technologie in den Niederlanden — ASML, Eindhoven, Halbleiter, Agritech und Wasserbau.',
    },
  },
};
