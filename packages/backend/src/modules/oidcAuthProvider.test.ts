import { createSignInResolver } from './oidcAuthProvider';

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

function makeInfo(preferredUsername: string | undefined): any {
  return {
    result: {
      fullProfile: {
        userinfo: { preferred_username: preferredUsername },
      },
    },
  };
}

describe('createSignInResolver', () => {
  let auditor: ReturnType<typeof makeMockAuditor>;
  let ctx: { signInWithCatalogUser: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    auditor = makeMockAuditor();
    ctx = {
      signInWithCatalogUser: jest.fn().mockResolvedValue({ token: 'tok' }),
    };
  });

  it('emits user-sign-in (medium / success) and returns the catalog sign-in result', async () => {
    const resolver = createSignInResolver(auditor.asService);

    const result = await resolver(makeInfo('alice'), ctx as any);

    expect(result).toEqual({ token: 'tok' });
    expect(ctx.signInWithCatalogUser).toHaveBeenCalledWith({
      entityRef: { name: 'alice' },
    });
    expect(auditor.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'user-sign-in',
        severityLevel: 'medium',
        meta: expect.objectContaining({ entityRef: 'user:default/alice' }),
      }),
    );
    expect(auditor.success).toHaveBeenCalledTimes(1);
    expect(auditor.fail).not.toHaveBeenCalled();
  });

  it('emits user-sign-in (high / failed) when preferred_username is missing', async () => {
    const resolver = createSignInResolver(auditor.asService);

    await expect(
      resolver(makeInfo(undefined), ctx as any),
    ).rejects.toThrow(/preferred_username/);

    expect(ctx.signInWithCatalogUser).not.toHaveBeenCalled();
    expect(auditor.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'user-sign-in',
        severityLevel: 'high',
        meta: expect.objectContaining({ reason: 'no-preferred-username' }),
      }),
    );
    expect(auditor.fail).toHaveBeenCalledTimes(1);
    expect(auditor.success).not.toHaveBeenCalled();
  });

  it('emits user-sign-in (high / failed, reason "user-not-in-catalog") when catalog resolution throws', async () => {
    ctx.signInWithCatalogUser.mockRejectedValue(new Error('not found'));
    const resolver = createSignInResolver(auditor.asService);

    await expect(resolver(makeInfo('ghost'), ctx as any)).rejects.toThrow(
      /not found/,
    );

    expect(auditor.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'user-sign-in',
        severityLevel: 'high',
        meta: expect.objectContaining({
          reason: 'user-not-in-catalog',
          entityRef: 'user:default/ghost',
        }),
      }),
    );
    expect(auditor.fail).toHaveBeenCalledTimes(1);
    expect(auditor.success).not.toHaveBeenCalled();
  });
});
