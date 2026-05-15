import { createPermission } from '@backstage/plugin-permission-common';

export const auditEventReadPermission = createPermission({
  name: 'audit.event.read',
  attributes: { action: 'read' },
});
