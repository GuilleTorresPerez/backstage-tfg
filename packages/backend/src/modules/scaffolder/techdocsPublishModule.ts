import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint, createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { spawn } from 'child_process';
import { join } from 'path';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

export function runCommand(
  command: string,
  args: string[],
  options: { cwd: string; env: Record<string, string> },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      shell: false,
    });

    let stderr = '';
    let stdout = '';

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('error', (err: Error) => {
      reject(err);
    });

    proc.on('close', (code: number | null) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || stdout || `Command exited with code ${code}`));
      }
    });
  });
}

export interface TechdocsPublishActionOptions {
  config: Config;
  logger: LoggerService;
}

export function entityRefToTriplet(entityRef: string): string {
  const match = entityRef.match(/^([^:]+):([^/]+)\/(.+)$/);
  if (!match) {
    throw new Error(
      `Invalid entityRef format: ${entityRef}. Expected kind:namespace/name`,
    );
  }
  const [, kind, namespace, name] = match;
  return `${namespace}/${kind}/${name}`;
}

export async function techdocsPublishHandler(
  options: TechdocsPublishActionOptions,
  ctx: {
    workspacePath: string;
    input: { entityRef: string };
  },
): Promise<void> {
  const { config, logger } = options;

  const bucketName = config.getString('techdocs.publisher.awsS3.bucketName');
  const endpoint = config.getString('techdocs.publisher.awsS3.endpoint');
  const region =
    config.getOptionalString('techdocs.publisher.awsS3.region') ?? 'us-east-1';
  const accessKeyId = config.getString(
    'techdocs.publisher.awsS3.credentials.accessKeyId',
  );
  const secretAccessKey = config.getString(
    'techdocs.publisher.awsS3.credentials.secretAccessKey',
  );

  const { entityRef } = ctx.input;
  const entityTriplet = entityRefToTriplet(entityRef);
  const outputDir = join(ctx.workspacePath, '.techdocs-output');

  logger.info(`[aragon:techdocs:publish] Generating TechDocs for ${entityRef}`);

  await runCommand(
    'npx',
    ['@techdocs/cli@latest', 'generate', '--no-docker', '--source-dir', ctx.workspacePath, '--output-dir', outputDir],
    { cwd: ctx.workspacePath, env: {} },
  );

  logger.info(`[aragon:techdocs:publish] Publishing TechDocs for ${entityRef} to bucket ${bucketName}`);

  await runCommand(
    'npx',
    [
      '@techdocs/cli@latest',
      'publish',
      '--publisher-type', 'awsS3',
      '--storage-name', bucketName,
      '--awsBucketAddressing', 'path',
      '--awsEndpoint', endpoint,
      '--awsRegion', region,
      '--entity', entityTriplet,
      '--directory', outputDir,
    ],
    {
      cwd: ctx.workspacePath,
      env: {
        AWS_ACCESS_KEY_ID: accessKeyId,
        AWS_SECRET_ACCESS_KEY: secretAccessKey,
      },
    },
  );

  logger.info(`[aragon:techdocs:publish] Successfully published TechDocs for ${entityRef}`);
}

export function createTechdocsPublishAction(options: TechdocsPublishActionOptions) {
  return createTemplateAction({
    id: 'aragon:techdocs:publish',
    description: 'Genera y publica TechDocs para un componente en el publisher S3 configurado',
    schema: {
      input: {
        entityRef: z =>
          z.string({
            description: 'Entity reference en formato kind:namespace/name',
          }),
      },
    },
    async handler(ctx) {
      await techdocsPublishHandler(options, {
        workspacePath: ctx.workspacePath,
        input: ctx.input as { entityRef: string },
      });
    },
  });
}

export const techdocsPublishModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'aragon-techdocs-publish',
  register(reg) {
    reg.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ scaffolder, config, logger }) {
        scaffolder.addActions(createTechdocsPublishAction({ config, logger }));
      },
    });
  },
});
