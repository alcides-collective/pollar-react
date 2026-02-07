import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AnimatePresence } from 'framer-motion';
import { useMapEvents } from '../../hooks/useMapEvents';
import { EventCard } from './EventCard';
import { ClusterPanel } from './ClusterPanel';
import type { Event } from '../../types/events';
import { useIsDarkMode } from '@/stores/themeStore';

mapboxgl.accessToken = 'pk.eyJ1IjoiamFrdWJkdWRlayIsImEiOiJjbWRyMWx1Z3EwOTR6MmtzYjJvYzJncmZhIn0.5Fn6PxkRaqVkEwJLhP-8_Q';

// Disable Mapbox telemetry to prevent CORS errors in production
// @ts-expect-error - workerUrl is not in types but exists
mapboxgl.workerClass = null;
(mapboxgl as unknown as { collectResourceTiming: boolean }).collectResourceTiming = false;

export function EventsMap() {
  const isDark = useIsDarkMode();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [clusterEvents, setClusterEvents] = useState<Event[]>([]);

  const { geoJSON, loading, totalCount } = useMapEvents();

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [19.0122, 52.2297], // Poland center
      zoom: 5,
      attributionControl: false,
      collectResourceTiming: false,
      trackResize: true,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right'
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style when dark mode changes
  useEffect(() => {
    if (!map.current) return;
    const style = isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';
    map.current.setStyle(style);
    setMapLoaded(false);
    map.current.once('style.load', () => {
      setMapLoaded(true);
    });
  }, [isDark]);

  // Add source and layers when map is loaded and data is available
  useEffect(() => {
    if (!map.current || !mapLoaded || loading) return;

    // Remove existing source and layers if they exist
    if (map.current.getLayer('clusters')) {
      map.current.removeLayer('clusters');
    }
    if (map.current.getLayer('cluster-count')) {
      map.current.removeLayer('cluster-count');
    }
    if (map.current.getLayer('unclustered-point')) {
      map.current.removeLayer('unclustered-point');
    }
    if (map.current.getLayer('unclustered-point-label')) {
      map.current.removeLayer('unclustered-point-label');
    }
    if (map.current.getSource('events')) {
      map.current.removeSource('events');
    }

    // Add source with clustering
    map.current.addSource('events', {
      type: 'geojson',
      data: geoJSON as GeoJSON.FeatureCollection,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    // Cluster circles
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'events',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#000',
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15,  // radius for count < 10
          10, 20,  // radius for count >= 10
          25, 25,  // radius for count >= 25
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(0, 0, 0, 0.2)',
      },
    });

    // Cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'events',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#fff',
      },
    });

    // Unclustered points - color based on freshnessLevel
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'events',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['in', ['get', 'freshnessLevel'], ['literal', ['HOT', 'BREAKING']]],
          '#ef4444',
          '#000',
        ],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': [
          'case',
          ['in', ['get', 'freshnessLevel'], ['literal', ['HOT', 'BREAKING']]],
          'rgba(239, 68, 68, 0.3)',
          'rgba(0, 0, 0, 0.2)',
        ],
      },
    });

    // City labels for unclustered points
    map.current.addLayer({
      id: 'unclustered-point-label',
      type: 'symbol',
      source: 'events',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'city'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Regular'],
        'text-size': 11,
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': '#666',
        'text-halo-color': '#fff',
        'text-halo-width': 1,
      },
    });
  }, [geoJSON, mapLoaded, loading]);

  // Click handler for clusters
  const handleClusterClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!map.current) return;

    const features = map.current.queryRenderedFeatures(e.point, {
      layers: ['clusters'],
    });

    if (!features.length) return;

    const clusterId = features[0].properties?.cluster_id;
    const source = map.current.getSource('events') as mapboxgl.GeoJSONSource;

    // Get cluster expansion zoom
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err || !map.current) return;

      const coordinates = (features[0].geometry as GeoJSON.Point).coordinates;
      map.current.easeTo({
        center: coordinates as [number, number],
        zoom: zoom!,
      });
    });

    // Get cluster leaves to show in panel
    source.getClusterLeaves(clusterId, 100, 0, (err, leaves) => {
      if (err || !leaves) return;

      const events = leaves.map((leaf) => {
        try {
          return JSON.parse(leaf.properties?.event || '{}') as Event;
        } catch {
          return null;
        }
      }).filter((e): e is Event => e !== null && !!e.id);

      if (events.length > 0) {
        setClusterEvents(events);
        setSelectedEvent(null);
      }
    });
  }, []);

  // Click handler for unclustered points
  const handlePointClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!map.current) return;

    const features = map.current.queryRenderedFeatures(e.point, {
      layers: ['unclustered-point'],
    });

    if (!features.length) return;

    try {
      const event = JSON.parse(features[0].properties?.event || '{}') as Event;
      if (event.id) {
        setSelectedEvent(event);
        setClusterEvents([]);

        // Center on the point
        const coordinates = (features[0].geometry as GeoJSON.Point).coordinates;
        map.current.easeTo({
          center: coordinates as [number, number],
          zoom: Math.max(map.current.getZoom(), 8),
          duration: 500,
        });
      }
    } catch {
      // Invalid JSON
    }
  }, []);

  // Set up click handlers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapInstance = map.current;

    // Cluster click
    mapInstance.on('click', 'clusters', handleClusterClick);

    // Point click
    mapInstance.on('click', 'unclustered-point', handlePointClick);

    // Change cursor on hover
    mapInstance.on('mouseenter', 'clusters', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'clusters', () => {
      mapInstance.getCanvas().style.cursor = '';
    });
    mapInstance.on('mouseenter', 'unclustered-point', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'unclustered-point', () => {
      mapInstance.getCanvas().style.cursor = '';
    });

    // Close panels when clicking on empty map
    mapInstance.on('click', (e) => {
      const clusters = mapInstance.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const points = mapInstance.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });

      if (clusters.length === 0 && points.length === 0) {
        setSelectedEvent(null);
        setClusterEvents([]);
      }
    });

    return () => {
      mapInstance.off('click', 'clusters', handleClusterClick);
      mapInstance.off('click', 'unclustered-point', handlePointClick);
    };
  }, [mapLoaded, handleClusterClick, handlePointClick]);

  return (
    <div className="absolute inset-0">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-sm text-content">
          Ładowanie wydarzeń...
        </div>
      )}

      {/* Event count */}
      {!loading && totalCount > 0 && (
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg text-sm text-content">
          {totalCount} wydarzeń na mapie
        </div>
      )}

      {/* Selected event card */}
      <AnimatePresence>
        {selectedEvent && (
          <EventCard
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>

      {/* Cluster events panel */}
      <AnimatePresence>
        {clusterEvents.length > 0 && (
          <ClusterPanel
            events={clusterEvents}
            onClose={() => setClusterEvents([])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
