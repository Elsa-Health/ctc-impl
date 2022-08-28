import {convertDMYToDate, lower, removeWhiteSpace} from './utils';

describe('emr-helpers/utils', () => {
  test('removeWhiteSpace', () => {
    expect(removeWhiteSpace('something here')).toBe('somethinghere');
    expect(removeWhiteSpace(' this is - good')).toBe('thisis-good');
    expect(removeWhiteSpace('0 765 123 345')).toBe('0765123345');
  });
  test('lower', () => {
    expect(lower('sOMETHInG')).toBe('something');
    expect(lower('hello')).toBe('hello');
  });

  test('convertDMYToDate', () => {
    // const s = new Error(
    //   'Invalid data format. The date needs to be in the formate DD / MM / YYYY',
    // );

    expect(() => convertDMYToDate('21/04/2012')).not.toThrowError();
    expect(() => convertDMYToDate('21 / 04 / 2012')).not.toThrowError();
    expect(() => convertDMYToDate('21 / 04     / 2013')).not.toThrowError();
    expect(() => convertDMYToDate('12 / 05 / 1992')).not.toThrowError();
    expect(() => convertDMYToDate('21 / 02 / 1994')).not.toThrowError();
    expect(() => convertDMYToDate('14 / 02 / 1992')).not.toThrowError();
    expect(() => convertDMYToDate('20 / 07 / 1953')).not.toThrowError();

    expect(() => convertDMYToDate('21 / 04')).toThrowError();
    expect(() => convertDMYToDate('21 / 13 / 2012')).toThrowError();
    expect(() => convertDMYToDate('21 / 05 / 20XX')).toThrowError();
  });
});
