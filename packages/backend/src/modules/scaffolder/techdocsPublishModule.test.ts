import { techdocsPublishHandler, runCommand, entityRefToTriplet } from './techdocsPublishModule';
import { Config } from '@backstage/config';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';

jest.mock('child_process');

const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

function mockSpawnSuccess() {
  const emitter = new EventEmitter();
  const stdoutEmitter = new EventEmitter();
  const stderrEmitter = new EventEmitter();

  mockSpawn.mockImplementation(() => {
    setTimeout(() => {
      emitter.emit('close', 0);
    }, 0);
    return Object.assign(emitter, { stdout: stdoutEmitter, stderr: stderrEmitter }) as any;
  });

  return { emitter, stdoutEmitter, stderrEmitter };
}

function mockSpawnFailure(stderrText: string) {
  const emitter = new EventEmitter();
  const stdoutEmitter = new EventEmitter();
  const stderrEmitter = new EventEmitter();

  mockSpawn.mockImplementation(() => {
    setTimeout(() => {
      stderrEmitter.emit('data', Buffer.from(stderrText));
      emitter.emit('close', 1);
    }, 0);
    return Object.assign(emitter, { stdout: stdoutEmitter, stderr: stderrEmitter }) as any;
  });

  return { emitter, stdoutEmitter, stderrEmitter };
}

function makeMockConfig(overrides?: Partial<Record<string, string>>): Config {
  const values: Record<string, string> = {
    'techdocs.publisher.awsS3.bucketName': 'techdocs',
    'techdocs.publisher.awsS3.endpoint': 'http://localhost:9000',
    'techdocs.publisher.awsS3.region': 'us-east-1',
    'techdocs.publisher.awsS3.credentials.accessKeyId': 'minioadmin',
    'techdocs.publisher.awsS3.credentials.secretAccessKey': 'minioadmin',
    ...overrides,
  };

  return {
    getString: (key: string) => {
      if (key in values) return values[key];
      throw new Error(`Missing config key ${key}`);
    },
    getOptionalString: (key: string) => values[key] ?? undefined,
  } as unknown as Config;
}

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(),
};

describe('techdocsPublishHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads endpoint, bucket and credentials from Config', async () => {
    mockSpawnSuccess();

    const config = makeMockConfig();
    await techdocsPublishHandler(
      { config, logger: mockLogger as any },
      { workspacePath: '/tmp/workspace', input: { entityRef: 'component:default/my-service' } },
    );

    // Assert that the generate command was invoked
    expect(mockSpawn).toHaveBeenCalled();
    const generateCall = mockSpawn.mock.calls[0];
    expect(generateCall[0]).toBe('npx');
    expect(generateCall[1]).toContain('@techdocs/cli@latest');
    expect(generateCall[1]).toContain('generate');

    // Assert that the publish command was invoked with config-derived values
    const publishCall = mockSpawn.mock.calls[1];
    expect(publishCall[0]).toBe('npx');
    expect(publishCall[1]).toContain('--awsEndpoint');
    expect(publishCall[1]).toContain('http://localhost:9000');
    expect(publishCall[1]).toContain('--storage-name');
    expect(publishCall[1]).toContain('techdocs');
    expect(publishCall[1]).toContain('--awsRegion');
    expect(publishCall[1]).toContain('us-east-1');

    // Assert entityRef is converted from kind:namespace/name to namespace/kind/name
    const entityIndex = publishCall[1].indexOf('--entity');
    expect(entityIndex).toBeGreaterThan(-1);
    expect(publishCall[1][entityIndex + 1]).toBe('default/component/my-service');
  });

  it('completes without error for a valid workspace', async () => {
    mockSpawnSuccess();

    const config = makeMockConfig();
    await expect(
      techdocsPublishHandler(
        { config, logger: mockLogger as any },
        { workspacePath: '/tmp/workspace', input: { entityRef: 'component:default/my-service' } },
      ),
    ).resolves.toBeUndefined();

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Successfully published TechDocs for component:default/my-service'),
    );
  });

  it('propagates stderr when subprocess fails', async () => {
    mockSpawnFailure('AWS credentials invalid');

    const config = makeMockConfig();
    await expect(
      techdocsPublishHandler(
        { config, logger: mockLogger as any },
        { workspacePath: '/tmp/workspace', input: { entityRef: 'component:default/my-service' } },
      ),
    ).rejects.toThrow('AWS credentials invalid');
  });
});

describe('entityRefToTriplet', () => {
  it('converts kind:namespace/name to namespace/kind/name', () => {
    expect(entityRefToTriplet('component:default/my-service')).toBe(
      'default/component/my-service',
    );
  });

  it('preserves casing from the input', () => {
    expect(entityRefToTriplet('Component:default/MyService')).toBe(
      'default/Component/MyService',
    );
  });

  it('throws for invalid entityRef format', () => {
    expect(() => entityRefToTriplet('invalid')).toThrow(
      'Invalid entityRef format',
    );
  });
});

describe('runCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves when command exits with code 0', async () => {
    const emitter = new EventEmitter();
    mockSpawn.mockReturnValue(emitter as any);

    const promise = runCommand('echo', ['hello'], { cwd: '/', env: {} });
    setTimeout(() => emitter.emit('close', 0), 0);

    await expect(promise).resolves.toBeUndefined();
  });

  it('rejects with stderr when command exits with non-zero code', async () => {
    const emitter = new EventEmitter();
    const stderrEmitter = new EventEmitter();
    mockSpawn.mockReturnValue(emitter as any);

    const promise = runCommand('false', [], { cwd: '/', env: {} });
    setTimeout(() => {
      stderrEmitter.emit('data', Buffer.from('something went wrong'));
      emitter.emit('close', 1);
    }, 0);

    await expect(promise).rejects.toThrow();
  });
});
