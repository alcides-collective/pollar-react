/**
 * Wikipedia Polish Polling Scraper
 * Fetches and parses polling data from Wikipedia
 */

export interface PollResult {
  pollster: string;
  date: string;
  sampleSize: number | null;
  results: {
    PiS: number | null;
    KO: number | null;
    Polska2050: number | null;
    PSL: number | null;
    Lewica: number | null;
    Razem: number | null;
    Konfederacja: number | null;
    KKP: number | null;
  };
  lead: number | null;
  leader: string | null;
}

export interface PollingData {
  polls: PollResult[];
  lastUpdate: string;
  source: string;
}

export interface WeightedAverageResult {
  average: PollResult['results'];
  uncertainty: PollResult['results'];
  trend: PollResult['results'];
  meta: {
    volatility: number;
    halfLife: number;
    pollsUsed: number;
    houseEffectsApplied: number;
  };
}

const PAGE_TITLE = 'Opinion_polling_for_the_next_Polish_parliamentary_election';
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const POLL_SECTIONS = [6, 7, 8]; // 2026, 2025, 2024

type PartyKey = keyof PollResult['results'];
const PARTIES: PartyKey[] = ['PiS', 'KO', 'Polska2050', 'PSL', 'Lewica', 'Razem', 'Konfederacja', 'KKP'];

function parseNumber(text: string): number | null {
  if (!text) return null;
  const cleaned = text
    .replace(/\[\[.*?\|(.*?)\]\]/g, '$1')
    .replace(/\[\[.*?\]\]/g, '')
    .replace(/<ref[^>]*>.*?<\/ref>/g, '')
    .replace(/<ref[^/]*\/>/g, '')
    .replace(/'''?/g, '')
    .replace(/style="[^"]*"/g, '')
    .replace(/background:[^;|]*/g, '')
    .replace(/\{\{.*?\}\}/g, '')
    .replace(/[^\d.,]/g, '')
    .replace(',', '.')
    .trim();

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDate(text: string): string {
  const sortMatch = text.match(/data-sort-value="(\d{4}-\d{2}-\d{2})"/);
  if (sortMatch) return sortMatch[1];

  const cleaned = text
    .replace(/\[\[.*?\|(.*?)\]\]/g, '$1')
    .replace(/\[\[.*?\]\]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/'''?/g, '')
    .trim();

  return cleaned;
}

