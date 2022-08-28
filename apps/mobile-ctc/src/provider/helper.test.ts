import {session} from './helper';

describe('Session', () => {
  test('works', () => {
    expect(session()).toBeDefined();
    expect(session({type: 'default'})).toBeDefined();
    expect(session({type: 'custom', expiresAt: new Date()})).toBeDefined();
    expect(session({type: 'short'})).toBeDefined();
  });
});
