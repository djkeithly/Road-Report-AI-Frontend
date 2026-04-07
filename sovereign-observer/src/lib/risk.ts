export interface PredictRiskRequest {
  latitude: number;
  longitude: number;
}

export interface PredictRiskResponse {
  risk_score: number;
  latitude: number;
  longitude: number;
  message: string;
}

export interface GeocodeResult {
  displayName: string;
  latitude: number;
  longitude: number;
  bounds: [number, number, number, number];
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000';

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '');
}

export async function predictRisk(payload: PredictRiskRequest): Promise<PredictRiskResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/risk/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;

    try {
      const data = await response.json();
      if (typeof data?.detail === 'string' && data.detail.trim()) {
        detail = data.detail;
      }
    } catch {
      // Ignore malformed JSON responses and fall back to the status code.
    }

    throw new Error(detail);
  }

  return (await response.json()) as PredictRiskResponse;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('Please enter a road or location first.');
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=1`,
  );

  if (!response.ok) {
    throw new Error('The geocoding service is unavailable right now.');
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Location not found. Try a different road, city, or corridor.');
  }

  const latitude = Number.parseFloat(data[0].lat);
  const longitude = Number.parseFloat(data[0].lon);

  return {
    displayName: data[0].display_name ?? trimmed,
    latitude,
    longitude,
    bounds: [
      Number((longitude - 0.015).toFixed(5)),
      Number((latitude - 0.01).toFixed(5)),
      Number((longitude + 0.015).toFixed(5)),
      Number((latitude + 0.01).toFixed(5)),
    ],
  };
}
