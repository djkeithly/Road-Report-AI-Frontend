export interface PredictRiskRequest {
  latitude: number
  longitude: number
  road_name?: string
  road_class?: string
  weather_condition?: string
}

export interface PredictRiskResponse {
  risk_score: number
  road?: string
  segment?: string
  latitude: number
  longitude: number
  warnings?: string[]
  message: string
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000'
const REQUEST_TIMEOUT_MS = 15000

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '')
}

function formatApiError(response: Response, data: unknown): string {
  const status = response.status
  const maybeData = data as { detail?: unknown; error?: { message?: unknown; details?: unknown } }

  if (typeof maybeData?.error?.message === 'string' && maybeData.error.message.trim()) {
    return maybeData.error.message
  }
  if (typeof maybeData?.detail === 'string' && maybeData.detail.trim()) {
    return maybeData.detail
  }

  if (status === 422) {
    return 'Request validation failed. Please retry the search from Home so coordinates are included.'
  }
  if (status === 404) {
    return 'The backend endpoint was not found. Please verify API deployment settings.'
  }
  if (status >= 500) {
    return 'Backend service error. Please try again in a moment.'
  }
  return `Request failed with status ${status}`
}

export async function predictRisk(payload: PredictRiskRequest): Promise<PredictRiskResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}/api/v1/risk/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out. The backend might be waking up or temporarily unavailable.')
    }
    throw new Error(
      'Unable to reach the backend. Check internet access, CORS settings, and VITE_API_BASE_URL.',
    )
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    let payloadData: unknown = null
    try {
      payloadData = await response.json()
    } catch {
      // Ignore invalid JSON payload and use HTTP status fallback.
    }
    throw new Error(formatApiError(response, payloadData))
  }

  return (await response.json()) as PredictRiskResponse
}
