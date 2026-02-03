/**
 * Stock Market Types
 * Types for the /gielda section
 */

export interface Stock {
  symbol: string;
  name: string;
  shortName?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
  open?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  currency: string;
  exchange: string;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  previousClose?: number;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockHistory {
  symbol: string;
  data: HistoricalDataPoint[];
  currency: string;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: number;
}

export interface StockInfo {
  symbol: string;
  name: string;
  description: string;
}

// Predefined stock lists
export const WIG20_STOCKS: StockInfo[] = [
  { symbol: 'CDR.WA', name: 'CD Projekt', description: 'Producent gier wideo, twórca Wiedźmina i Cyberpunk 2077' },
  { symbol: 'PKN.WA', name: 'PKN Orlen', description: 'Koncern paliwowo-energetyczny, rafinerie i stacje benzynowe' },
  { symbol: 'ALE.WA', name: 'Allegro', description: 'Największa platforma e-commerce w Polsce' },
  { symbol: 'KGH.WA', name: 'KGHM', description: 'Wydobycie i przetwórstwo miedzi oraz metali szlachetnych' },
  { symbol: 'PZU.WA', name: 'PZU', description: 'Największy ubezpieczyciel w Polsce i Europie Środkowej' },
  { symbol: 'DNP.WA', name: 'Dino Polska', description: 'Sieć supermarketów spożywczych w mniejszych miejscowościach' },
  { symbol: 'LPP.WA', name: 'LPP', description: 'Odzież i moda - właściciel Reserved, Cropp, House, Mohito, Sinsay' },
  { symbol: 'PEO.WA', name: 'Bank Pekao', description: 'Drugi największy bank uniwersalny w Polsce' },
  { symbol: 'SPL.WA', name: 'Santander Bank Polska', description: 'Bank uniwersalny, część grupy Santander' },
  { symbol: 'PKO.WA', name: 'PKO BP', description: 'Największy bank w Polsce, usługi bankowe i finansowe' },
  { symbol: 'PGE.WA', name: 'PGE', description: 'Największy producent energii elektrycznej w Polsce' },
  { symbol: 'JSW.WA', name: 'JSW', description: 'Producent węgla koksowego i koksu dla przemysłu stalowego' },
  { symbol: 'CPS.WA', name: 'Cyfrowy Polsat', description: 'Media i telekomunikacja - telewizja, internet, telefonia' },
  { symbol: 'OPL.WA', name: 'Orange Polska', description: 'Operator telekomunikacyjny - telefonia i internet' },
  { symbol: 'MBK.WA', name: 'mBank', description: 'Bank internetowy i mobilny dla klientów indywidualnych i firm' },
  { symbol: 'KRU.WA', name: 'Kruk', description: 'Zarządzanie wierzytelnościami i windykacja należności' },
  { symbol: 'PCO.WA', name: 'Pepco Group', description: 'Sieć dyskontów z odzieżą i artykułami dla domu' },
  { symbol: 'ALR.WA', name: 'Alior Bank', description: 'Bank detaliczny i korporacyjny' },
  { symbol: 'BDX.WA', name: 'Budimex', description: 'Największa firma budowlana w Polsce' },
  { symbol: 'KTY.WA', name: 'Kęty', description: 'Przetwórstwo aluminium i produkcja opakowań giętkich' },
];

export const MWIG40_STOCKS: StockInfo[] = [
  { symbol: '11B.WA', name: '11 bit studios', description: 'Producent gier wideo, twórca This War of Mine i Frostpunk' },
  { symbol: 'ABE.WA', name: 'AB', description: 'Dystrybutor sprzętu IT i elektroniki użytkowej' },
  { symbol: 'ACP.WA', name: 'Asseco Poland', description: 'Największa polska firma IT, oprogramowanie dla banków i firm' },
  { symbol: 'APR.WA', name: 'Auto Partner', description: 'Dystrybutor części samochodowych' },
  { symbol: 'CCC.WA', name: 'CCC', description: 'Sieć sklepów obuwniczych i odzieżowych' },
  { symbol: 'CEL.WA', name: 'Celon Pharma', description: 'Firma biotechnologiczna, leki onkologiczne i psychiatryczne' },
  { symbol: 'CFL.WA', name: 'Cyber_Folks', description: 'Hosting, domeny internetowe, usługi chmurowe' },
  { symbol: 'KCI.WA', name: 'Kino Polska', description: 'Nadawca telewizyjny - kanały filmowe i rozrywkowe' },
  { symbol: 'ASB.WA', name: 'Asbis', description: 'Dystrybutor produktów IT w Europie Środkowo-Wschodniej' },
  { symbol: 'ASE.WA', name: 'Asseco SEE', description: 'Oprogramowanie i usługi IT dla Europy Południowo-Wschodniej' },
  { symbol: 'ATT.WA', name: 'Grupa Azoty', description: 'Producent nawozów i chemikaliów' },
  { symbol: 'BFT.WA', name: 'Benefit Systems', description: 'Karty sportowe MultiSport i programy benefitowe' },
  { symbol: 'BHW.WA', name: 'Bank Handlowy', description: 'Bank korporacyjny, część grupy Citi' },
  { symbol: 'BNP.WA', name: 'BNP Paribas Bank Polska', description: 'Bank uniwersalny, część grupy BNP Paribas' },
  { symbol: 'CAR.WA', name: 'Inter Cars', description: 'Największy dystrybutor części samochodowych w Europie Środkowej' },
  { symbol: 'DIG.WA', name: 'Diagnostyka', description: 'Sieć laboratoriów medycznych i diagnostycznych' },
  { symbol: 'DOM.WA', name: 'Dom Development', description: 'Deweloper mieszkaniowy w Warszawie i Trójmieście' },
  { symbol: 'DVL.WA', name: 'Develia', description: 'Deweloper mieszkaniowy w największych miastach Polski' },
  { symbol: 'EAT.WA', name: 'AmRest', description: 'Operator restauracji KFC, Pizza Hut, Burger King, Starbucks' },
  { symbol: 'ENA.WA', name: 'Enea', description: 'Producent i dystrybutor energii elektrycznej' },
  { symbol: 'EUR.WA', name: 'Eurocash', description: 'Hurtowa dystrybucja FMCG, sieci abc i Delikatesy Centrum' },
  { symbol: 'GPR.WA', name: 'Grupa Pracuj', description: 'Właściciel portalu Pracuj.pl - rekrutacja online' },
  { symbol: 'GPW.WA', name: 'GPW', description: 'Giełda Papierów Wartościowych w Warszawie' },
  { symbol: 'HUG.WA', name: 'Huuuge', description: 'Producent gier mobilnych typu social casino' },
  { symbol: 'ING.WA', name: 'ING Bank Śląski', description: 'Bank uniwersalny, część grupy ING' },
  { symbol: 'LBW.WA', name: 'Lubawa', description: 'Producent wyrobów włókienniczych i sprzętu wojskowego' },
  { symbol: 'MBR.WA', name: 'Mo-Bruk', description: 'Utylizacja i przetwarzanie odpadów przemysłowych' },
  { symbol: 'MIL.WA', name: 'Bank Millennium', description: 'Bank detaliczny i korporacyjny' },
  { symbol: 'MRB.WA', name: 'Mirbud', description: 'Budownictwo infrastrukturalne i kubaturowe' },
  { symbol: 'NEU.WA', name: 'Neuca', description: 'Hurtowa dystrybucja farmaceutyków' },
  { symbol: 'NWG.WA', name: 'Newag', description: 'Producent i modernizacja taboru kolejowego' },
  { symbol: 'RBW.WA', name: 'Rainbow Tours', description: 'Touroperator - organizacja wycieczek zagranicznych' },
  { symbol: 'SNT.WA', name: 'Synektik', description: 'Sprzęt medyczny i systemy informatyczne dla szpitali' },
  { symbol: 'TEN.WA', name: 'Ten Square Games', description: 'Producent gier mobilnych, twórca Fishing Clash' },
  { symbol: 'TPE.WA', name: 'Tauron', description: 'Producent i dystrybutor energii elektrycznej' },
  { symbol: 'TXT.WA', name: 'Text', description: 'Oprogramowanie do obsługi klienta - LiveChat, ChatBot' },
  { symbol: 'VRC.WA', name: 'Vercom', description: 'Platforma komunikacji biznesowej i marketing automation' },
  { symbol: 'VOX.WA', name: 'Voxel', description: 'Diagnostyka obrazowa - tomografia i rezonans magnetyczny' },
  { symbol: 'WPL.WA', name: 'Wirtualna Polska', description: 'Grupa mediowa - portale wp.pl, o2.pl, money.pl' },
  { symbol: 'XTB.WA', name: 'XTB', description: 'Broker forex i CFD, platforma inwestycyjna' },
];

export const INDICES: { symbol: string; name: string; country: string }[] = [
  { symbol: 'WIG20.WA', name: 'WIG20', country: 'PL' },
  { symbol: 'MWIG40.WA', name: 'mWIG40', country: 'PL' },
  { symbol: 'WIG.WA', name: 'WIG', country: 'PL' },
  { symbol: '^GSPC', name: 'S&P 500', country: 'US' },
  { symbol: '^IXIC', name: 'NASDAQ', country: 'US' },
  { symbol: '^DJI', name: 'Dow Jones', country: 'US' },
  { symbol: '^GDAXI', name: 'DAX', country: 'DE' },
  { symbol: '^FTSE', name: 'FTSE 100', country: 'UK' },
];

// Helper functions
export function formatPrice(price: number, currency = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

export function formatChangePercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)} mld`;
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)} mln`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)} tys`;
  }
  return volume.toString();
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_000_000_000_000) {
    return `${(marketCap / 1_000_000_000_000).toFixed(2)} bln PLN`;
  }
  if (marketCap >= 1_000_000_000) {
    return `${(marketCap / 1_000_000_000).toFixed(2)} mld PLN`;
  }
  if (marketCap >= 1_000_000) {
    return `${(marketCap / 1_000_000).toFixed(2)} mln PLN`;
  }
  return `${marketCap.toLocaleString('pl-PL')} PLN`;
}

export function getStockDisplaySymbol(symbol: string): string {
  return symbol.replace('.WA', '').replace('^', '');
}

export function getChangeColor(change: number): { text: string; bg: string } {
  if (change > 0) {
    return { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' };
  }
  if (change < 0) {
    return { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' };
  }
  return { text: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-500/10' };
}
