/**
 * Sejm API Types for React Frontend
 * Based on SvelteKit types from pollar-sveltekit
 */

// ============ MPs (Posłowie) ============

export interface SejmMP {
  id: number;
  firstLastName: string;
  lastName: string;
  firstName: string;
  secondName?: string;
  email?: string;
  active: boolean;
  club: string;
  districtName: string;
  districtNum: number;
  voivodeship: string;
  birthDate?: string;
  birthLocation?: string;
  profession?: string;
  educationLevel?: string;
  numberOfVotes?: number;
  photoUrl: string;
  photoMiniUrl: string;
  attendance?: number;
}

export interface MPVotingStats {
  mpId: number;
  votingsCount: number;
  votingsAttendance: number;
  votingsYes: number;
  votingsNo: number;
  votingsAbstain: number;
  votingsAbsent: number;
}

export interface MPWithStats extends SejmMP {
  votingStats?: MPVotingStats;
}

// ============ Votings (Głosowania) ============

export type VoteValue = 'YES' | 'NO' | 'ABSTAIN' | 'ABSENT' | 'VOTE_VALID';

export interface IndividualVote {
  MP: number;
  vote: VoteValue;
  firstName?: string;
  lastName?: string;
  name?: string;
  club?: string;
}

export interface SejmVoting {
  term: number;
  sitting: number;
  sittingDay: number;
  votingNumber: number;
  date: string;
  title: string;
  description?: string;
  topic?: string;
  yes: number;
  no: number;
  abstain: number;
  notParticipating: number;
  totalVoted: number;
  kind: 'ELECTRONIC' | 'ON_LIST' | 'BY_RISING';
  majorityType?: string;
  result?: string;
  votes?: IndividualVote[];
}

export type VotingDetails = SejmVoting;

export interface VotingListItem {
  votingNumber: number;
  date: string;
  title: string;
  yes: number;
  no: number;
  abstain: number;
  sitting: number;
  id?: string;
}

// ============ Prints (Druki) ============

export interface PrintAttachment {
  name: string;
  lastModified: string;
  URL: string;
}

export interface SejmPrint {
  term: number;
  number: string;
  title: string;
  documentDate?: string;
  deliveryDate?: string;
  changeDate?: string;
  processPrint?: string[];
  attachments?: PrintAttachment[];
  summary?: string;
  documentType?: string;
}

