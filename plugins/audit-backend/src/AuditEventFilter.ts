export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

const PERSISTED_SEVERITIES: ReadonlySet<AuditSeverity> = new Set([
  'medium',
  'high',
  'critical',
]);

export function shouldPersist(event: { severityLevel: AuditSeverity }): boolean {
  return PERSISTED_SEVERITIES.has(event.severityLevel);
}
