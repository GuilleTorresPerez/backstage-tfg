import {
  coreServices,
  createServiceFactory,
} from '@backstage/backend-plugin-api';
import { DefaultAuditorService } from '@backstage/backend-defaults/auditor';
import { createAuditLogFn, LogLevel } from './auditLogFn';
import { auditStoreServiceRef } from './auditStoreService';
import { AuditSeverity } from './AuditStore';

const DEFAULT_SEVERITY_LOG_LEVELS: Record<AuditSeverity, LogLevel> = {
  low: 'debug',
  medium: 'info',
  high: 'warn',
  critical: 'error',
};

function readSeverityLogLevelMappings(config: {
  getOptionalString(key: string): string | undefined;
}): Record<AuditSeverity, LogLevel> {
  const result = { ...DEFAULT_SEVERITY_LOG_LEVELS };
  for (const sev of ['low', 'medium', 'high', 'critical'] as const) {
    const v = config.getOptionalString(
      `backend.auditor.severityLogLevelMappings.${sev}`,
    );
    if (v) {
      result[sev] = v as LogLevel;
    }
  }
  return result;
}

export const auditorServiceFactory = createServiceFactory({
  service: coreServices.auditor,
  deps: {
    config: coreServices.rootConfig,
    logger: coreServices.logger,
    auth: coreServices.auth,
    httpAuth: coreServices.httpAuth,
    plugin: coreServices.pluginMetadata,
    store: auditStoreServiceRef,
  },
  factory({ config, logger, plugin, auth, httpAuth, store }) {
    const auditLogger = logger.child({ isAuditEvent: true });
    const severityLogLevelMappings = readSeverityLogLevelMappings(config);

    const logFn = createAuditLogFn({
      auditLogger,
      store,
      severityLogLevelMappings,
    });

    return DefaultAuditorService.create(logFn, { plugin, auth, httpAuth });
  },
});
