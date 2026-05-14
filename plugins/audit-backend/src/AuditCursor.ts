import { InputError } from '@backstage/errors';

export interface AuditCursor {
  ts: string;
  id: string;
}

export function encodeCursor(cursor: AuditCursor): string {
  return Buffer.from(JSON.stringify(cursor), 'utf-8').toString('base64url');
}

export function decodeCursor(raw: string): AuditCursor {
  let parsed: unknown;
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf-8');
    parsed = JSON.parse(json);
  } catch {
    throw new InputError(`Invalid cursor: ${raw}`);
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof (parsed as { ts?: unknown }).ts !== 'string' ||
    typeof (parsed as { id?: unknown }).id !== 'string'
  ) {
    throw new InputError(`Invalid cursor: ${raw}`);
  }

  return parsed as AuditCursor;
}
