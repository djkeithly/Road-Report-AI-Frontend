<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Map, LngLatBounds } from 'maplibre-gl';
import type { Feature, Geometry } from "geojson";

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

// 2. Setup Router and State
const route = useRoute();
const router = useRouter();
const mapContainer = ref<HTMLElement | null>(null);
let map: Map | null = null;
const errorMessage = ref<string | null>(null);
const isLoading = ref(false); // Controls the new spinner

const utdBounds = [-96.765, 32.975, -96.735, 32.995];

const getBoundsFromRoute = (): number[] => {
  const boundsQuery = route.query.bounds;
  if (typeof boundsQuery === 'string') {
    const parsed = boundsQuery.split(',').map(Number);
    if (parsed.length === 4 && parsed.every(n => !isNaN(n))) {
      return parsed;
    }
  }
  return utdBounds;
};

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

// 3. Fetch Data using Overpass API
const fetchAndHighlightRoads = async (bounds: number[]) => {
  const [w, s, e, n] = bounds;
  errorMessage.value = null;
  isLoading.value = true;

  const areaSize = (e - w) * (n - s);
  if (areaSize > 0.005) {
    errorMessage.value = "Selected area is too large. Please provide a tighter bounding box.";
    isLoading.value = false;
    return;
  }

  const features: Feature<Geometry, { name: string, color: string }>[] = [];

  // FIXED: Replaced slow regex with highly optimized exact-match union block.
  // This utilizes database indexes and executes instantly, preventing the 504 timeout.
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
      body: `data=${encodeURIComponent(overpassQuery)}`
    });

    if (response.status === 504) {
      throw new Error("504: The Overpass server timed out.");
    }
    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const data: OverpassResponse = await response.json();

    if (data.elements && data.elements.length > 0) {
      data.elements.forEach((element) => {
        if (element.type !== 'way' || !element.geometry || !element.tags?.highway) return;

        const coordinates: [number, number][] = element.geometry.map(node => [node.lon, node.lat]);
        const streetName = element.tags.name || element.tags.ref || 'Unnamed Road';
        const roadColor = getRoadColor(element.tags.highway);

        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          },
          properties: { name: streetName, color: roadColor }
        });
      });
    } else {
      console.warn('No major roads found in this bounding box.');
    }
  } catch (error: any) {
    console.error('Error fetching data:', error);
    errorMessage.value = error.message.includes('504')
      ? "Server timed out. Try making the bounding box smaller."
      : "Failed to load road data from server.";
  } finally {
    isLoading.value = false;
  }

  if (!map) return;

  // 4. Update the Map
  const updateMap = () => {
    const sourceId = 'highlighted-roads-source';
    const layerId = 'highlighted-roads-layer';

    if (map!.getLayer(layerId)) map!.removeLayer(layerId);
    if (map!.getSource(sourceId)) map!.removeSource(sourceId);

    if (features.length === 0) return;

    map!.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features
      }
    });

    map!.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': ['match', ['get', 'color'], '#ef4444', 8, '#3b82f6', 6, 4],
        'line-opacity': 0.8
      }
    });

    map!.fitBounds(new LngLatBounds([w, s], [e, n]), { padding: 20, duration: 1000 });
  };

  if (map.isStyleLoaded()) {
    updateMap();
  } else {
    map.once('load', updateMap);
  }
};

// 5. Initialization
onMounted(() => {
  if (!mapContainer.value) return;

  const initialBounds = getBoundsFromRoute();
  const centerLng = (initialBounds[0] + initialBounds[2]) / 2;
  const centerLat = (initialBounds[1] + initialBounds[3]) / 2;

  map = new Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'osm': {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors',
        }
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm',
        }
      ]
    },
    center: [centerLng, centerLat],
    zoom: 13
  });

  fetchAndHighlightRoads(initialBounds);
});

// 6. Watch for URL changes
watch(
  () => route.query.bounds,
  () => {
    const newBounds = getBoundsFromRoute();
    fetchAndHighlightRoads(newBounds);
  }
);
</script>

<template>
  <div class="relative w-full h-50vh bg-gray-50 flex flex-col items-center p-6">
    <div class="mb-4 text-center">
      <p v-if="errorMessage" class="text-red-600 font-semibold mt-2 bg-red-100 px-4 py-1 rounded-md inline-block">
        {{ errorMessage }}
      </p>
    </div>

    <div class="relative w-full max-w-5xl h-[600px] rounded-xl shadow-lg border border-gray-300 overflow-hidden">

      <div
        v-if="isLoading"
        class="absolute inset-0 z-20 bg-white/60 flex flex-col items-center justify-center backdrop-blur-[2px] transition-opacity duration-300"
      >
        <div class="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600 mb-4 shadow-sm"></div>
        <span class="text-blue-800 font-bold tracking-wide animate-pulse bg-white/80 px-3 py-1 rounded-full shadow-sm">
          Fetching road network...
        </span>
      </div>

      <div ref="mapContainer" class="custom-map-wrapper w-full h-full"></div>
    </div>
  </div>
</template>



<style scoped>
/* Keep your existing CSS for .custom-map-wrapper and :deep() exactly as it was! */
.custom-map-wrapper {
  position: relative;
  overflow: hidden;
  touch-action: none;
}

:deep(.maplibregl-canvas-container) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

:deep(.maplibregl-canvas) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  outline: none;
  cursor: grab;
}

:deep(.maplibregl-canvas:active) {
  cursor: grabbing;
}

:deep(.maplibregl-control-container) {
  display: none;
}
</style>
