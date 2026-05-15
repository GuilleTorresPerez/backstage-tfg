import { createAuditLogFn, eventToRow } from './auditLogFn';
import { AuditStore } from './AuditStore';

function makeLogger() {
  const calls: Array<{ level: string; msg: string }> = [];
  const log =
    (level: string) =>
    (msg: string, ..._rest: unknown[]) => {
      calls.push({ level, msg });
    };
  const logger = {
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
    debug: log('debug'),
    child: () => logger,
  };
  return { logger, calls };
}

function makeFakeStore(): jest.Mocked<Pick<AuditStore, 'insert'>> {
  return { insert: jest.fn().mockResolvedValue(undefined) };
}

const mappings = {
  low: 'info',
  medium: 'info',
  high: 'warn',
  critical: 'error',
} as const;

describe('createAuditLogFn', () => {
  it('always logs to stdout, regardless of severity', async () => {
    const { logger, calls } = makeLogger();
    const store = makeFakeStore();
    const logFn = createAuditLogFn({
      auditLogger: logger as any,
      store: store as unknown as AuditStore,
      severityLogLevelMappings: mappings,
    });

    await logFn({
      plugin: 'catalog',
      eventId: 'catalog.entity.create',
      severityLevel: 'low',
      actor: {},
      status: 'succeeded',
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].msg).toBe('catalog.catalog.entity.create');
  });

  it('does NOT insert into store for low severity', async () => {
    const { logger } = makeLogger();
    const store = makeFakeStore();
    const logFn = createAuditLogFn({
      auditLogger: logger as any,
      store: store as unknown as AuditStore,
      severityLogLevelMappings: mappings,
    });

    await logFn({
      plugin: 'catalog',
      eventId: 'catalog.entity.read',
      severityLevel: 'low',
      actor: {},
      status: 'succeeded',
    });

    expect(store.insert).not.toHaveBeenCalled();
  });

  it.each(['medium', 'high', 'critical'] as const)(
    'inserts into store for %s severity',
    async severity => {
      const { logger } = makeLogger();
      const store = makeFakeStore();
      const logFn = createAuditLogFn({
        auditLogger: logger as any,
        store: store as unknown as AuditStore,
        severityLogLevelMappings: mappings,
      });

      await logFn({
        plugin: 'catalog',
        eventId: 'catalog.entity.create',
        severityLevel: severity,
        actor: {},
        status: 'succeeded',
      });

      expect(store.insert).toHaveBeenCalledTimes(1);
    },
  );
});

describe('eventToRow', () => {
  it('maps core AuditorEvent fields to AuditEventRow', () => {
    const row = eventToRow({
      plugin: 'catalog',
      eventId: 'catalog.entity.create',
      severityLevel: 'medium',
      actor: {
        actorId: 'user:default/alice',
        ip: '1.2.3.4',
        userAgent: 'curl/8',
      },
      request: { url: '/api/catalog/entities', method: 'POST' },
      meta: { entityRef: 'component:default/svc' },
      status: 'succeeded',
    });

    expect(row).toMatchObject({
      eventId: 'catalog.entity.create',
      severity: 'medium',
      status: 'succeeded',
      actorRef: 'user:default/alice',
      pluginId: 'catalog',
      sourceIp: '1.2.3.4',
      userAgent: 'curl/8',
      httpMethod: 'POST',
      httpPath: '/api/catalog/entities',
      meta: { entityRef: 'component:default/svc' },
    });
    expect(typeof row.ts).toBe('string');
  });

  it('captures error.message when status is failed', () => {
    const row = eventToRow({
      plugin: 'scaffolder',
      eventId: 'scaffolder.task.create',
      severityLevel: 'high',
      actor: { actorId: 'user:default/bob' },
      status: 'failed',
      error: new Error('boom'),
    });
    expect(row.errorMessage).toBe('boom');
    expect(row.status).toBe('failed');
  });
});
