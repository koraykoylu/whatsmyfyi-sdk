# Changelog

## 0.2.0 — 2026-06-12

- **New:** keyless mode — `new WhatsMyFyi()` without an API key now works;
  `client.ip.address()` uses the keyless `https://whatsmy.fyi/ip` endpoint.
- **New:** `lookup()`, `location()`, and `org()` without a key throw a clear
  `WhatsMyFyiError` (`missing_api_key`) pointing to the free signup.
- **New:** test suite (vitest) and CI.
- Published from the new home: [github.com/koraykoylu/whatsmyfyi-sdk](https://github.com/koraykoylu/whatsmyfyi-sdk).

## 0.1.0 — 2026-06-07

- Initial release: `WhatsMyFyi` client with `ip.lookup()`, `ip.address()`,
  `ip.location()`, `ip.org()`, typed responses, `WhatsMyFyiError`, automatic
  retry on 5xx.
