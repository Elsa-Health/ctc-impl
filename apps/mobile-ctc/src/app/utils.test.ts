import {getAge, properAgeString} from './utils';

describe('utils.ts operations', () => {
  test('getAge()', () => {
    expect(getAge(34)).toBe(34);
    expect(getAge(34, 4)).toBe(34 + 1 / 3);
  });

  test('properAgeString', () => {
    expect(properAgeString({})).toBeDefined();
    expect(properAgeString({years: 34})).toBe('34 years');
    expect(properAgeString({years: 34, months: 2})).toBe(
      '34 years and 2 months',
    );
    expect(properAgeString({years: 34, months: 11, days: 5})).toBe(
      '34 years, 11 months and 5 days',
    );
  });
});
