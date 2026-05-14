import { shouldPersist } from './AuditEventFilter';

describe('shouldPersist', () => {
  it('returns false for low severity', () => {
    expect(shouldPersist({ severityLevel: 'low' })).toBe(false);
  });

  it('returns true for medium severity', () => {
    expect(shouldPersist({ severityLevel: 'medium' })).toBe(true);
  });

  it('returns true for high severity', () => {
    expect(shouldPersist({ severityLevel: 'high' })).toBe(true);
  });

  it('returns true for critical severity', () => {
    expect(shouldPersist({ severityLevel: 'critical' })).toBe(true);
  });
});
