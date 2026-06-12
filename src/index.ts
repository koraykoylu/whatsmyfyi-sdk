const DEFAULT_BASE_URL = 'https://whatsmy.fyi';
const MAX_RETRIES = 3;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IpResponse {
  status: 'success';
  ip: string | null;
  ipv6: string | null;
  city?: string | null;
  region?: string | null;
  region_code?: string | null;
  country?: string | null;
  country_name?: string | null;
  continent?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  timezone_offset?: number | null;
  postal_code?: string | null;
  asn?: number | null;
  org?: string | null;
  as?: string | null;
  is_eu?: boolean | null;
  currency?: string | null;
  http_protocol?: string | null;
  tls_version?: string | null;
  tls_cipher?: string | null;
  rtt?: number | null;
  colo?: string | null;
  proxy?: boolean | null;
  hosting?: boolean | null;
}

export interface LocationResult {
  city: string | null;
  country: string | null;
  countryCode: string | null;
  lat: number | null;
  lng: number | null;
}

export interface OrgResult {
  asn: number | null;
  name: string | null;
}

export interface WhatsMyFyiOptions {
  /**
   * Your API key (`wmf_...`). Optional: without a key the client can still
   * fetch the bare IP address via the keyless endpoint — geolocation fields
   * require a free key from https://whatsmy.fyi/signup
   */
  apiKey?: string;
  baseUrl?: string;
}

// ── Error class ───────────────────────────────────────────────────────────────

export class WhatsMyFyiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'WhatsMyFyiError';
    this.code = code;
    this.status = status;
  }
}

// ── Internal fetch with retry ─────────────────────────────────────────────────

async function fetchWithRetry<T>(
  url: string,
  apiKey: string | undefined,
  attempt = 1
): Promise<T> {
  const res = await fetch(url, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
  });

  if (res.status >= 500 && attempt < MAX_RETRIES) {
    const delay = Math.pow(2, attempt) * 100;
    await new Promise(r => setTimeout(r, delay));
    return fetchWithRetry<T>(url, apiKey, attempt + 1);
  }

  if (!res.ok) {
    let code = 'internal_error';
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json() as { error?: string; message?: string };
      if (body.error) code = body.error;
      if (body.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    throw new WhatsMyFyiError(code, message, res.status);
  }

  return res.json() as Promise<T>;
}

// ── IP sub-client ─────────────────────────────────────────────────────────────

class IpClient {
  constructor(
    private readonly apiKey: string | undefined,
    private readonly baseUrl: string
  ) {}

  /**
   * Full IP + geolocation response. Requires an API key.
   */
  async lookup(): Promise<IpResponse> {
    if (!this.apiKey) {
      throw new WhatsMyFyiError(
        'missing_api_key',
        'lookup() requires an API key. Get a free one at https://whatsmy.fyi/signup — or use address() which works without a key.',
        401
      );
    }
    return fetchWithRetry<IpResponse>(`${this.baseUrl}/api/v1/ip`, this.apiKey);
  }

  /**
   * Just the public IP address. Works without an API key
   * (uses the keyless endpoint, same response shape as ipify).
   */
  async address(): Promise<string | null> {
    if (!this.apiKey) {
      const data = await fetchWithRetry<{ ip: string }>(
        `${this.baseUrl}/ip?format=json`,
        undefined
      );
      return data.ip ?? null;
    }
    const data = await this.lookup();
    return data.ip ?? data.ipv6 ?? null;
  }

  /**
   * City, country, and coordinates. Requires an API key.
   */
  async location(): Promise<LocationResult> {
    const data = await this.lookup();
    return {
      city: data.city ?? null,
      country: data.country_name ?? null,
      countryCode: data.country ?? null,
      lat: data.latitude ?? null,
      lng: data.longitude ?? null,
    };
  }

  /**
   * ASN and ISP/organization name. Requires an API key.
   */
  async org(): Promise<OrgResult> {
    const data = await this.lookup();
    return {
      asn: data.asn ?? null,
      name: data.org ?? null,
    };
  }
}

// ── Main client ───────────────────────────────────────────────────────────────

export class WhatsMyFyi {
  readonly ip: IpClient;

  constructor({ apiKey, baseUrl = DEFAULT_BASE_URL }: WhatsMyFyiOptions = {}) {
    this.ip = new IpClient(apiKey, baseUrl.replace(/\/$/, ''));
  }
}