export interface AffectedGroup {
  group: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface FinancialImpact {
  hasBudgetImpact: boolean;
  estimatedCost?: string;
  who?: string;
}

export interface PrintOpinion {
  stance: 'positive' | 'negative' | 'mixed' | 'neutral';
  comment: string;
  prosFromWorldview: string[];
  consFromWorldview: string[];
}

export interface PrintAIAnalysis {
  summary: string;
  tldr: string;
  tags: string[];
  affectedGroups: AffectedGroup[];
  keyChanges: string[];
  financialImpact: FinancialImpact;
  complexity: 'simple' | 'medium' | 'complex';
  controversy: 'low' | 'medium' | 'high';
  relatedTopics: string[];
  opinion: PrintOpinion;
}

export interface PrintAISummary {
  printNumber: string;
  analysis: PrintAIAnalysis;
  generatedAt: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  attachmentsProcessed: string[];
  totalCharacters: number;
  cached: boolean;
}

// ============ Interpellations (Interpelacje) ============

export interface InterpellationReply {
  key: string;
  from: string;
  receiptDate: string;
  lastModified: string;
}

export interface SejmInterpellation {
  term: number;
  num: number;
  title: string;
  from: string[];
  to: string[];
  sentDate: string;
  receiptDate?: string;
  lastModified: string;
  replies?: InterpellationReply[];
  bodyLink?: string;
  fromMember?: { firstLastName: string };
}

// ============ API Response Types ============

export interface MPsResponse {
  items: SejmMP[];
  count: number;
  lastUpdate: string;
  clubs: string[];
}

export interface VotingsResponse {
  items: VotingListItem[];
  count: number;
  total: number;
  hasMore: boolean;
  lastUpdate: string | null;
}

export interface PrintsResponse {
  items: SejmPrint[];
  count: number;
  total: number;
  hasMore: boolean;
  lastUpdate: string | null;
}

export interface InterpellationsResponse {
  items: SejmInterpellation[];
  count: number;
  total: number;
  hasMore: boolean;
  lastUpdate: string | null;
}

export interface SejmStats {
  mps: {
    total: number;
    active: number;
    byClub: Record<string, number>;
  };
  votings: {
    recent: number;
    lastUpdate?: string;
  };
  prints: {
    recent: number;
    lastUpdate?: string;
  };
  interpellations: {
    recent: number;
    lastUpdate?: string;
  };
}

// ============ Clubs (Kluby i koła) ============

export interface SejmClub {
  id: string;
  name: string;
  membersCount: number;
  phone?: string;
  fax?: string;
  email?: string;
  logoUrl?: string;
}

// ============ Committees (Komisje) ============

export interface CommitteeMember {
  id: number;
  firstLastName: string;
  club: string;
  function?: string;
}

export interface SejmCommittee {
  code: string;
  name: string;
  nameGenitive?: string;
  type: 'standing' | 'extraordinary' | 'investigative';
  phone?: string;
  appointmentDate?: string;
  scope?: string;
  compositionDate?: string;
  members?: CommitteeMember[];
  presidium?: CommitteeMember[];
  subcommittees?: string[];
}

export interface CommitteeSitting {
  num: number;
  date: string;
  agenda?: string;
  closed?: boolean;
  remote?: boolean;
  jointWith?: string[];
  videoLink?: string;
  playerLink?: string;
  playerLinkIFrame?: string;
}

// ============ Written Questions (Zapytania) ============

export interface WrittenQuestionReply {
  key: string;
  from: string;
  receiptDate: string;
  onlyAttachment?: boolean;
  attachments?: { name: string; URL: string }[];
}

export interface SejmWrittenQuestion {
  term: number;
  num: number;
  title: string;
  from: number[];
  to: string[];
  sentDate: string;
  receiptDate?: string;
  lastModified: string;
  replies?: WrittenQuestionReply[];
  bodyLink?: string;
}

// ============ Proceedings (Posiedzenia) ============

export interface SejmProceeding {
  number: number;
  title: string;
  dates: string[];
  current?: boolean;
  agenda?: string;
}

// ============ Legislative Process (Proces legislacyjny) ============

export interface LegislativeStage {
  stageName: string;
  date: string;
  childStages?: LegislativeStage[];
}

export interface SejmProcess {
  number: string;
  term: number;
  title: string;
  description?: string;
  documentType?: string;
  processStartDate?: string;
  changeDate?: string;
  createdBy?: string;
  printsNumbers?: string[];
  urgencyStatus?: string;
  legislativeCommittee?: string;
  principleOfSubsidiarity?: boolean;
  UE?: boolean;
  stages?: LegislativeStage[];
  passed?: boolean;
  eli?: string;
}

// ============ Videos (Transmisje) ============

export interface SejmVideo {
  unid: string;
  title: string;
  type: 'sitting' | 'committee' | 'other';
  startDateTime?: string;
  endDateTime?: string;
  room?: string;
  videoLink?: string;
  otherVideoLinks?: string[];
  playerLink?: string;
  playerLinkIFrame?: string;
  transcriptLink?: string;
  description?: string;
  committee?: string;
}

// ============ UI Helpers ============

export const PARTY_INFO: Record<string, { name: string; short: string }> = {
  'PiS': { name: 'Prawo i Sprawiedliwość', short: 'PiS' },
  'KO': { name: 'Koalicja Obywatelska', short: 'KO' },
  'Polska2050': { name: 'Polska 2050', short: 'PL2050' },
  'PSL-TD': { name: 'PSL – Trzecia Droga', short: 'PSL' },
  'Lewica': { name: 'Lewica', short: 'Lewica' },
  'Konfederacja': { name: 'Konfederacja', short: 'Konf' },
  'Konfederacja_KP': { name: 'Konfederacja Korony Polskiej', short: 'KKP' },
  'Razem': { name: 'Razem', short: 'Razem' },
  'Republikanie': { name: 'Wolni Republikanie', short: 'WR' },
  'niez.': { name: 'Niezrzeszeni', short: 'Niez.' },
  'Niezrzeszony': { name: 'Niezrzeszeni', short: 'Niez.' },
  'TD': { name: 'Trzecia Droga', short: 'TD' },
  'PSL': { name: 'PSL', short: 'PSL' },
  'PL2050-TD': { name: 'Polska 2050 – TD', short: 'PL2050' },
  'Polska2050-TD': { name: 'Polska 2050 – TD', short: 'PL2050' },
};

export function getPartyName(club: string): string {
  return PARTY_INFO[club]?.name || club;
}

export function getPartyShort(club: string): string {
  return PARTY_INFO[club]?.short || club;
}

export const PARTY_COLORS: Record<string, { bg: string; text: string }> = {
  'PiS': { bg: 'oklch(55% 0.18 250)', text: 'white' },
  'KO': { bg: 'oklch(72% 0.16 55)', text: 'white' },
  'Polska2050': { bg: 'oklch(85% 0.16 90)', text: 'oklch(35% 0.05 90)' },
  'PSL-TD': { bg: 'oklch(62% 0.15 145)', text: 'white' },
  'Lewica': { bg: 'oklch(58% 0.22 15)', text: 'white' },
  'Konfederacja': { bg: 'oklch(32% 0.02 260)', text: 'white' },
  'Konfederacja_KP': { bg: 'oklch(40% 0.08 280)', text: 'white' },
  'Razem': { bg: 'oklch(52% 0.20 350)', text: 'white' },
  'Republikanie': { bg: 'oklch(50% 0.10 250)', text: 'white' },
  'niez.': { bg: 'oklch(72% 0.02 260)', text: 'oklch(30% 0.02 260)' },
  'Niezrzeszony': { bg: 'oklch(72% 0.02 260)', text: 'oklch(30% 0.02 260)' },
  'TD': { bg: 'oklch(62% 0.15 145)', text: 'white' },
  'PSL': { bg: 'oklch(62% 0.15 145)', text: 'white' },
  'PL2050-TD': { bg: 'oklch(82% 0.14 85)', text: 'oklch(35% 0.05 85)' },
  'Polska2050-TD': { bg: 'oklch(82% 0.14 85)', text: 'oklch(35% 0.05 85)' },
};

export function getPartyColor(club: string): { bg: string; text: string } {
  return PARTY_COLORS[club] || { bg: 'oklch(60% 0.02 260)', text: 'white' };
}

export type VoteColorInfo = { bg: string; text: string; label: string };

export const VOTE_COLORS: Record<VoteValue, VoteColorInfo> = {
  'YES': { bg: 'oklch(65% 0.18 145)', text: 'white', label: 'Za' },
  'NO': { bg: 'oklch(58% 0.20 25)', text: 'white', label: 'Przeciw' },
  'ABSTAIN': { bg: 'oklch(82% 0.12 85)', text: 'oklch(35% 0.05 85)', label: 'Wstrzymał się' },
  'ABSENT': { bg: 'oklch(72% 0.02 260)', text: 'oklch(35% 0.02 260)', label: 'Nieobecny' },
  'VOTE_VALID': { bg: 'oklch(60% 0.14 250)', text: 'white', label: 'Głos ważny' },
};

export function getVoteColor(vote: VoteValue): VoteColorInfo {
  return VOTE_COLORS[vote] || { bg: 'oklch(60% 0.02 260)', text: 'white', label: vote };
}
