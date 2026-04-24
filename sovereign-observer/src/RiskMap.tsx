import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { LngLatBounds, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, Geometry } from 'geojson';
import { cn } from './lib/utils';
import { predictRisk } from './lib/risk';
import type { LiveReport } from './types';

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
  report?: LiveReport | null;
}

const DEFAULT_BOUNDS = [-99.9018, 31.5, -99.9018, 31.5]; // Texas fallback center

export const RiskMap: React.FC<RiskMapProps> = ({ bounds, className, report }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Safely extract bounds for the dependency array to prevent React reference loops
  const [w, s, e, n] = bounds?.length === 4 ? bounds : [];

  // 1. Initialize the Map strictly once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialBounds = bounds?.length === 4 ? bounds : DEFAULT_BOUNDS;
    const centerLng = bounds ? (initialBounds[0] + initialBounds[2]) / 2 : -99.9018;
    const centerLat = bounds ? (initialBounds[1] + initialBounds[3]) / 2 : 31.9686;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
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
      zoom: bounds ? 13 : 5.5,
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current = mapInstance;

    return () => {
      mapInstance.remove();
      map.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Sync main report marker
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !report) return;

    const { latitude, longitude, tier } = report;

    const tierColors: Record<string, string> = {
      Low: '#10b981',
      Moderate: '#0A705E',
      High: '#f97316',
      Critical: '#ef4444',
    };

    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new Marker({ color: tierColors[tier] || tierColors.Moderate })
      .setLngLat([longitude, latitude])
      .setPopup(
        new Popup({ offset: 24 }).setHTML(
          `<strong>${report.query}</strong><br/>Score: ${report.score}/100 · ${tier}`,
        ),
      )
      .addTo(mapInstance);
  }, [report]);

  // 3. Fetch Data & Update Map when bounds change
  useEffect(() => {
    const mapInstance = map.current;
    let isActive = true;

    if (!mapInstance || w === undefined || s === undefined || e === undefined || n === undefined) return;

    const fetchAndHighlightRoads = async () => {
      setErrorMessage(null);
      setIsLoading(true);

      const areaSize = (e - w) * (n - s);
      if (areaSize > 0.05) {
        setErrorMessage('Selected area is too large for segment analysis. Please provide a tighter bounding box.');
        if (isActive) setIsLoading(false);
        return;
      }

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

        if (!isActive) return;

        if (response.status === 504) throw new Error('504: The Overpass server timed out.');
        if (!response.ok) throw new Error(`API returned ${response.status}`);

        const data: OverpassResponse = await response.json();

        if (!isActive) return;

        if (data.elements && data.elements.length > 0) {
          // NATIVE JS Map is safely used here!
          const roadsByName = new Map<string, OverpassElement>();
          
          data.elements.forEach((element) => {
            if (element.type !== 'way' || !element.geometry || !element.tags?.highway) return;
            const streetName = element.tags.name || element.tags.ref;
            if (streetName && !roadsByName.has(streetName)) {
              roadsByName.set(streetName, element);
            }
          });

          const uniqueRoadNames = Array.from(roadsByName.keys());
          const roadColors = new Map<string, string>(); 

          await Promise.all(
            uniqueRoadNames.map(async (streetName) => {
              if (!isActive) return; 
              
              const element = roadsByName.get(streetName)!;
              const midNode = element.geometry[Math.floor(element.geometry.length / 2)];
              
              if (!midNode) return; 
              
              try {
                const prediction = await predictRisk({
                  latitude: midNode.lat,
                  longitude: midNode.lon,
                  road_name: streetName,
                  segment: streetName,
                });

                const score = prediction.total ?? Math.round(prediction.risk_score * 100);
                let tier = 'Low';
                if (score >= 75) tier = 'Critical';
                else if (score >= 60) tier = 'High';
                else if (score >= 35) tier = 'Moderate';

                const tierColors: Record<string, string> = {
                  Low: '#10b981',
                  Moderate: '#0A705E',
                  High: '#f97316',
                  Critical: '#ef4444',
                };

                roadColors.set(streetName, tierColors[tier] || '#9ca3af');
              } catch (predictError) {
                console.warn(`Unable to score road: ${streetName}`);
                roadColors.set(streetName, '#9ca3af');
              }
            })
          );

          if (!isActive) return;

          const features: Feature<Geometry, { name: string; color: string }>[] = [];

          data.elements.forEach((element) => {
            if (element.type !== 'way' || !element.geometry || !element.tags?.highway) return;

            const coordinates: [number, number][] = element.geometry
              .filter(n => n.lon !== undefined && n.lat !== undefined)
              .map((node) => [node.lon, node.lat]);
            
            if (coordinates.length < 2) return; 

            const streetName = element.tags.name || element.tags.ref || 'Unnamed Road';
            const color = roadColors.get(streetName) || '#9ca3af';

            features.push({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: coordinates,
              },
              properties: { name: streetName, color },
            });
          });

          const updateMap = () => {
            if (!isActive) return;

            try {
              const sourceId = 'highlighted-roads-source';
              const layerId = 'highlighted-roads-layer';

              if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId);
              if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId);

              if (features.length === 0) return;

              mapInstance.addSource(sourceId, {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: features,
                },
              });

              mapInstance.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round',
                },
                paint: {
                  'line-color': ['get', 'color'],
                  'line-width': 6,
                  'line-opacity': 0.8,
                },
              });

              mapInstance.fitBounds(new LngLatBounds([w, s], [e, n]), { padding: 80, duration: 1000, maxZoom: 15 });
            } catch (err) {
              console.warn("MapLibre skipped a render frame due to cleanup.", err);
            }
          };

          if (mapInstance.loaded() || mapInstance.isStyleLoaded()) {
            updateMap();
          } else {
            mapInstance.once('load', () => {
              if (isActive) updateMap();
            });
          }
        }
      } catch (error: any) {
        if (!isActive) return;
        console.error('Error fetching data:', error);
        setErrorMessage(
          error.message.includes('504')
            ? 'Server timed out. The Overpass API query complexity might be too high.'
            : 'Failed to load road data from server.'
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchAndHighlightRoads();

    return () => {
      isActive = false;
    };
  }, [w, s, e, n]); // Safely depend on the primitive boundary coordinates

  return (
    <div className={cn('absolute inset-0 h-full w-full', className)}>
      {errorMessage && (
        <div className="absolute top-6 left-1/2 z-30 -translate-x-1/2 text-center">
          <p className="inline-block rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
            {errorMessage}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3 rounded-xl border border-tertiary bg-white px-5 py-3 shadow-lg">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary"></div>
          <span className="text-sm font-bold text-secondary">Analyzing segments...</span>
        </div>
      )}

      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};
