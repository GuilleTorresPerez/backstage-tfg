import { encodeCursor, decodeCursor } from './AuditCursor';

describe('AuditCursor', () => {
  it('roundtrips ts and id through encode/decode', () => {
    const cursor = {
      ts: '2026-05-14T12:34:56.789012Z',
      id: '550e8400-e29b-41d4-a716-446655440000',
    };
    expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor);
  });

  it('produces URL-safe output (no +, /, or = padding)', () => {
    const cursor = {
      ts: '2026-05-14T12:34:56.789012Z',
      id: '550e8400-e29b-41d4-a716-446655440000',
    };
    expect(encodeCursor(cursor)).not.toMatch(/[+/=]/);
  });

  it('preserves microsecond precision in ts', () => {
    const cursor = { ts: '2026-05-14T12:34:56.123456Z', id: 'abc' };
    expect(decodeCursor(encodeCursor(cursor)).ts).toBe(
      '2026-05-14T12:34:56.123456Z',
    );
  });

  it('decode rejects garbled non-JSON payloads with a clear error', () => {
    const garbage = Buffer.from('not json at all', 'utf-8').toString(
      'base64url',
    );
    expect(() => decodeCursor(garbage)).toThrow(/cursor/i);
  });

  it('decode rejects payloads missing ts', () => {
    const partial = Buffer.from(JSON.stringify({ id: 'abc' }), 'utf-8').toString(
      'base64url',
    );
    expect(() => decodeCursor(partial)).toThrow(/cursor/i);
  });

  it('decode rejects payloads missing id', () => {
    const partial = Buffer.from(
      JSON.stringify({ ts: '2026-05-14T12:34:56.789Z' }),
      'utf-8',
    ).toString('base64url');
    expect(() => decodeCursor(partial)).toThrow(/cursor/i);
  });
});
