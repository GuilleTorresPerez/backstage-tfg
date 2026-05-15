import { AuditClient, AuditForbiddenError } from './AuditApi';

function jsonResponse(
  body: unknown,
  init: ResponseInit = { status: 200 },
): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
}

function makeClient(opts: { fetchMock: jest.Mock; baseUrl?: string }) {
  return new AuditClient({
    discoveryApi: {
      getBaseUrl: jest
        .fn()
        .mockResolvedValue(opts.baseUrl ?? 'http://localhost:7007/api/audit'),
    },
    fetchApi: { fetch: opts.fetchMock as unknown as typeof fetch },
  });
}

describe('AuditClient', () => {
  it('GETs /events on the audit base URL and returns the parsed page', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse({ items: [], hasMore: false }));
    const client = makeClient({ fetchMock });

    const page = await client.listEvents();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:7007/api/audit/events');
    expect(init?.method ?? 'GET').toBe('GET');
    expect(page).toEqual({ items: [], hasMore: false });
  });

  it('encodes multi-value severity as repeated query params', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse({ items: [], hasMore: false }));
    const client = makeClient({ fetchMock });

    await client.listEvents({ severity: ['high', 'critical'] });

    const [url] = fetchMock.mock.calls[0];
    const parsed = new URL(url as string);
    expect(parsed.pathname).toBe('/api/audit/events');
    expect(parsed.searchParams.getAll('severity')).toEqual([
      'high',
      'critical',
    ]);
  });

  it('wires single-value filters into the query string', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse({ items: [], hasMore: false }));
    const client = makeClient({ fetchMock });

    await client.listEvents({
      actor: 'user:default/alice',
      eventId: 'catalog.entity.create',
      status: 'failed',
      from: '2026-05-13T00:00:00.000Z',
      to: '2026-05-14T00:00:00.000Z',
      cursor: 'opaque-cursor',
      limit: 25,
    });

    const [url] = fetchMock.mock.calls[0];
    const params = new URL(url as string).searchParams;
    expect(params.get('actor')).toBe('user:default/alice');
    expect(params.get('eventId')).toBe('catalog.entity.create');
    expect(params.get('status')).toBe('failed');
    expect(params.get('from')).toBe('2026-05-13T00:00:00.000Z');
    expect(params.get('to')).toBe('2026-05-14T00:00:00.000Z');
    expect(params.get('cursor')).toBe('opaque-cursor');
    expect(params.get('limit')).toBe('25');
  });

  it('treats nextCursor=null as no next page and surfaces a present cursor', async () => {
    const sampleItem = {
      id: 'evt-1',
      ts: '2026-05-14T10:00:00.000Z',
      eventId: 'catalog.entity.create',
      severity: 'high',
      status: 'succeeded',
      pluginId: 'catalog',
    };

    const fetchEnd = jest.fn().mockResolvedValueOnce(
      jsonResponse({
        items: [sampleItem],
        hasMore: false,
        nextCursor: null,
      }),
    );
    const endPage = await makeClient({ fetchMock: fetchEnd }).listEvents();
    expect(endPage).toEqual({
      items: [sampleItem],
      hasMore: false,
      nextCursor: undefined,
    });

    const fetchMore = jest.fn().mockResolvedValueOnce(
      jsonResponse({
        items: [sampleItem],
        hasMore: true,
        nextCursor: 'next-page-cursor',
      }),
    );
    const morePage = await makeClient({ fetchMock: fetchMore }).listEvents();
    expect(morePage.nextCursor).toBe('next-page-cursor');
    expect(morePage.hasMore).toBe(true);
  });

  it('throws AuditForbiddenError when the API responds 403', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(jsonResponse({ error: 'Forbidden' }, { status: 403 }));
    const client = makeClient({ fetchMock });

    await expect(client.listEvents()).rejects.toBeInstanceOf(
      AuditForbiddenError,
    );
  });

  it('throws a descriptive error on other non-2xx responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response('boom', {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    );
    const client = makeClient({ fetchMock });

    const promise = client.listEvents();
    await expect(promise).rejects.toThrow(/500/);
    await expect(promise).rejects.not.toBeInstanceOf(AuditForbiddenError);
  });
});
