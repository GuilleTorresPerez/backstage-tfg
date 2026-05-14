import express from 'express';
import Router from 'express-promise-router';
import { z } from 'zod';
import { InputError, NotAllowedError } from '@backstage/errors';
import {
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { AuditStore, AuditSeverity } from './AuditStore';
import { decodeCursor } from './AuditCursor';
import { auditEventReadPermission } from './permissions';

export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 200;

const severitySchema = z.enum(['low', 'medium', 'high', 'critical']);

const querySchema = z.object({
  actor: z.string().optional(),
  eventId: z.string().optional(),
  severity: z.union([severitySchema, z.array(severitySchema)]).optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

export async function createRouter(options: {
  store: AuditStore;
  permissions: PermissionsService;
  httpAuth: HttpAuthService;
}): Promise<express.Router> {
  const { store, permissions, httpAuth } = options;
  const router = Router();
  router.use(express.json());

  router.get('/events', async (req, res) => {
    const credentials = await httpAuth.credentials(req, {
      allow: ['user', 'service'],
    });

    const [decision] = await permissions.authorize(
      [{ permission: auditEventReadPermission }],
      { credentials },
    );
    if (decision.result !== AuthorizeResult.ALLOW) {
      throw new NotAllowedError('Forbidden');
    }

    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new InputError(parsed.error.toString());
    }

    const { actor, eventId, severity, status, from, to, cursor, limit } =
      parsed.data;

    const severityList: AuditSeverity[] | undefined =
      severity === undefined
        ? undefined
        : Array.isArray(severity)
          ? severity
          : [severity];

    const limitClamped = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const decodedCursor = cursor ? decodeCursor(cursor) : undefined;

    const result = await store.query(
      { actor, eventId, severity: severityList, status, from, to },
      decodedCursor,
      limitClamped,
    );

    res.json(result);
  });

  return router;
}
