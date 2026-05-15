import { Knex } from 'knex';
import { AuditStore, AuditEventRow } from './AuditStore';
import { decodeCursor } from './AuditCursor';
import { createTestKnex, itIfPg, resetAuditEvents } from './testUtils';

function row(overrides: Partial<AuditEventRow> = {}): AuditEventRow {
  return {
    ts: '2026-05-14T10:00:00.000000Z',
    eventId: 'catalog.entity.create',
    severity: 'medium',
    status: 'succeeded',
    actorRef: 'user:default/alice',
    pluginId: 'catalog',
    meta: {},
    ...overrides,
  };
}

itIfPg('AuditStore (integration)', () => {
  let db: Knex;
  let store: AuditStore;

  beforeAll(async () => {
    db = await createTestKnex();
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    await resetAuditEvents(db);
    store = new AuditStore(db);
  });

  describe('insert + query roundtrip', () => {
    it('roundtrips a row through insert and query', async () => {
      await store.insert(
        row({
          meta: { entityRef: 'component:default/my-svc' },
        }),
      );

      const result = await store.query({}, undefined, 50);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        eventId: 'catalog.entity.create',
        severity: 'medium',
        status: 'succeeded',
        actorRef: 'user:default/alice',
        pluginId: 'catalog',
        meta: { entityRef: 'component:default/my-svc' },
      });
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeUndefined();
    });
  });

  describe('sort', () => {
    it('returns rows in ts DESC order (newest first)', async () => {
      await store.insert(
        row({ ts: '2026-05-14T10:00:00.000Z', eventId: 'old' }),
      );
      await store.insert(
        row({ ts: '2026-05-14T12:00:00.000Z', eventId: 'new' }),
      );
      await store.insert(
        row({ ts: '2026-05-14T11:00:00.000Z', eventId: 'mid' }),
      );

      const result = await store.query({}, undefined, 50);

      expect(result.items.map(i => i.eventId)).toEqual(['new', 'mid', 'old']);
    });

    it('breaks ts ties by id DESC', async () => {
      // Same ts → deterministic ordering by id DESC.
      const sameTs = '2026-05-14T10:00:00.000Z';
      await store.insert(
        row({
          id: '11111111-1111-1111-1111-111111111111',
          ts: sameTs,
          eventId: 'low-id',
        }),
      );
      await store.insert(
        row({
          id: '99999999-9999-9999-9999-999999999999',
          ts: sameTs,
          eventId: 'high-id',
        }),
      );

      const result = await store.query({}, undefined, 50);

      expect(result.items.map(i => i.eventId)).toEqual(['high-id', 'low-id']);
    });
  });

  describe('hasMore and nextCursor', () => {
    it('hasMore=false and no nextCursor when matches < limit', async () => {
      await store.insert(row({ eventId: 'a' }));
      const result = await store.query({}, undefined, 5);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeUndefined();
    });

    it('hasMore=false and no nextCursor when matches == limit exactly', async () => {
      for (let i = 0; i < 3; i++) {
        await store.insert(
          row({ ts: `2026-05-14T10:0${i}:00.000Z`, eventId: `e${i}` }),
        );
      }
      const result = await store.query({}, undefined, 3);
      expect(result.items).toHaveLength(3);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeUndefined();
    });

    it('hasMore=true and returns nextCursor when matches > limit', async () => {
      for (let i = 0; i < 5; i++) {
        await store.insert(
          row({ ts: `2026-05-14T10:0${i}:00.000Z`, eventId: `e${i}` }),
        );
      }
      const result = await store.query({}, undefined, 3);
      expect(result.items).toHaveLength(3);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBeDefined();

      const decoded = decodeCursor(result.nextCursor!);
      const lastItem = result.items[result.items.length - 1];
      expect(decoded.id).toBe(lastItem.id);
    });
  });

  describe('cursor pagination', () => {
    it('returns the next page when given the previous nextCursor', async () => {
      for (let i = 0; i < 5; i++) {
        await store.insert(
          row({ ts: `2026-05-14T10:0${i}:00.000Z`, eventId: `e${i}` }),
        );
      }

      const first = await store.query({}, undefined, 2);
      expect(first.items.map(i => i.eventId)).toEqual(['e4', 'e3']);

      const second = await store.query({}, decodeCursor(first.nextCursor!), 2);
      expect(second.items.map(i => i.eventId)).toEqual(['e2', 'e1']);

      const third = await store.query({}, decodeCursor(second.nextCursor!), 2);
      expect(third.items.map(i => i.eventId)).toEqual(['e0']);
      expect(third.hasMore).toBe(false);
    });

    it('is stable when newer rows are inserted between page fetches', async () => {
      // Seed 4 rows; fetch page 1 (2 rows); insert 2 newer rows;
      // page 2 must still return the original older rows, not skip them.
      for (let i = 0; i < 4; i++) {
        await store.insert(
          row({ ts: `2026-05-14T10:0${i}:00.000Z`, eventId: `old${i}` }),
        );
      }

      const first = await store.query({}, undefined, 2);
      expect(first.items.map(i => i.eventId)).toEqual(['old3', 'old2']);

      // Insert two newer rows AFTER first page.
      await store.insert(
        row({ ts: '2026-05-14T11:00:00.000Z', eventId: 'newer1' }),
      );
      await store.insert(
        row({ ts: '2026-05-14T11:01:00.000Z', eventId: 'newer2' }),
      );

      const second = await store.query({}, decodeCursor(first.nextCursor!), 2);
      // Original old1, old0 still returned — no skipping.
      expect(second.items.map(i => i.eventId)).toEqual(['old1', 'old0']);
    });
  });

  describe('filters', () => {
    beforeEach(async () => {
      // A small variety of rows for filter assertions.
      await store.insert(
        row({
          ts: '2026-05-14T10:00:00.000Z',
          eventId: 'catalog.entity.create',
          severity: 'medium',
          status: 'succeeded',
          actorRef: 'user:default/alice',
        }),
      );
      await store.insert(
        row({
          ts: '2026-05-14T11:00:00.000Z',
          eventId: 'scaffolder.task.create',
          severity: 'high',
          status: 'failed',
          actorRef: 'user:default/bob',
        }),
      );
      await store.insert(
        row({
          ts: '2026-05-14T12:00:00.000Z',
          eventId: 'catalog.entity.delete',
          severity: 'critical',
          status: 'succeeded',
          actorRef: 'user:default/alice',
        }),
      );
    });

    it('narrows by actor', async () => {
      const r = await store.query(
        { actor: 'user:default/alice' },
        undefined,
        50,
      );
      expect(r.items.map(i => i.eventId)).toEqual([
        'catalog.entity.delete',
        'catalog.entity.create',
      ]);
    });

    it('narrows by eventId', async () => {
      const r = await store.query(
        { eventId: 'scaffolder.task.create' },
        undefined,
        50,
      );
      expect(r.items).toHaveLength(1);
      expect(r.items[0].eventId).toBe('scaffolder.task.create');
    });

    it('narrows by single severity', async () => {
      const r = await store.query({ severity: ['high'] }, undefined, 50);
      expect(r.items).toHaveLength(1);
      expect(r.items[0].severity).toBe('high');
    });

    it('narrows by repeatable severity (OR)', async () => {
      const r = await store.query(
        { severity: ['high', 'critical'] },
        undefined,
        50,
      );
      expect(r.items.map(i => i.severity).sort()).toEqual(['critical', 'high']);
    });

    it('narrows by status', async () => {
      const r = await store.query({ status: 'failed' }, undefined, 50);
      expect(r.items).toHaveLength(1);
      expect(r.items[0].status).toBe('failed');
    });

    it('narrows by from (ts >= from)', async () => {
      const r = await store.query(
        { from: '2026-05-14T11:00:00.000Z' },
        undefined,
        50,
      );
      expect(r.items.map(i => i.eventId)).toEqual([
        'catalog.entity.delete',
        'scaffolder.task.create',
      ]);
    });

    it('narrows by to (ts <= to)', async () => {
      const r = await store.query(
        { to: '2026-05-14T11:00:00.000Z' },
        undefined,
        50,
      );
      expect(r.items.map(i => i.eventId)).toEqual([
        'scaffolder.task.create',
        'catalog.entity.create',
      ]);
    });
  });
});
