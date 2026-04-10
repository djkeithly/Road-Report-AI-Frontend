import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map, LngLatBounds } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, Geometry } from 'geojson';
import { cn } from './lib/utils'; // Assuming you have this from your App.tsx

// 1. Strict TypeScript Interfaces
interface OverpassNode {
  lat: number;
  lon: number;
}

interface OverpassElement {
  type: string;
  geometry: OverpassNode[];
  tags?: {
    name?: string;
    ref?: string;
    highway?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassResponse {
  elements: OverpassElement[];
}

interface RiskMapProps {
  bounds?: number[]; // [w, s, e, n]
  className?: string;
}

const UTD_BOUNDS = [-96.765, 32.975, -96.735, 32.995];

const getRoadColor = (highwayType: string): string => {
  switch (highwayType) {
    case 'motorway':
    case 'trunk':
      return '#ef4444';
    case 'primary':
      return '#3b82f6';
    case 'secondary':
      return '#10b981';
    case 'tertiary':
      return '#8b5cf6';
    default:
      return '#9ca3af';
  }
};

export const RiskMap: React.FC<RiskMapProps> = ({ bounds, className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Initialize the Map exactly once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialBounds = bounds?.length === 4 ? bounds : UTD_BOUNDS;
    const centerLng = (initialBounds[0] + initialBounds[2]) / 2;
    const centerLat = (initialBounds[1] + initialBounds[3]) / 2;

    map.current = new Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [centerLng, centerLat],
      zoom: 13,
    });

    // Cleanup on unmount (important for React Strict Mode)
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []); // Empty dependency array ensures this runs once

  // 3. Fetch Data & Update Map when bounds change
  useEffect(() => {
    if (!map.current) return;

    const currentBounds = bounds?.length === 4 ? bounds : UTD_BOUNDS;
    const [w, s, e, n] = currentBounds;

    const fetchAndHighlightRoads = async () => {
      setErrorMessage(null);
      setIsLoading(true);

      const areaSize = (e - w) * (n - s);
      if (areaSize > 0.005) {
        setErrorMessage('Selected area is too large. Please provide a tighter bounding box.');
        setIsLoading(false);
        return;
      }

      const features: Feature<Geometry, { name: string; color: string }>[] = [];

      const overpassQuery = `
        [out:json][timeout:25];
        (
          way["highway"="motorway"](${s},${w},${n},${e});
          way["highway"="trunk"](${s},${w},${n},${e});
          way["highway"="primary"](${s},${w},${n},${e});
          way["highway"="secondary"](${s},${w},${n},${e});
          way["highway"="tertiary"](${s},${w},${n},${e});
        );
        out geom tags;
      `;

      try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(overpassQuery)}`,
        });

        if (response.status === 504) throw new Error('504: The Overpass server timed out.');
        if (!response.ok) throw new Error(`API returned ${response.status}`);

        const data: OverpassResponse = await response.json();

        if (data.elements && data.elements.length > 0) {
          data.elements.forEach((element) => {
            if (element.type !== 'way' || !element.geometry || !element.tags?.highway) return;

            const coordinates: [number, number][] = element.geometry.map((node) => [node.lon, node.lat]);
            const streetName = element.tags.name || element.tags.ref || 'Unnamed Road';
            const roadColor = getRoadColor(element.tags.highway);

            features.push({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: coordinates,
              },
              properties: { name: streetName, color: roadColor },
            });
          });
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setErrorMessage(
          error.message.includes('504')
            ? 'Server timed out. Try making the bounding box smaller.'
            : 'Failed to load road data from server.'
        );
      } finally {
        setIsLoading(false);
      }

      // Update Map Data safely
      const updateMap = () => {
        if (!map.current) return;
        const sourceId = 'highlighted-roads-source';
        const layerId = 'highlighted-roads-layer';

        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
        if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

        if (features.length === 0) return;

        map.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features,
          },
        });

        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': ['match', ['get', 'color'], '#ef4444', 8, '#3b82f6', 6, 4],
            'line-opacity': 0.8,
          },
        });

        map.current.fitBounds(new LngLatBounds([w, s], [e, n]), { padding: 20, duration: 1000 });
      };

      if (map.current.isStyleLoaded()) {
        updateMap();
      } else {
        map.current.once('load', updateMap);
      }
    };

    fetchAndHighlightRoads();
  }, [bounds]);

  return (
    <div className={cn('relative flex h-full w-full flex-col items-center bg-gray-50', className)}>
      {errorMessage && (
        <div className="absolute top-4 z-30 mb-4 text-center">
          <p className="inline-block rounded-md bg-red-100 px-4 py-1 font-semibold text-red-600 shadow-md">
            {errorMessage}
          </p>
        </div>
      )}

      <div className="relative h-full w-full overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] transition-opacity duration-300">
            <div className="mb-4 h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary shadow-sm"></div>
            <span className="animate-pulse rounded-full bg-white/80 px-3 py-1 font-bold tracking-wide text-primary shadow-sm">
              Fetching road network...
            </span>
          </div>
        )}

        {/* MapLibre attaches to this div */}
        <div ref={mapContainer} className="h-full w-full outline-none [&_.maplibregl-control-container]:hidden" />
      </div>
    </div>
  );
};
