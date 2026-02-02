/**
 * Sejm API Client for React
 * Fetches data from /api/sejm/* endpoints
 */

import type {
  MPsResponse,
  MPWithStats,
  VotingsResponse,
  SejmVoting,
  PrintsResponse,
  InterpellationsResponse,
  SejmStats,
  SejmClub,
  SejmCommittee,
  CommitteeSitting,
  SejmWrittenQuestion,
  SejmProceeding,
  SejmProcess,
  SejmVideo,
  PrintAISummary,
} from '../types/sejm';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://pollar.up.railway.app/api';
// Call Sejm API directly - they support CORS
const SEJM_API_BASE = 'https://api.sejm.gov.pl/sejm/term10';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Custom error for Sejm API unavailability
export class SejmApiUnavailableError extends Error {
  constructor(message: string = 'API Sejmu jest tymczasowo niedostępne') {
    super(message);
    this.name = 'SejmApiUnavailableError';
  }
}

function isApiBlocked(text: string): boolean {
  return text.includes('Request Rejected') ||
         text.includes('Żądanie odrzucone') ||
         text.includes('<!doctype html>') ||
         text.includes('<!DOCTYPE html>');
}

async function fetchSejmDirect<T>(path: string): Promise<T> {
  const response = await fetch(`${SEJM_API_BASE}/${path}`);
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    if (response.status === 500) {
      throw new SejmApiUnavailableError();
    }
    throw new Error(`Sejm API error: ${response.status}`);
  }

  if (contentType.includes('text/html')) {
    const text = await response.text();
    if (isApiBlocked(text)) {
      throw new SejmApiUnavailableError();
    }
    throw new Error('Unexpected response from Sejm API');
  }

  const data = await response.json();

  if (data && typeof data === 'object' && 'error' in data) {
    throw new SejmApiUnavailableError();
  }

  return data;
}

async function fetchSejmDirectText(path: string): Promise<string> {
  const response = await fetch(`${SEJM_API_BASE}/${path}`);

  if (!response.ok) {
    if (response.status === 500) {
      throw new SejmApiUnavailableError();
    }
    throw new Error(`Sejm API error: ${response.status}`);
  }

  const text = await response.text();

  if (isApiBlocked(text)) {
    throw new SejmApiUnavailableError();
  }

  return text;
}

function getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  return params ? `${endpoint}?${JSON.stringify(params)}` : endpoint;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Check cache for GET requests
  const cacheKey = getCacheKey(endpoint, params);
  if (!fetchOptions.method || fetchOptions.method === 'GET') {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Sejm API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Cache successful GET responses
  if (!fetchOptions.method || fetchOptions.method === 'GET') {
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data;
}

export const sejmApi = {
  mps: {
    list: (params?: { club?: string; active?: boolean }) =>
      fetchAPI<MPsResponse>('/sejm/MPs', { params }),

    get: (id: number) =>
      fetchAPI<MPWithStats>(`/sejm/MPs/${id}`),
  },

  votings: {
    list: (params?: { limit?: number; offset?: number }) =>
      fetchAPI<VotingsResponse>('/sejm/votings', { params }),

    get: (sitting: number, votingNumber: number) =>
      fetchAPI<SejmVoting>(`/sejm/votings/${sitting}/${votingNumber}`),
  },

  prints: {
    list: (params?: { limit?: number; offset?: number }) =>
      fetchAPI<PrintsResponse>('/sejm/prints', { params }),

    getAISummary: async (printNumber: string): Promise<PrintAISummary | null> => {
      try {
        return await fetchAPI<PrintAISummary>(`/sejm/prints/${printNumber}/ai-summary`);
      } catch (error) {
        console.error('Failed to fetch AI summary:', error);
        return null;
      }
    },
  },

  interpellations: {
    list: (params?: { limit?: number; offset?: number }) =>
      fetchAPI<InterpellationsResponse>('/sejm/interpellations', { params }),

    fetchBody: async (_term: number, num: number): Promise<string> => {
      try {
        return await fetchSejmDirectText(`interpellations/${num}/body`);
      } catch (error) {
        console.error('Failed to fetch interpellation body:', error);
        throw error;
      }
    },
  },

  stats: () =>
    fetchAPI<SejmStats>('/sejm/stats'),

  // Direct Sejm API Endpoints
  clubs: {
    list: async (): Promise<SejmClub[]> => {
      const data = await fetchSejmDirect<any[]>('clubs');
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        membersCount: c.membersCount,
        phone: c.phone,
        fax: c.fax,
        email: c.email,
        logoUrl: `https://api.sejm.gov.pl/sejm/term10/clubs/${c.id}/logo`,
      }));
    },

    get: async (id: string): Promise<SejmClub | null> => {
      try {
        const c = await fetchSejmDirect<any>(`clubs/${id}`);
        return {
          id: c.id,
          name: c.name,
          membersCount: c.membersCount,
          phone: c.phone,
          fax: c.fax,
          email: c.email,
          logoUrl: `https://api.sejm.gov.pl/sejm/term10/clubs/${c.id}/logo`,
        };
      } catch {
        return null;
      }
    },
  },

  committees: {
    list: async (): Promise<SejmCommittee[]> => {
      const data = await fetchSejmDirect<any[]>('committees');
      return data.map((c: any) => ({
        code: c.code,
        name: c.name,
        nameGenitive: c.nameGenitive,
        type: c.type === 'standing' ? 'standing' : c.type === 'extraordinary' ? 'extraordinary' : 'investigative',
        phone: c.phone,
        appointmentDate: c.appointmentDate,
        scope: c.scope,
      }));
    },

    get: async (code: string): Promise<SejmCommittee | null> => {
      try {
        const c = await fetchSejmDirect<any>(`committees/${code}`);
        return {
          code: c.code,
          name: c.name,
          nameGenitive: c.nameGenitive,
          type: c.type === 'standing' ? 'standing' : c.type === 'extraordinary' ? 'extraordinary' : 'investigative',
          phone: c.phone,
          appointmentDate: c.appointmentDate,
          scope: c.scope,
          compositionDate: c.compositionDate,
          members: c.members?.map((m: any) => ({
            id: m.id,
            firstLastName: m.firstLastName || `${m.firstName} ${m.lastName}`,
            club: m.club,
            function: m.function,
          })),
          presidium: c.presidium?.map((m: any) => ({
            id: m.id,
            firstLastName: m.firstLastName || `${m.firstName} ${m.lastName}`,
            club: m.club,
            function: m.function,
          })),
          subcommittees: c.subcommittees,
        };
      } catch {
        return null;
      }
    },

    sittings: async (code: string): Promise<CommitteeSitting[]> => {
      try {
        const data = await fetchSejmDirect<any[]>(`committees/${code}/sittings`);
        return data.map((s: any) => ({
          num: s.num,
          date: s.date,
          agenda: s.agenda,
          closed: s.closed,
          remote: s.remote,
          jointWith: s.jointWith,
          videoLink: s.video?.videoLink,
          playerLink: s.video?.playerLink,
          playerLinkIFrame: s.video?.playerLinkIFrame,
        }));
      } catch {
        return [];
      }
    },
  },

  writtenQuestions: {
    list: async (params?: { limit?: number; offset?: number }): Promise<{ items: SejmWrittenQuestion[]; total: number }> => {
      const limit = params?.limit || 20;
      const offset = params?.offset || 0;
      const data = await fetchSejmDirect<any[]>(`writtenQuestions?limit=${limit}&offset=${offset}&sort_by=-lastModified`);
      return {
        items: data.map((q: any) => ({
          term: 10,
          num: q.num,
          title: q.title,
          from: q.from,
          to: Array.isArray(q.to) ? q.to : [q.to],
          sentDate: q.sentDate,
          receiptDate: q.receiptDate,
          lastModified: q.lastModified,
          replies: q.replies?.map((r: any) => ({
            key: r.key,
            from: r.from,
            receiptDate: r.receiptDate,
            onlyAttachment: r.onlyAttachment,
          })),
          bodyLink: `${SEJM_API_BASE}/writtenQuestions/${q.num}/body`,
        })),
        total: data.length,
      };
    },

    fetchBody: async (num: number): Promise<string> => {
      return await fetchSejmDirectText(`writtenQuestions/${num}/body`);
    },
  },

  proceedings: {
    list: async (): Promise<SejmProceeding[]> => {
      const data = await fetchSejmDirect<any[]>('proceedings');
      return data.map((p: any) => ({
        number: p.number,
        title: p.title,
        dates: p.dates,
        current: p.current,
        agenda: p.agenda,
      }));
    },

    current: async (): Promise<SejmProceeding | null> => {
      try {
        const p = await fetchSejmDirect<any>('proceedings/current');
        return {
          number: p.number,
          title: p.title,
          dates: p.dates,
          current: true,
          agenda: p.agenda,
        };
      } catch {
        return null;
      }
    },

    get: async (number: number): Promise<SejmProceeding | null> => {
      try {
        const p = await fetchSejmDirect<any>(`proceedings/${number}`);
        return {
          number: p.number,
          title: p.title,
          dates: p.dates,
          current: p.current,
          agenda: p.agenda,
        };
      } catch {
        return null;
      }
    },
  },

  processes: {
    list: async (params?: { limit?: number; passed?: boolean }): Promise<SejmProcess[]> => {
      try {
        const limit = params?.limit || 50;
        const endpoint = params?.passed ? 'processes/passed' : 'processes';
        const data = await fetchSejmDirect<any[]>(`${endpoint}?limit=${limit}`);
        return data.slice(0, limit).map((p: any) => ({
          number: p.number,
          term: p.term || 10,
          title: p.title,
          description: p.description,
          documentType: p.documentType,
          processStartDate: p.processStartDate,
          changeDate: p.changeDate,
          createdBy: p.createdBy,
          printsNumbers: p.printsConsideredJointly,
          urgencyStatus: p.urgencyStatus,
          passed: p.passed,
          eli: p.eli,
        }));
      } catch {
        return [];
      }
    },
  },

  videos: {
    list: async (params?: { limit?: number }): Promise<SejmVideo[]> => {
      try {
        const data = await fetchSejmDirect<any[]>('videos');
        const limit = params?.limit || 50;
        return data.slice(0, limit).map((v: any) => ({
          unid: v.unid,
          title: v.title,
          type: v.type === 'posiedzenie' ? 'sitting' : v.type === 'komisja' ? 'committee' : 'other',
          startDateTime: v.startDateTime,
          endDateTime: v.endDateTime,
          room: v.room,
          videoLink: v.videoLink,
          otherVideoLinks: v.otherVideoLinks,
          playerLink: v.playerLink,
          playerLinkIFrame: v.playerLinkIFrame,
          transcriptLink: v.transcriptLink,
          description: v.description,
          committee: v.committee,
        }));
      } catch {
        return [];
      }
    },

    today: async (): Promise<SejmVideo[]> => {
      try {
        const data = await fetchSejmDirect<any[]>('videos/today');
        return data.map((v: any) => ({
          unid: v.unid,
          title: v.title,
          type: v.type === 'posiedzenie' ? 'sitting' : v.type === 'komisja' ? 'committee' : 'other',
          startDateTime: v.startDateTime,
          endDateTime: v.endDateTime,
          room: v.room,
          videoLink: v.videoLink,
          playerLink: v.playerLink,
          playerLinkIFrame: v.playerLinkIFrame,
          committee: v.committee,
        }));
      } catch {
        return [];
      }
    },
  },

  clearCache: () => {
    cache.clear();
  },
};

export default sejmApi;
