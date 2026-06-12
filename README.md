# @whatsmyfyi/sdk

[![npm version](https://img.shields.io/npm/v/@whatsmyfyi/sdk)](https://www.npmjs.com/package/@whatsmyfyi/sdk)
[![CI](https://github.com/koraykoylu/whatsmyfyi-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/koraykoylu/whatsmyfyi-sdk/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@whatsmyfyi/sdk)](./LICENSE)

Official TypeScript SDK for the [whatsmy.fyi](https://whatsmy.fyi) IP API.

Get your public IP with **zero config** — no API key, no signup. Add a free key
when you need geolocation, ASN, and timezone data.

```typescript
import { WhatsMyFyi } from '@whatsmyfyi/sdk'

// No API key needed for the bare IP
const client = new WhatsMyFyi()
const ip = await client.ip.address()  // "203.0.113.42"
```

That's the whole setup. No account required for the line above.

## Installation

```bash
npm install @whatsmyfyi/sdk
```

Works in Node.js (≥18), Deno, Bun, Cloudflare Workers, and the browser.
Zero dependencies — it's a thin, typed wrapper around `fetch`.

## With an API key — free geolocation

A [free API key](https://whatsmy.fyi/signup) (10,000 requests/day) unlocks the
full response: city, country, coordinates, timezone, ASN, ISP, currency, and more.

```typescript
const client = new WhatsMyFyi({ apiKey: 'wmf_your_key' })

// Full response
const data = await client.ip.lookup()
data.ip        // "203.0.113.42"
data.city      // "Amsterdam"
data.country   // "NL"
data.asn       // 13335
data.timezone  // "Europe/Amsterdam"

// Or just the part you need
const location = await client.ip.location()  // { city, country, countryCode, lat, lng }
const org      = await client.ip.org()       // { asn, name }
```

## Error handling

Every API error becomes a typed `WhatsMyFyiError` with the server's error code:

```typescript
import { WhatsMyFyi, WhatsMyFyiError } from '@whatsmyfyi/sdk'

try {
  const data = await client.ip.lookup()
} catch (err) {
  if (err instanceof WhatsMyFyiError) {
    err.code    // "rate_limit_exceeded", "invalid_api_key", ...
    err.status  // HTTP status code
    err.message // human-readable explanation
  }
}
```

5xx responses are retried automatically (3 attempts, exponential backoff).

## Don't need an SDK?

Honestly, for many cases you don't. The API is one HTTP call:

```bash
# Keyless — plain text
curl https://whatsmy.fyi/ip

# Keyless — JSON (same response shape as api.ipify.org)
curl "https://whatsmy.fyi/ip?format=json"

# With a key — full geolocation
curl https://whatsmy.fyi/api/v1/ip -H "Authorization: Bearer wmf_your_key"
```

The SDK earns its place when you want types, retries, and structured errors.

## About the API

- **Runs on Cloudflare's edge** in 300+ cities — IP data comes from the request
  itself, not from an external geolocation database lookup.
- **Zero logs.** We process your IP to return it to you and store nothing.
  The [privacy policy](https://whatsmy.fyi/privacy) is short because there's
  nothing to disclose.
- **Free tier is the product**, not a trial: 10,000 requests/day per key,
  commercial use allowed. [Enterprise](https://whatsmy.fyi/enterprise) exists
  for custom limits and SLAs.
- Full reference: [whatsmy.fyi/docs](https://whatsmy.fyi/docs) ·
  [OpenAPI 3.1 spec](https://whatsmy.fyi/openapi.json) ·
  [how we compare to other IP APIs](https://whatsmy.fyi/compare)

## Contributing

Issues and pull requests are welcome — and they get answered. See
[CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) — built by [Koray Köylü](https://gravatar.com/koraykoylu) at
[whatsmy.fyi](https://whatsmy.fyi).
