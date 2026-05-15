import { LoggerService } from '@backstage/backend-plugin-api';
import { JsonObject } from '@backstage/types';
import { AuditStore, AuditEventRow, AuditSeverity } from './AuditStore';
import { shouldPersist } from './AuditEventFilter';

export interface AuditorEventLike {
  plugin: string;
  eventId: string;
  severityLevel: AuditSeverity;
  actor: {
    actorId?: string;
    ip?: string;
    hostname?: string;
    userAgent?: string;
  };
  request?: { url: string; method: string };
  meta?: Record<string, unknown>;
  status: 'initiated' | 'succeeded' | 'failed';
  error?: Error;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function eventToRow(event: AuditorEventLike): AuditEventRow {
  return {
    ts: new Date().toISOString(),
    eventId: event.eventId,
    severity: event.severityLevel,
    status: event.status,
    actorRef: event.actor?.actorId ?? null,
    pluginId: event.plugin,
    sourceIp: event.actor?.ip ?? null,
    userAgent: event.actor?.userAgent ?? null,
    httpMethod: event.request?.method ?? null,
    httpPath: event.request?.url ?? null,
    meta: event.meta ?? {},
    errorMessage: event.error?.message ?? null,
  };
}

export function createAuditLogFn(options: {
  auditLogger: LoggerService;
  store: Pick<AuditStore, 'insert'>;
  severityLogLevelMappings: Record<AuditSeverity, LogLevel>;
}) {
  const { auditLogger, store, severityLogLevelMappings } = options;

  return async (event: AuditorEventLike): Promise<void> => {
    const level = severityLogLevelMappings[event.severityLevel] ?? 'info';
    const msg = `${event.plugin}.${event.eventId}`;

    if (event.error) {
      const { error, ...rest } = event;
      auditLogger.child(rest as unknown as JsonObject)[level](msg, error);
    } else {
      auditLogger[level](msg, event as unknown as JsonObject);
    }

    if (shouldPersist(event)) {
      await store.insert(eventToRow(event));
    }
  };
}
