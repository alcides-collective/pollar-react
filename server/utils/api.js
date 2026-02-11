import { API_BASE } from '../config.js';

const SEJM_API = 'https://api.sejm.gov.pl/sejm/term10';

// In-memory cache for MPs list (10 min TTL)
let mpListCache = { data: null, timestamp: 0 };
const MP_LIST_TTL = 10 * 60 * 1000;

// Fetch event data from API
export async function fetchEventData(eventId, lang = 'pl') {
  try {
    const response = await fetch(`${API_BASE}/api/events/${eventId}?lang=${lang}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch brief data from API
export async function fetchBriefData(lang = 'pl') {
  try {
    const response = await fetch(`${API_BASE}/api/brief?lang=${lang}`);
    if (!response.ok) return null;
    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

// Fetch similar events from API (for internal linking in SSR)
export async function fetchSimilarEvents(eventId, lang = 'pl') {
  try {
    const response = await fetch(`${API_BASE}/api/events/${eventId}/similar?lang=${lang}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || data.events || []);
  } catch {
    return [];
  }
}

// Fetch felieton data from API
export async function fetchFelietonData(felietonId, lang = 'pl') {
  try {
    const response = await fetch(`${API_BASE}/api/felietony/${felietonId}?lang=${lang}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch single MP data from Sejm API
export async function fetchMPData(mpId) {
  try {
    const response = await fetch(`${SEJM_API}/MP/${mpId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch MP voting history from Sejm API
export async function fetchMPVotings(mpId, limit = 10) {
  try {
    const response = await fetch(`${SEJM_API}/MP/${mpId}/votings?limit=${limit}`);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

// Fetch all MPs list (cached 10min)
export async function fetchMPsList() {
  const now = Date.now();
  if (mpListCache.data && (now - mpListCache.timestamp) < MP_LIST_TTL) {
    return mpListCache.data;
  }
  try {
    const response = await fetch(`${SEJM_API}/MP`);
    if (!response.ok) return mpListCache.data || [];
    const data = await response.json();
    mpListCache = { data, timestamp: now };
    return data;
  } catch {
    return mpListCache.data || [];
  }
}