function parsePollster(text: string): string {
  const extMatch = text.match(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/);
  if (extMatch) return extMatch[1].trim();

  const wikiMatch = text.match(/\[\[.*?\|([^\]]+)\]\]/);
  if (wikiMatch) return wikiMatch[1].trim();

  const simpleWikiMatch = text.match(/\[\[([^\]|]+)\]\]/);
  if (simpleWikiMatch) return simpleWikiMatch[1].trim();

  return text.replace(/\[.*?\]/g, '').replace(/'''?/g, '').trim();
}

function determineLeader(leadCell: string): string | null {
  if (leadCell.includes('Law and Justice') || leadCell.includes('PiS')) return 'PiS';
  if (leadCell.includes('Civic Coalition') || leadCell.includes('KO')) return 'KO';
  if (leadCell.includes('Konfederacja')) return 'Konfederacja';
  if (leadCell.includes('Lewica')) return 'Lewica';
  return null;
}

function parseTableRow(row: string): PollResult | null {
  if (row.includes('Polling firm') || row.includes('colspan') ||
      row.includes('parliamentary election') || row.includes('background:#A0A0A0') ||
      row.includes('background:#EFEFEF')) {
    return null;
  }

  const cells = row.split(/\|\||\n\|/).map(c => c.trim()).filter(c => c && !c.startsWith('!'));

  if (cells.length < 10) return null;

  try {
    const pollster = parsePollster(cells[0] || '');
    if (!pollster || pollster.length < 2) return null;

    const date = parseDate(cells[1] || '');
    const sampleSize = parseNumber(cells[2] || '');

    const results = {
      PiS: parseNumber(cells[3] || ''),
      KO: parseNumber(cells[4] || ''),
      Polska2050: parseNumber(cells[5] || ''),
      PSL: parseNumber(cells[6] || ''),
      Lewica: parseNumber(cells[7] || ''),
      Razem: parseNumber(cells[8] || ''),
      Konfederacja: parseNumber(cells[9] || ''),
      KKP: parseNumber(cells[10] || ''),
    };

    const hasResults = Object.values(results).some(v => v !== null && v > 0);
    if (!hasResults) return null;

    const leadCell = cells[cells.length - 1] || '';
    const lead = parseNumber(leadCell);
    const leader = determineLeader(leadCell);

    return { pollster, date, sampleSize, results, lead, leader };
  } catch {
    return null;
  }
}

function parsePolls(wikitext: string): PollResult[] {
  const polls: PollResult[] = [];
  const rows = wikitext.split(/\n\|-/).filter(r => r.trim());

  for (const row of rows) {
    const poll = parseTableRow(row);
    if (poll) polls.push(poll);
  }

  return polls;
}

export async function fetchPolishPolls(): Promise<PollingData> {
  const allPolls: PollResult[] = [];

  for (const section of POLL_SECTIONS) {
    try {
      const url = `${WIKIPEDIA_API}?action=parse&page=${PAGE_TITLE}&prop=wikitext&section=${section}&format=json&origin=*`;
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      const wikitext = data.parse?.wikitext?.['*'] || '';
      if (wikitext) {
        const polls = parsePolls(wikitext);
        allPolls.push(...polls);
      }
    } catch (e) {
      console.error(`Failed to fetch section ${section}:`, e);
    }
  }

  allPolls.sort((a, b) => {
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    return dateB - dateA;
  });

  return {
    polls: allPolls,
    lastUpdate: new Date().toISOString(),
    source: `https://en.wikipedia.org/wiki/${PAGE_TITLE}`,
  };
}

// Weighted average calculation
function getDaysAgo(dateStr: string, referenceDate?: Date): number {
  const pollDate = new Date(dateStr);
  if (isNaN(pollDate.getTime())) return 30;
  const ref = referenceDate || new Date();
  return Math.max(0, (ref.getTime() - pollDate.getTime()) / (1000 * 60 * 60 * 24));
}

function filterPollsBeforeDate(polls: PollResult[], beforeDate: Date): PollResult[] {
  return polls.filter(poll => {
    const pollDate = new Date(poll.date);
    return !isNaN(pollDate.getTime()) && pollDate < beforeDate;
  });
}

function calculateVolatility(polls: PollResult[]): number {
  if (polls.length < 3) return 0.5;

  const changes: number[] = [];
  for (let i = 0; i < Math.min(polls.length - 1, 15); i++) {
    const curr = polls[i];
    const prev = polls[i + 1];

    for (const party of ['KO', 'PiS'] as PartyKey[]) {
      const currVal = curr.results[party];
      const prevVal = prev.results[party];
      if (currVal !== null && prevVal !== null) {
        changes.push(Math.abs(currVal - prevVal));
      }
    }
  }

  if (changes.length === 0) return 0.5;
  const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
  const variance = changes.reduce((sum, x) => sum + (x - mean) ** 2, 0) / changes.length;
  return Math.sqrt(variance);
}

function calculateSimpleAverage(polls: PollResult[]): PollResult['results'] {
  const sum: Record<PartyKey, number> = { PiS: 0, KO: 0, Polska2050: 0, PSL: 0, Lewica: 0, Razem: 0, Konfederacja: 0, KKP: 0 };
  const counts: Record<PartyKey, number> = { ...sum };

  for (const poll of polls) {
    for (const party of PARTIES) {
      const value = poll.results[party];
      if (value !== null) {
        sum[party] += value;
        counts[party]++;
      }
    }
  }

  const result: PollResult['results'] = { PiS: null, KO: null, Polska2050: null, PSL: null, Lewica: null, Razem: null, Konfederacja: null, KKP: null };
  for (const party of PARTIES) {
    if (counts[party] > 0) {
      result[party] = Math.round((sum[party] / counts[party]) * 10) / 10;
    }
  }
  return result;
}

function calculateHouseEffects(polls: PollResult[], minPolls: number = 3): Map<string, Map<PartyKey, number>> {
  const byPollster = new Map<string, PollResult[]>();
  for (const poll of polls) {
    const name = poll.pollster.toLowerCase().trim();
    if (!byPollster.has(name)) byPollster.set(name, []);
    byPollster.get(name)!.push(poll);
  }

  const consensus = calculateSimpleAverage(polls);
  const houseEffects = new Map<string, Map<PartyKey, number>>();

  for (const [pollster, pollsterPolls] of byPollster) {
    if (pollsterPolls.length < minPolls) continue;

    const effects = new Map<PartyKey, number>();
    for (const party of PARTIES) {
      const consensusVal = consensus[party];
      if (consensusVal === null) continue;

      const values = pollsterPolls.map(p => p.results[party]).filter((v): v is number => v !== null);
      if (values.length < minPolls) continue;

      const pollsterAvg = values.reduce((a, b) => a + b, 0) / values.length;
      const effect = pollsterAvg - consensusVal;

      if (Math.abs(effect) > 0.5) {
        effects.set(party, effect);
      }
    }

    if (effects.size > 0) {
      houseEffects.set(pollster, effects);
    }
  }

  return houseEffects;
}

function applyHouseEffect(poll: PollResult, houseEffects: Map<string, Map<PartyKey, number>>): PollResult['results'] {
  const pollsterKey = poll.pollster.toLowerCase().trim();
  const effects = houseEffects.get(pollsterKey);
  const corrected = { ...poll.results };

  if (effects) {
    for (const party of PARTIES) {
      const value = corrected[party];
      const effect = effects.get(party);
      if (value !== null && effect !== undefined) {
        corrected[party] = value - effect;
      }
    }
  }

  return corrected;
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, x) => sum + (x - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function calculateWeightedAverageInternal(
  polls: PollResult[],
  houseEffects: Map<string, Map<PartyKey, number>>,
  halfLife: number,
  referenceDate: Date,
  maxPolls: number = 20
): PollResult['results'] {
  const recentPolls = polls.slice(0, maxPolls);
  const emptyResults: PollResult['results'] = { PiS: null, KO: null, Polska2050: null, PSL: null, Lewica: null, Razem: null, Konfederacja: null, KKP: null };

  if (recentPolls.length === 0) return emptyResults;

  const weightedPolls: Array<{ correctedResults: PollResult['results']; weight: number }> = [];

  for (const poll of recentPolls) {
    const correctedResults = applyHouseEffect(poll, houseEffects);
    const daysAgo = getDaysAgo(poll.date, referenceDate);
    const recencyWeight = Math.pow(0.5, daysAgo / halfLife);
    const sampleWeight = poll.sampleSize ? Math.sqrt(poll.sampleSize / 1000) : 1.0;
    const weight = recencyWeight * Math.min(sampleWeight, 1.5);
    weightedPolls.push({ correctedResults, weight });
  }

  const average: PollResult['results'] = { ...emptyResults };

  for (const party of PARTIES) {
    const partyData = weightedPolls
      .map(wp => ({ value: wp.correctedResults[party], weight: wp.weight }))
      .filter((d): d is { value: number; weight: number } => d.value !== null);

    if (partyData.length === 0) continue;

    const values = partyData.map(d => d.value);
    const median = calculateMedian(values);
    const stdDev = calculateStdDev(values, median);

    let weightedSum = 0;
    let totalWeight = 0;

    for (const { value, weight } of partyData) {
      let adjustedWeight = weight;
      if (stdDev > 0) {
        const zScore = Math.abs(value - median) / stdDev;
        if (zScore > 2) adjustedWeight *= 0.3;
        else if (zScore > 1.5) adjustedWeight *= 0.7;
      }
      weightedSum += value * adjustedWeight;
      totalWeight += adjustedWeight;
    }

    if (totalWeight > 0) {
      average[party] = weightedSum / totalWeight;
    }
  }

  return average;
}

export function calculateWeightedAverage(polls: PollResult[], maxPolls: number = 30): WeightedAverageResult {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentPolls = polls.slice(0, maxPolls);

  const emptyResults: PollResult['results'] = { PiS: null, KO: null, Polska2050: null, PSL: null, Lewica: null, Razem: null, Konfederacja: null, KKP: null };

  if (recentPolls.length === 0) {
    return {
      average: { ...emptyResults },
      uncertainty: { ...emptyResults },
      trend: { ...emptyResults },
      meta: { volatility: 0, halfLife: 14, pollsUsed: 0, houseEffectsApplied: 0 }
    };
  }

  const volatility = calculateVolatility(recentPolls);
  const halfLife = Math.max(7, Math.min(21, 14 - (volatility - 1) * 7));
  const houseEffects = calculateHouseEffects(polls.slice(0, 50), 3);

  const average = calculateWeightedAverageInternal(recentPolls, houseEffects, halfLife, now, maxPolls);

  const historicalPolls = filterPollsBeforeDate(polls, thirtyDaysAgo);
  const historicalAverage = calculateWeightedAverageInternal(historicalPolls.slice(0, maxPolls), houseEffects, halfLife, thirtyDaysAgo, maxPolls);

  const trend: PollResult['results'] = { ...emptyResults };
  for (const party of PARTIES) {
    const curr = average[party];
    const hist = historicalAverage[party];
    if (curr !== null && hist !== null) {
      trend[party] = curr - hist;
    }
  }

  const uncertainty: PollResult['results'] = { ...emptyResults };
  const weightedPolls: Array<{ correctedResults: PollResult['results']; weight: number }> = [];

  for (const poll of recentPolls) {
    const correctedResults = applyHouseEffect(poll, houseEffects);
    const daysAgo = getDaysAgo(poll.date, now);
    const recencyWeight = Math.pow(0.5, daysAgo / halfLife);
    const sampleWeight = poll.sampleSize ? Math.sqrt(poll.sampleSize / 1000) : 1.0;
    const weight = recencyWeight * Math.min(sampleWeight, 1.5);
    weightedPolls.push({ correctedResults, weight });
  }

  for (const party of PARTIES) {
    const partyData = weightedPolls
      .map(wp => ({ value: wp.correctedResults[party], weight: wp.weight }))
      .filter((d): d is { value: number; weight: number } => d.value !== null);

    if (partyData.length === 0 || average[party] === null) continue;

    let weightedSquaredDiff = 0;
    let totalWeight = 0;
    const avg = average[party]!;

    for (const { value, weight } of partyData) {
      weightedSquaredDiff += weight * (value - avg) ** 2;
      totalWeight += weight;
    }

    if (totalWeight > 0) {
      uncertainty[party] = Math.sqrt(weightedSquaredDiff / totalWeight);
    }
  }

  return {
    average,
    uncertainty,
    trend,
    meta: {
      volatility: Math.round(volatility * 100) / 100,
      halfLife: Math.round(halfLife * 10) / 10,
      pollsUsed: recentPolls.length,
      houseEffectsApplied: houseEffects.size
    }
  };
}
