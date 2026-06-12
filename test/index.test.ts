import { afterEach, describe, expect, it, vi } from 'vitest';
import { WhatsMyFyi, WhatsMyFyiError } from '../src/index';

function mockFetchOnce(status: number, body: unknown) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('keyless mode', () => {
  it('address() works without an API key via /ip', async () => {
    const spy = mockFetchOnce(200, { ip: '203.0.113.42' });
    const client = new WhatsMyFyi();
    expect(await client.ip.address()).toBe('203.0.113.42');
    expect(spy).toHaveBeenCalledWith(
      'https://whatsmy.fyi/ip?format=json',
      expect.objectContaining({ headers: undefined })
    );
  });

  it('lookup() without a key throws missing_api_key', async () => {
    const client = new WhatsMyFyi();
    await expect(client.ip.lookup()).rejects.toMatchObject({
      name: 'WhatsMyFyiError',
      code: 'missing_api_key',
      status: 401,
    });
  });
});

describe('authenticated mode', () => {
  it('lookup() sends Bearer auth and returns the response', async () => {
    const spy = mockFetchOnce(200, { status: 'success', ip: '203.0.113.42', ipv6: null, city: 'Amsterdam' });
    const client = new WhatsMyFyi({ apiKey: 'wmf_test' });
    const data = await client.ip.lookup();
    expect(data.city).toBe('Amsterdam');
    expect(spy).toHaveBeenCalledWith(
      'https://whatsmy.fyi/api/v1/ip',
      expect.objectContaining({ headers: { Authorization: 'Bearer wmf_test' } })
    );
  });

  it('location() maps fields', async () => {
    mockFetchOnce(200, {
      status: 'success', ip: '1.2.3.4', ipv6: null,
      city: 'Istanbul', country: 'TR', country_name: 'Turkey',
      latitude: 41.0, longitude: 28.9,
    });
    const client = new WhatsMyFyi({ apiKey: 'wmf_test' });
    expect(await client.ip.location()).toEqual({
      city: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.0, lng: 28.9,
    });
  });

  it('API errors surface as WhatsMyFyiError with code and status', async () => {
    mockFetchOnce(429, { error: 'rate_limit_exceeded', message: 'Slow down.' });
    const client = new WhatsMyFyi({ apiKey: 'wmf_test' });
    try {
      await client.ip.lookup();
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(WhatsMyFyiError);
      expect((err as WhatsMyFyiError).code).toBe('rate_limit_exceeded');
      expect((err as WhatsMyFyiError).status).toBe(429);
    }
  });

  it('retries on 5xx and succeeds', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('oops', { status: 502 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'success', ip: '1.2.3.4', ipv6: null }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      }));
    const client = new WhatsMyFyi({ apiKey: 'wmf_test' });
    const data = await client.ip.lookup();
    expect(data.ip).toBe('1.2.3.4');
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe('options', () => {
  it('custom baseUrl is respected and trailing slash stripped', async () => {
    const spy = mockFetchOnce(200, { ip: '5.6.7.8' });
    const client = new WhatsMyFyi({ baseUrl: 'https://example.test/' });
    await client.ip.address();
    expect(spy).toHaveBeenCalledWith('https://example.test/ip?format=json', expect.anything());
  });
});
