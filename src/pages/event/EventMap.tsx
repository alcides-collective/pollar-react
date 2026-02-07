import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { EventLocation } from '../../types/events';

mapboxgl.accessToken = 'pk.eyJ1IjoiamFrdWJkdWRlayIsImEiOiJjbWRyMWx1Z3EwOTR6MmtzYjJvYzJncmZhIn0.5Fn6PxkRaqVkEwJLhP-8_Q';

interface EventMapProps {
  location: EventLocation;
}

export function EventMap({ location }: EventMapProps) {
  const { t } = useTranslation('event');
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const hasCoordinates = location?.coordinates?.latitude && location?.coordinates?.longitude;

  useEffect(() => {
    if (!hasCoordinates || map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [location.coordinates.longitude, location.coordinates.latitude],
      zoom: 5,
      attributionControl: false,
      interactive: false,
    });

    // Add marker
    const el = document.createElement('div');
    el.style.cssText = `
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
    `;

    markerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([location.coordinates.longitude, location.coordinates.latitude])
      .addTo(map.current);

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, [hasCoordinates, location]);

  // Fallback: show city name if no coordinates
  if (!hasCoordinates) {
    if (!location?.city) return null;

    return (
      <div className="h-32 bg-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-zinc-600">{location.city}</p>
          {location.country && (
            <p className="font-mono text-xs text-zinc-400">{location.country}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
        {t('location')}
      </h3>
      <div ref={mapContainer} className="h-48 overflow-hidden border border-zinc-200" />
      <p className="text-xs text-zinc-500 mt-2">
        {location.city}{location.country ? `, ${location.country}` : ''}
      </p>
    </div>
  );
}
