import {
  AuditorService,
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  CatalogProcessor,
  CatalogProcessorEmit,
  LocationSpec,
  processingResult,
} from '@backstage/plugin-catalog-node';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';

const ALLOWED_COMPONENT_TYPES = [
  'service',
  'library',
  'website',
  'documentation',
];
const ALLOWED_LIFECYCLES = ['experimental', 'production', 'deprecated'];
const ALLOWED_API_TYPES = ['openapi', 'asyncapi', 'graphql'];

export class TfgCatalogValidator implements CatalogProcessor {
  constructor(private readonly auditor: AuditorService) {}

  getProcessorName(): string {
    return 'TfgCatalogValidator';
  }

  // RC-COMP-05 / RC-VALID-01: spec.system es obligatorio en Component.
  // Lanzamos error bloqueante para que la entidad no se registre.
  async validateEntityKind(entity: Entity): Promise<boolean> {
    if (!entity.apiVersion?.startsWith('backstage.io/')) {
      return false;
    }
    if (entity.kind === 'Component') {
      const spec = (entity.spec ?? {}) as { system?: unknown };
      const system = typeof spec.system === 'string' ? spec.system.trim() : '';
      if (!system) {
        await this.emitViolation(entity, 'RC-COMP-05', spec.system);
        throw new Error(
          `Component '${entity.metadata.name}': spec.system es obligatorio (RC-COMP-05 / RC-VALID-01)`,
        );
      }
    }
    return false;
  }

  private async emitViolation(
    entity: Entity,
    rule: 'RC-COMP-05' | 'RC-COMP-02' | 'RC-COMP-03' | 'RC-API-02',
    value: unknown,
  ): Promise<void> {
    const meta = {
      rule,
      entityRef: stringifyEntityRef(entity),
      kind: entity.kind,
      value: value as any,
    };
    const event = await this.auditor.createEvent({
      eventId: 'entity-validate-tfg',
      severityLevel: 'medium',
      meta,
    });
    await event.fail({
      meta,
      error: new Error(`${rule}: validation failed`),
    });
  }

  // RC-COMP-02 / RC-COMP-03 / RC-API-02 / RC-VALID-02:
  // listas cerradas. Emitimos warning no bloqueante (generalError) para que
  // la entidad sea visible pero con badge de error en la UI.
  async preProcessEntity(
    entity: Entity,
    location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    if (!entity.apiVersion?.startsWith('backstage.io/')) {
      return entity;
    }
    const spec = (entity.spec ?? {}) as {
      type?: unknown;
      lifecycle?: unknown;
    };

    if (entity.kind === 'Component') {
      if (
        typeof spec.type === 'string' &&
        !ALLOWED_COMPONENT_TYPES.includes(spec.type)
      ) {
        emit(
          processingResult.generalError(
            location,
            `Component '${entity.metadata.name}': spec.type='${
              spec.type
            }' no está en la lista permitida [${ALLOWED_COMPONENT_TYPES.join(
              ', ',
            )}] (RC-COMP-02)`,
          ),
        );
        await this.emitViolation(entity, 'RC-COMP-02', spec.type);
      }
      if (
        typeof spec.lifecycle === 'string' &&
        !ALLOWED_LIFECYCLES.includes(spec.lifecycle)
      ) {
        emit(
          processingResult.generalError(
            location,
            `Component '${entity.metadata.name}': spec.lifecycle='${
              spec.lifecycle
            }' no está en la lista permitida [${ALLOWED_LIFECYCLES.join(
              ', ',
            )}] (RC-COMP-03)`,
          ),
        );
        await this.emitViolation(entity, 'RC-COMP-03', spec.lifecycle);
      }
    }

    if (entity.kind === 'API') {
      if (
        typeof spec.type === 'string' &&
        !ALLOWED_API_TYPES.includes(spec.type)
      ) {
        emit(
          processingResult.generalError(
            location,
            `API '${entity.metadata.name}': spec.type='${
              spec.type
            }' no está en la lista permitida [${ALLOWED_API_TYPES.join(
              ', ',
            )}] (RC-API-02)`,
          ),
        );
        await this.emitViolation(entity, 'RC-API-02', spec.type);
      }
    }

    return entity;
  }
}

export const tfgCatalogValidatorModule = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'tfg-validator',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        auditor: coreServices.auditor,
      },
      async init({ catalog, auditor }) {
        catalog.addProcessor(new TfgCatalogValidator(auditor));
      },
    });
  },
});
