import {getFacilityFromCode} from './facilities';

describe('Facilities helper functions', () => {
  test('getFacilityFromCode(...)', () => {
    expect(getFacilityFromCode('<NONE-EXISTING-CODE>')).toBe(null);
    expect(getFacilityFromCode('02020120')).toEqual(
      expect.objectContaining({
        uid: expect.any(String),
        name: expect.any(String),
        facilityCode: '02020120',
        lat: expect.any(Number),
        lng: expect.any(Number),
      }),
    );
  });
});
