import { useMemo } from 'react';
import { useEvents } from '../stores/eventsStore';
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

function getEventCoordinates(event: Event): { lat: number; lng: number; city: string } | null {
  const loc = event.metadata?.location || event.metadata?.locations?.[0];
  if (!loc?.coordinates?.latitude || !loc?.coordinates?.longitude) {
    return null;
  }
  return {
    lat: loc.coordinates.latitude,
    lng: loc.coordinates.longitude,
    city: loc.city || loc.country || '',
  };
}

export function useMapEvents() {
  const { events, loading, error } = useEvents({ limit: 200, lang: 'pl' });

  const eventsWithCoords = useMemo(() => {
    return events.filter((e) => getEventCoordinates(e) !== null);
  }, [events]);

  const geoJSON: GeoJSONFeatureCollection = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: eventsWithCoords.map((e) => {
        const coords = getEventCoordinates(e)!;
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat],
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
        };
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
