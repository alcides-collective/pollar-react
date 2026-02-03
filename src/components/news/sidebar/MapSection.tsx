import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEvents } from '../../../stores/eventsStore';

mapboxgl.accessToken = 'pk.eyJ1IjoiamFrdWJkdWRlayIsImEiOiJjbWRyMWx1Z3EwOTR6MmtzYjJvYzJncmZhIn0.5Fn6PxkRaqVkEwJLhP-8_Q';

export function MapSection() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const { events } = useEvents({ limit: 100, lang: 'pl' });

  // Get all valid locations from all events
  const allLocations = events.flatMap((e) =>
    (e.metadata?.locations || []).filter(
      (loc) => loc?.coordinates?.latitude && loc?.coordinates?.longitude
    )
  );

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [15, 50], // Europe center
      zoom: 1.5,
      attributionControl: false,
      interactive: false,
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers when locations change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers for all locations
    allLocations.forEach((loc) => {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 5px;
        height: 5px;
        background: #ef4444;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(239, 68, 68, 0.6);
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([loc.coordinates.longitude, loc.coordinates.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [allLocations]);

  return (
    <Link to="/mapa" className="block p-6 group hover:bg-zinc-50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-zinc-900 font-semibold">Mapa wydarzeń</h3>
        <i className="ri-arrow-right-line text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
      </div>
      <div ref={mapContainer} className="h-48 overflow-hidden rounded-lg" />
    </Link>
  );
}
