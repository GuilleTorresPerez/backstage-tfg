import express from 'express';
import request from 'supertest';
import {
  AuthenticationError,
  NotAllowedError,
  InputError,
} from '@backstage/errors';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { createRouter, DEFAULT_LIMIT, MAX_LIMIT } from './router';
import { AuditStore } from './AuditStore';
import { encodeCursor } from './AuditCursor';

function makeHttpAuth(opts: { authenticated: boolean }) {
  return {
    credentials: jest.fn().mockImplementation(async () => {
      if (!opts.authenticated) throw new AuthenticationError('no auth');
      return { principal: { type: 'user', userEntityRef: 'user:default/x' } };
    }),
  };
}

function makePermissions(result: AuthorizeResult) {
  return {
    authorize: jest.fn().mockResolvedValue([{ result }]),
    authorizeConditional: jest.fn(),
  };
}

function makeStore(
  query: jest.Mock = jest
    .fn()
    .mockResolvedValue({ items: [], hasMore: false, nextCursor: undefined }),
) {
  return { insert: jest.fn(), query } as unknown as AuditStore & {
    query: jest.Mock;
    insert: jest.Mock;
  };
}

async function buildApp(deps: {
  store: AuditStore;
  permissions: any;
  httpAuth: any;
}) {
  const router = await createRouter(deps);
  const app = express();
  app.use(router);
  // Minimal error middleware: translate Backstage errors to HTTP codes.
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (err instanceof AuthenticationError) {
        return res.status(401).json({ error: { name: err.name } });
      }
      if (err instanceof NotAllowedError) {
        return res.status(403).json({ error: { name: err.name } });
      }
      if (err instanceof InputError) {
        return res.status(400).json({ error: { name: err.name } });
      }
      return res.status(500).json({ error: { name: err.name } });
    },
  );
  return app;
}

describe('audit router', () => {
  it('returns 401 when not authenticated', async () => {
    const app = await buildApp({
      store: makeStore() as any,
      permissions: makePermissions(AuthorizeResult.ALLOW),
      httpAuth: makeHttpAuth({ authenticated: false }),
    });
    const res = await request(app).get('/events');
    expect(res.status).toBe(401);
  });

  it('returns 403 when permission DENY', async () => {
    const app = await buildApp({
      store: makeStore() as any,
      permissions: makePermissions(AuthorizeResult.DENY),
      httpAuth: makeHttpAuth({ authenticated: true }),
    });
    const res = await request(app).get('/events');
    expect(res.status).toBe(403);
  });

  it('returns 200 with body shape when ALLOWed', async () => {
    const store = makeStore(
      jest.fn().mockResolvedValue({
        items: [{ id: 'r1', eventId: 'e1' }],
        hasMore: true,
        nextCursor: 'abc',
      }),
    );
    const app = await buildApp({
      store: store as any,
      permissions: makePermissions(AuthorizeResult.ALLOW),
      httpAuth: makeHttpAuth({ authenticated: true }),
    });
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      items: [{ id: 'r1', eventId: 'e1' }],
      hasMore: true,
      nextCursor: 'abc',
    });
  });

  it('applies default limit of 50 when not given', async () => {
    const store = makeStore();
    const app = await buildApp({
      store: store as any,
      permissions: makePermissions(AuthorizeResult.ALLOW),
      httpAuth: makeHttpAuth({ authenticated: true }),
    });
    await request(app).get('/events').expect(200);
    expect(store.query).toHaveBeenCalledWith(expect.anything(), undefined, DEFAULT_LIMIT);
  });

  it('caps limit at 200 when over-requested', async () => {
    const store = makeStore();
    const app = await buildApp({
      store: store as any,
      permissions: makePermissions(AuthorizeResult.ALLOW),
      httpAuth: makeHttpAuth({ authenticated: true }),
    });
    await request(app).get('/events?limit=1000').expect(200);
    expect(store.query).toHaveBeenCalledWith(expect.anything(), undefined, MAX_LIMIT);
  });

  it('passes filter params through to the store', async () => {
    const store = makeStore();
    const app = await buildApp({
      store: store as any,
      permissions: makePermissions(AuthorizeResult.ALLOW),
      httpAuth: makeHttpAuth({ authenticated: true }),
    });
    await request(app)
      .get(
        '/events?actor=user:default/alice&eventId=catalog.entity.create&status=succeeded&from=2026-01-01&to=2026-12-31&limit=10',
      )
      .expect(200);

    expect(store.query).toHaveBeenCalledWith(
      {
        actor: 'user:default/alice',
        eventId: 'catalog.entity.create',
        severity: undefined,
        status: 'succeeded',
        from: '2026-01-01',
        to: '2026-12-31',
      },
      undefined,
      10,
    );
  });

  it('accepts a single severity as a string', async () => {
    const store = makeStore();
    const app = await buildApp({
      store: store as any,
      permissions: makePermissions(AuthorizeResult.ALLOW),
      httpAuth: makeHttpAuth({ authenticated: true }),
    });
    await request(app).get('/events?severity=high').expect(200);
    expect(store.query.mock.calls[0][0].severity).toEqual(['high']);
  });

  it('accepts a repeatable severity (OR)', async () => {
    const store = makeStore();
    const app = await buildApp({
      store: store as any,
      permissions: makePermissions(AuthorizeResult.ALLOW),
      httpAuth: makeHttpAuth({ authenticated: true }),
    });
    await request(app)
      .get('/events?severity=high&severity=critical')
      .expect(200);
    expect(store.query.mock.calls[0][0].severity).toEqual(['high', 'critical']);
  });

  it('decodes cursor and passes the decoded object to the store', async () => {
    const store = makeStore();
    const app = await buildApp({
      store: store as any,
      permissions: makePermissions(AuthorizeResult.ALLOW),
      httpAuth: makeHttpAuth({ authenticated: true }),
    });
    const cursorStr = encodeCursor({ ts: '2026-05-14T10:00:00Z', id: 'abc' });
    await request(app).get(`/events?cursor=${cursorStr}`).expect(200);
    expect(store.query).toHaveBeenCalledWith(expect.anything(), {
      ts: '2026-05-14T10:00:00Z',
      id: 'abc',
    }, DEFAULT_LIMIT);
  });

  it('returns 400 on malformed cursor', async () => {
    const store = makeStore();
    const app = await buildApp({
      store: store as any,
      permissions: makePermissions(AuthorizeResult.ALLOW),
      httpAuth: makeHttpAuth({ authenticated: true }),
    });
    // Decoded as bytes that aren't JSON.
    const bad = Buffer.from('not-json', 'utf-8').toString('base64url');
    await request(app).get(`/events?cursor=${bad}`).expect(400);
  });
});
