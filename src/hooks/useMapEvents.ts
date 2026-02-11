import { useMemo } from 'react';
import { useEvents } from '../stores/eventsStore';
import { useRouteLanguage } from './useRouteLanguage';
import type { Event } from '../types/events';

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    title: string;
    category: string;
    freshnessLevel: string;
    shortHeadline: string;
    articleCount: number;
    city: string;
    event: string;
  };
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

function getEventLocations(event: Event): { lat: number; lng: number; city: string }[] {
  const locations = event.metadata?.locations || [];
  if (locations.length === 0 && event.metadata?.location) {
    locations.push(event.metadata.location);
  }
  return locations
    .filter((loc: { coordinates?: { latitude?: number; longitude?: number } }) =>
      loc?.coordinates?.latitude && loc?.coordinates?.longitude
    )
    .map((loc: { coordinates: { latitude: number; longitude: number }; city?: string; country?: string }) => ({
      lat: loc.coordinates.latitude,
      lng: loc.coordinates.longitude,
      city: loc.city || loc.country || '',
    }));
}

export function useMapEvents() {
  const language = useRouteLanguage();
  const { events, loading, error } = useEvents({ limit: 200, lang: language });

  const eventsWithCoords = useMemo(() => {
    return events.filter((e) => getEventLocations(e).length > 0);
  }, [events]);

  const geoJSON: GeoJSONFeatureCollection = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: eventsWithCoords.flatMap((e) => {
        return getEventLocations(e).map((coords) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [coords.lng, coords.lat] as [number, number],
          },
          properties: {
            id: e.id,
            title: e.title,
            category: e.category || '',
            freshnessLevel: e.freshnessLevel || 'RECENT',
            shortHeadline: e.metadata?.shortHeadline || '',
            articleCount: e.articleCount || 0,
            city: coords.city,
            event: JSON.stringify(e),
          },
        }));
      }),
    };
  }, [eventsWithCoords]);

  return {
    events: eventsWithCoords,
    geoJSON,
    loading,
    error,
    totalCount: eventsWithCoords.length,
  };
}
