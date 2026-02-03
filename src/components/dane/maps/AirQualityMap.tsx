import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { AirQualityData } from '@/types/dane';

mapboxgl.accessToken = 'pk.eyJ1IjoiamFrdWJkdWRlayIsImEiOiJjbWRyMWx1Z3EwOTR6MmtzYjJvYzJncmZhIn0.5Fn6PxkRaqVkEwJLhP-8_Q';

// Disable Mapbox telemetry to prevent CORS errors in production
// @ts-expect-error - workerUrl is not in types but exists
mapboxgl.workerClass = null;
(mapboxgl as unknown as { collectResourceTiming: boolean }).collectResourceTiming = false;

interface AirQualityMapProps {
  stations: AirQualityData[];
  selectedProvince?: string | null;
  onStationClick?: (station: AirQualityData) => void;
  className?: string;
}

export function AirQualityMap({
  stations,
  selectedProvince,
  onStationClick,
  className,
}: AirQualityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [19.0, 52.0], // Center of Poland
      zoom: 5.5,
      attributionControl: false,
      collectResourceTiming: false,
      trackResize: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      popupRef.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add/update markers when stations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter stations by province if selected
    const filteredStations = selectedProvince
      ? stations.filter((s) => s.station.city.commune.provinceName === selectedProvince)
      : stations;

    // Add new markers
    filteredStations.forEach((station) => {
      const lat = parseFloat(station.station.gegrLat);
      const lon = parseFloat(station.station.gegrLon);

      if (isNaN(lat) || isNaN(lon)) return;

      // Create marker element
      const el = document.createElement('div');
      el.style.cssText = `
        width: 16px;
        height: 16px;
        background: ${station.indexInfo.color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s;
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lon, lat])
        .addTo(map.current!);

      // Add popup on click
      el.addEventListener('click', () => {
        popupRef.current?.remove();

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: true })
          .setLngLat([lon, lat])
          .setHTML(`
            <div style="font-family: system-ui; padding: 4px;">
              <p style="font-weight: 600; margin: 0 0 4px 0;">${station.station.stationName}</p>
              <p style="color: #666; font-size: 12px; margin: 0 0 8px 0;">
                ${station.station.city.name}, ${station.station.city.commune.provinceName}
              </p>
              <p style="
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                background: ${station.indexInfo.color}20;
                color: ${station.indexInfo.color};
              ">
                ${station.indexInfo.label}
              </p>
            </div>
          `)
          .addTo(map.current!);

        popupRef.current = popup;

        if (onStationClick) {
          onStationClick(station);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to filtered stations
    if (filteredStations.length > 0 && selectedProvince) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredStations.forEach((s) => {
        const lat = parseFloat(s.station.gegrLat);
        const lon = parseFloat(s.station.gegrLon);
        if (!isNaN(lat) && !isNaN(lon)) {
          bounds.extend([lon, lat]);
        }
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 10 });
    } else if (!selectedProvince) {
      // Reset to Poland view
      map.current.flyTo({ center: [19.0, 52.0], zoom: 5.5 });
    }
  }, [stations, selectedProvince, mapLoaded, onStationClick]);

  return (
    <div
      ref={mapContainer}
      className={className}
      style={{ minHeight: '400px' }}
    />
  );
}
