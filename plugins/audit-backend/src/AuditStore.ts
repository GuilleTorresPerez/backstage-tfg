import { Knex } from 'knex';
import { randomUUID } from 'crypto';
import { encodeCursor, AuditCursor } from './AuditCursor';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditEventRow {
  id?: string;
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

export interface AuditQueryFilter {
  actor?: string;
  eventId?: string;
  severity?: AuditSeverity[];
  status?: string;
  from?: string;
  to?: string;
}

export interface AuditQueryResult {
  items: AuditEventRow[];
  nextCursor?: string;
  hasMore: boolean;
}

interface DbRow {
  id: string;
  ts: Date | string;
  event_id: string;
  severity: string;
  status: string;
  actor_ref: string | null;
  plugin_id: string;
  source_ip: string | null;
  user_agent: string | null;
  http_method: string | null;
  http_path: string | null;
  meta: Record<string, unknown> | string | null;
  error_message: string | null;
}

function parseMeta(value: DbRow['meta']): Record<string, unknown> {
  if (value === null || value === undefined) return {};
  if (typeof value === 'string') {
    try {
      return value === '' ? {} : (JSON.parse(value) as Record<string, unknown>);
    } catch {
      return {};
    }
  }
  return value;
}

function rowFromDb(row: DbRow): AuditEventRow {
  const ts =
    row.ts instanceof Date ? row.ts.toISOString() : new Date(row.ts).toISOString();
  return {
    id: row.id,
    ts,
    eventId: row.event_id,
    severity: row.severity as AuditSeverity,
    status: row.status,
    actorRef: row.actor_ref,
    pluginId: row.plugin_id,
    sourceIp: row.source_ip,
    userAgent: row.user_agent,
    httpMethod: row.http_method,
    httpPath: row.http_path,
    meta: parseMeta(row.meta),
    errorMessage: row.error_message,
  };
}

export class AuditStore {
  constructor(private readonly db: Knex) {}

  async insert(event: AuditEventRow): Promise<void> {
    const isPg = this.db.client.config.client === 'pg';
    const meta = event.meta ?? {};
    await this.db('audit_events').insert({
      id: event.id ?? randomUUID(),
      ts: event.ts,
      event_id: event.eventId,
      severity: event.severity,
      status: event.status,
      actor_ref: event.actorRef ?? null,
      plugin_id: event.pluginId,
      source_ip: event.sourceIp ?? null,
      user_agent: event.userAgent ?? null,
      http_method: event.httpMethod ?? null,
      http_path: event.httpPath ?? null,
      meta: isPg ? meta : JSON.stringify(meta),
      error_message: event.errorMessage ?? null,
    });
  }

  async query(
    filter: AuditQueryFilter,
    cursor: AuditCursor | undefined,
    limit: number,
  ): Promise<AuditQueryResult> {
    let q = this.db('audit_events').select('*');

    if (filter.actor) q = q.where('actor_ref', filter.actor);
    if (filter.eventId) q = q.where('event_id', filter.eventId);
    if (filter.severity && filter.severity.length > 0) {
      q = q.whereIn('severity', filter.severity);
    }
    if (filter.status) q = q.where('status', filter.status);
    if (filter.from) q = q.where('ts', '>=', filter.from);
    if (filter.to) q = q.where('ts', '<=', filter.to);

    if (cursor) {
      // (ts, id) < (cursor.ts, cursor.id) — row-value comparison for stable
      // pagination under concurrent inserts.
      q = q.whereRaw('(ts, id) < (?, ?)', [cursor.ts, cursor.id]);
    }

    const rows = (await q
      .orderBy([
        { column: 'ts', order: 'desc' },
        { column: 'id', order: 'desc' },
      ])
      .limit(limit + 1)) as DbRow[];

    const hasMore = rows.length > limit;
    const visible = hasMore ? rows.slice(0, limit) : rows;
    const items = visible.map(rowFromDb);

    const nextCursor =
      hasMore && items.length > 0
        ? encodeCursor({
            ts: items[items.length - 1].ts,
            id: items[items.length - 1].id!,
          })
        : undefined;

    return { items, hasMore, nextCursor };
  }
}
