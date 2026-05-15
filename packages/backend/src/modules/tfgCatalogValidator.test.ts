import { Entity } from '@backstage/catalog-model';
import {
  CatalogProcessorEmit,
  LocationSpec,
} from '@backstage/plugin-catalog-node';
import { TfgCatalogValidator } from './tfgCatalogValidator';

function makeMockAuditor() {
  const success = jest.fn().mockResolvedValue(undefined);
  const fail = jest.fn().mockResolvedValue(undefined);
  const createEvent = jest.fn().mockResolvedValue({ success, fail });
  return {
    createEvent,
    success,
    fail,
    asService: { createEvent } as any,
  };
}

const location: LocationSpec = {
  type: 'url',
  target: 'https://example.com/catalog-info.yaml',
};

const noopEmit: CatalogProcessorEmit = () => {};

function component(overrides: Partial<Entity> = {}): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'svc', ...(overrides.metadata ?? {}) },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'team-a',
      system: 'my-system',
      ...((overrides.spec ?? {}) as object),
    },
  } as Entity;
}

function api(overrides: Partial<Entity> = {}): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'API',
    metadata: { name: 'my-api', ...(overrides.metadata ?? {}) },
    spec: {
      type: 'openapi',
      lifecycle: 'production',
      owner: 'team-a',
      ...((overrides.spec ?? {}) as object),
    },
  } as Entity;
}

describe('TfgCatalogValidator', () => {
  let auditor: ReturnType<typeof makeMockAuditor>;
  let validator: TfgCatalogValidator;

  beforeEach(() => {
    jest.clearAllMocks();
    auditor = makeMockAuditor();
    validator = new TfgCatalogValidator(auditor.asService);
  });

  describe('RC-COMP-05 — mandatory spec.system on Component', () => {
    it('emits entity-validate-tfg with rule "RC-COMP-05" and throws', async () => {
      const entity = component({ spec: { system: undefined } as any });

      await expect(validator.validateEntityKind(entity)).rejects.toThrow(
        /RC-COMP-05/,
      );

      expect(auditor.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'entity-validate-tfg',
          severityLevel: 'medium',
          meta: expect.objectContaining({
            rule: 'RC-COMP-05',
            kind: 'Component',
            entityRef: 'component:default/svc',
          }),
        }),
      );
      expect(auditor.fail).toHaveBeenCalledTimes(1);
    });
  });

  describe('Closed-list violations on preProcessEntity', () => {
    it('emits rule "RC-COMP-02" when Component spec.type is outside the allowed list', async () => {
      const entity = component({ spec: { type: 'bogus-type' } as any });

      await validator.preProcessEntity(entity, location, noopEmit);

      expect(auditor.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'entity-validate-tfg',
          severityLevel: 'medium',
          meta: expect.objectContaining({
            rule: 'RC-COMP-02',
            kind: 'Component',
            entityRef: 'component:default/svc',
            value: 'bogus-type',
          }),
        }),
      );
    });

    it('emits rule "RC-COMP-03" when Component spec.lifecycle is outside the allowed list', async () => {
      const entity = component({ spec: { lifecycle: 'staging' } as any });

      await validator.preProcessEntity(entity, location, noopEmit);

      expect(auditor.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'entity-validate-tfg',
          severityLevel: 'medium',
          meta: expect.objectContaining({
            rule: 'RC-COMP-03',
            kind: 'Component',
            entityRef: 'component:default/svc',
            value: 'staging',
          }),
        }),
      );
    });

    it('emits rule "RC-API-02" when API spec.type is outside the allowed list', async () => {
      const entity = api({ spec: { type: 'soap' } as any });

      await validator.preProcessEntity(entity, location, noopEmit);

      expect(auditor.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'entity-validate-tfg',
          severityLevel: 'medium',
          meta: expect.objectContaining({
            rule: 'RC-API-02',
            kind: 'API',
            entityRef: 'api:default/my-api',
            value: 'soap',
          }),
        }),
      );
    });

    it('does not emit for a valid Component', async () => {
      await validator.preProcessEntity(component(), location, noopEmit);
      await validator.validateEntityKind(component());
      expect(auditor.createEvent).not.toHaveBeenCalled();
    });

    it('does not emit for non-backstage.io apiVersion', async () => {
      const entity = component({ apiVersion: 'custom/v1' as any });
      await validator.preProcessEntity(entity, location, noopEmit);
      await validator.validateEntityKind(entity);
      expect(auditor.createEvent).not.toHaveBeenCalled();
    });
  });
});
