import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditEvent {
  id: string;
  ts: string;
  eventId: string;
  severity: AuditSeverity;
  status: string;
  actorRef?: string | null;
  pluginId: string;
  sourceIp?: string | null;
  userAgent?: string | null;
  httpMethod?: string | null;
  httpPath?: string | null;
  meta?: Record<string, unknown>;
  errorMessage?: string | null;
}

export interface AuditEventsPage {
  items: AuditEvent[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface ListEventsOptions {
  actor?: string;
  eventId?: string;
  severity?: AuditSeverity[];
  status?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

export interface AuditApi {
  listEvents(options?: ListEventsOptions): Promise<AuditEventsPage>;
}

export const auditApiRef = createApiRef<AuditApi>({
  id: 'plugin.audit.api',
});

export class AuditForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'AuditForbiddenError';
  }
}

export class AuditClient implements AuditApi {
  constructor(
    private readonly opts: {
      discoveryApi: DiscoveryApi;
      fetchApi: FetchApi;
    },
  ) {}

  async listEvents(options: ListEventsOptions = {}): Promise<AuditEventsPage> {
    const baseUrl = await this.opts.discoveryApi.getBaseUrl('audit');
    const params = new URLSearchParams();
    const single: Array<[string, string | number | undefined]> = [
      ['actor', options.actor],
      ['eventId', options.eventId],
      ['status', options.status],
      ['from', options.from],
      ['to', options.to],
      ['cursor', options.cursor],
      ['limit', options.limit],
    ];
    for (const [key, value] of single) {
      if (value !== undefined) params.append(key, String(value));
    }
    for (const value of options.severity ?? []) {
      params.append('severity', value);
    }
    const qs = params.toString();
    const url = qs ? `${baseUrl}/events?${qs}` : `${baseUrl}/events`;
    const res = await this.opts.fetchApi.fetch(url);
    if (res.status === 403) {
      throw new AuditForbiddenError();
    }
    if (!res.ok) {
      throw new Error(
        `Failed to fetch audit events: ${res.status} ${res.statusText}`.trim(),
      );
    }
    const body = (await res.json()) as {
      items: AuditEvent[];
      hasMore: boolean;
      nextCursor?: string | null;
    };
    return {
      items: body.items,
      hasMore: body.hasMore,
      nextCursor: body.nextCursor ?? undefined,
    };
  }
}
