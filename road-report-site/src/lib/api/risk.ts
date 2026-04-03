export interface PredictRiskRequest {
  latitude: number
  longitude: number
  road_name?: string
  road_class?: string
  weather_condition?: string
}

export interface PredictRiskResponse {
  risk_score: number
  latitude: number
  longitude: number
  message: string
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000'

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '')
}

export async function predictRisk(payload: PredictRiskRequest): Promise<PredictRiskResponse> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/risk/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`

    try {
      const data = await response.json()
      if (typeof data?.detail === 'string' && data.detail.trim()) {
        detail = data.detail
      }
    } catch {
      // Ignore invalid JSON error payloads and fall back to the status code.
    }

    throw new Error(detail)
  }

  return (await response.json()) as PredictRiskResponse
}
