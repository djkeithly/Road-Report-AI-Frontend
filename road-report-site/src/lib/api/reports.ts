export type ReportIssueType =
  | 'pothole'
  | 'flooding'
  | 'debris'
  | 'construction'
  | 'signal_outage'
  | 'other'

export interface UserReportCreateRequest {
  road_name: string
  issue_type: ReportIssueType
  description: string
  latitude?: number
  longitude?: number
}

export interface UserReportCreateResponse {
  id: number
  message: string
  createdAt: string
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000'
const REQUEST_TIMEOUT_MS = 15000

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '')
}

export async function createUserReport(
  payload: UserReportCreateRequest,
): Promise<UserReportCreateResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}/api/v1/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Submitting report timed out. Please try again in a moment.')
    }
    throw new Error('Unable to submit report right now. Please check your connection and try again.')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`
    try {
      const data = await response.json()
      const message = data?.error?.message
      if (typeof message === 'string' && message.trim()) {
        detail = message
      }
    } catch {
      // Ignore payload parsing errors and fall back to HTTP status.
    }
    throw new Error(detail)
  }

  return (await response.json()) as UserReportCreateResponse
}
