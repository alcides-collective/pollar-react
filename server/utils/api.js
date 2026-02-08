import { API_BASE } from '../config.js';

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
