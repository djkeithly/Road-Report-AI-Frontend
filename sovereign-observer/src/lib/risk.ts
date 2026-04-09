export interface PredictRiskRequest {
  latitude: number;
  longitude: number;
  road_name?: string | null;
  segment?: string | null;
  road_class?: string | null;
}

export interface PredictRiskResponse {
  risk_score: number;
  total?: number;
  tier?: string;
  road?: string;
  segment?: string;
  latitude: number;
  longitude: number;
  message: string;
}

export type ReportIssueType =
  | 'pothole'
  | 'flooding'
  | 'debris'
  | 'construction'
  | 'signal_outage'
  | 'other';

export interface CreateUserReportRequest {
  road_name: string;
  issue_type: ReportIssueType;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreateUserReportResponse {
  id: number;
  message: string;
  createdAt: string;
}

export interface GeocodeResult {
  displayName: string;
  roadName: string;
  segment: string;
  latitude: number;
  longitude: number;
  bounds: [number, number, number, number];
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000';

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '');
}

type NominatimAddress = {
  road?: string;
  pedestrian?: string;
  path?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  state?: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
  class?: string;
  type?: string;
  importance?: number;
  address?: NominatimAddress;
};

const STATE_ABBREVIATIONS: Record<string, string> = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  'district of columbia': 'DC',
};

const ABBR_TO_STATE_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBREVIATIONS).map(([name, abbr]) => [
    abbr,
    name
      .split(' ')
      .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' '),
  ]),
);

function isInTexas(latitude: number, longitude: number): boolean {
  return latitude >= 25.8 && latitude <= 36.6 && longitude >= -106.7 && longitude <= -93.4;
}

function roadFromAddress(address: NominatimAddress | undefined): string {
  return (address?.road || address?.pedestrian || address?.path || '').trim();
}

function localityFromAddress(address: NominatimAddress | undefined): string {
  return (
    address?.city ||
    address?.town ||
    address?.village ||
    address?.suburb ||
    address?.neighbourhood ||
    ''
  ).trim();
}

function stateAbbreviation(stateText: string | undefined): string {
  if (!stateText) return '';
  const trimmed = stateText.trim();
  if (trimmed.length === 2 && trimmed === trimmed.toUpperCase()) return trimmed;
  return STATE_ABBREVIATIONS[trimmed.toLowerCase()] ?? trimmed;
}

function buildDisplayLabel(hit: NominatimResult): string {
  const road = roadFromAddress(hit.address);
  const city = localityFromAddress(hit.address);
  const state = stateAbbreviation(hit.address?.state);
  const fallback = (hit.display_name ?? '')
    .replace(/,\s*United States\s*$/i, '')
    .replace(/\s*,\s*\d{5}(-\d{4})?\s*$/i, '')
    .trim();

  if (road && city && state) return `${road}, ${city}, ${state}`;
  if (road && city) return `${road}, ${city}`;
  if (road && state) return `${road}, ${state}`;
  if (road) return road;
  return fallback || 'Unknown location';
}

function splitRoadAndSegment(query: string): { street: string; city?: string; state?: string } {
  const parts = query
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    const [street, city, state] = parts as [string, string, string];
    return { street, city, state };
  }
  if (parts.length === 2) {
    const [street, city] = parts as [string, string];
    return { street, city };
  }
  return { street: query.trim() };
}

function scoreHit(hit: NominatimResult, preferredCity?: string): number {
  const latitude = Number.parseFloat(hit.lat);
  const longitude = Number.parseFloat(hit.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return Number.NEGATIVE_INFINITY;
  if (!isInTexas(latitude, longitude)) return Number.NEGATIVE_INFINITY;

  let score = (hit.importance ?? 0) * 25;
  if (hit.class === 'highway') score += 20;
  if (hit.class === 'boundary' && hit.type === 'administrative') score -= 5;

  if (preferredCity) {
    const preferred = preferredCity.toLowerCase();
    const city = localityFromAddress(hit.address).toLowerCase();
    const displayName = (hit.display_name ?? '').toLowerCase();
    if (city === preferred) score += 35;
    if (displayName.includes(preferred)) score += 30;
  }

  return score;
}

function selectBestTexasHit(results: NominatimResult[], preferredCity?: string): NominatimResult | null {
  const ranked = results
    .map((result) => ({ result, score: scoreHit(result, preferredCity) }))
    .filter((entry) => entry.score > Number.NEGATIVE_INFINITY)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.result ?? null;
}

async function fetchNominatim(params: URLSearchParams): Promise<NominatimResult[]> {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('The geocoding service is unavailable right now.');
  }
  return (await response.json()) as NominatimResult[];
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

export async function createUserReport(
  payload: CreateUserReportRequest,
): Promise<CreateUserReportResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/reports`, {
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
      } else if (typeof data?.error?.message === 'string' && data.error.message.trim()) {
        detail = data.error.message;
      }
    } catch {
      // Keep generic fallback when server response is not JSON.
    }
    throw new Error(detail);
  }

  return (await response.json()) as CreateUserReportResponse;
}

export async function geocodeLocation(query: string): Promise<GeocodeResult> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('Please enter a road or location first.');
  }

  const { street, city, state } = splitRoadAndSegment(trimmed);

  if (city) {
    const structuredParams = new URLSearchParams({
      street,
      city,
      format: 'json',
      limit: '10',
      countrycodes: 'us',
      addressdetails: '1',
      country: 'USA',
    });
    if (state) {
      const normalizedState =
        state.length === 2 ? (ABBR_TO_STATE_NAME[state.toUpperCase()] ?? state) : state;
      structuredParams.set('state', normalizedState);
    }
    const structuredResults = await fetchNominatim(structuredParams);
    const structuredBest =
      selectBestTexasHit(structuredResults, city) ?? structuredResults[0] ?? null;
    if (structuredBest) {
      const latitude = Number.parseFloat(structuredBest.lat);
      const longitude = Number.parseFloat(structuredBest.lon);
      const displayName = buildDisplayLabel(structuredBest);
      const roadName = roadFromAddress(structuredBest.address) || displayName.split(',')[0]?.trim() || street;
      const stateAbbr = stateAbbreviation(structuredBest.address?.state);
      const locality = localityFromAddress(structuredBest.address);
      const segment = locality && stateAbbr ? `${locality}, ${stateAbbr}` : locality || stateAbbr || 'Segment details unavailable';

      return {
        displayName,
        roadName,
        segment,
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
  }

  const freeParams = new URLSearchParams({
    q: trimmed,
    format: 'json',
    limit: '12',
    countrycodes: 'us',
    addressdetails: '1',
  });
  const freeResults = await fetchNominatim(freeParams);
  const best = selectBestTexasHit(freeResults, city);
  if (!best) {
    throw new Error('Location not found. Try a different road, city, or corridor.');
  }

  const latitude = Number.parseFloat(best.lat);
  const longitude = Number.parseFloat(best.lon);
  const displayName = buildDisplayLabel(best);
  const roadName = roadFromAddress(best.address) || displayName.split(',')[0]?.trim() || trimmed;
  const stateAbbr = stateAbbreviation(best.address?.state);
  const locality = localityFromAddress(best.address);
  const segment = locality && stateAbbr ? `${locality}, ${stateAbbr}` : locality || stateAbbr || 'Segment details unavailable';

  return {
    displayName,
    roadName,
    segment,
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
