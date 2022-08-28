import {authenticateProvider, ElsaProvider, Identity} from './backend';

describe('backend', () => {
  // test('authenticateProvider()', async () => {
  //   // ...
  //   authenticateProvider();
  // });

  // test('authenticateCredential()', () => {
  //   // ...
  // });

  test('ElsaProvider', () => {
    const elsa_provider = new ElsaProvider({
      user: {uid: '112', phoneNumber: '01121312'},
      actions: ['read', 'write'],
      facility: {name: '1321', phoneNumber: '21312'},
      identity: {credentialId: '123213', profileId: '131321'},
      platform: 'ctc',
      session: {expiresAt: new Date(), expiresIn: 86400},
    });
    // ...
    expect(elsa_provider).toBeDefined();

    const json = elsa_provider.toJSON();
    expect(json).toBeDefined();
    expect(ElsaProvider.fromJSON(json)).toBeDefined();
  });

  test('Identity', () => {
    const identity: Identity = {
      credentialId: 'credential',
      profileId: 'profile',
    };

    // ...
    expect(Identity.isParsable(Identity.stringify(identity))).toBe(true);
    expect(Identity.stringify(identity)).toBeTruthy();
  });
});
