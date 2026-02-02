import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Event, EventLocation } from '../../../types/events';

mapboxgl.accessToken = 'pk.eyJ1IjoiamFrdWJkdWRlayIsImEiOiJjbWRyMWx1Z3EwOTR6MmtzYjJvYzJncmZhIn0.5Fn6PxkRaqVkEwJLhP-8_Q';

interface TerminalMapProps {
  event: Event | null;
}

export function TerminalMap({ event }: TerminalMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Get location from event
  const locations: EventLocation[] = event?.metadata?.locations?.length
    ? event.metadata.locations
    : event?.metadata?.location
      ? [event.metadata.location]
      : [];

  const firstLocation = locations[0];
  const hasCoordinates = !!(firstLocation?.coordinates?.latitude && firstLocation?.coordinates?.longitude);

  // Initialize map once
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [15.0, 50.0], // Europe center
      zoom: 2,
      attributionControl: false,
      interactive: false,
    });

    // Resize map when loaded to fix centering issues
    map.current.on('load', () => {
      map.current?.resize();
    });

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update marker when event changes
  useEffect(() => {
    if (!map.current) return;

    // Remove existing marker
    markerRef.current?.remove();
    markerRef.current = null;

    if (hasCoordinates && firstLocation) {
      const { latitude, longitude } = firstLocation.coordinates;

      // Add new marker with custom element (yellow dot for terminal)
      const el = document.createElement('div');
      el.style.cssText = `
        width: 10px;
        height: 10px;
        background: #eab308;
        border-radius: 50%;
        border: 2px solid #000;
        box-shadow: 0 0 6px rgba(234, 179, 8, 0.8);
      `;

      markerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Resize first, then center on marker
      map.current.resize();
      map.current.setCenter([longitude, latitude]);
      map.current.setZoom(3);
    } else {
      // Reset to default view (Europe)
      map.current.resize();
      map.current.setCenter([15.0, 50.0]);
      map.current.setZoom(2);
    }
  }, [event?.id, hasCoordinates, firstLocation]);

  // Get cities for placeholder
  const cities = locations.filter(loc => loc.city).map(loc => loc.city?.toUpperCase()).join(' • ');

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Map container - fills parent absolutely */}
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

      {/* Overlay when no coordinates */}
      {!hasCoordinates && (
        <div className="map-placeholder" style={{ position: 'absolute', inset: 0, background: '#0a0a0a' }}>
          {cities ? (
            <span className="map-city">{cities}</span>
          ) : (
            <span className="map-no-data">BRAK LOKALIZACJI</span>
          )}
        </div>
      )}
    </div>
  );
}
