/** String related utils */
import type * as P from '@elsa-health/emr/health.types/v1/_primitives';
import {convertDMYToDate} from '@elsa-health/emr/lib/utils';

export function removeWhiteSpace(text: string) {
  return text.replace(/\s+/g, '').trim();
}

export function lower(text: string) {
  return text.toLowerCase();
}

export {convertDMYToDate};

/**
 * Others
 * ------------
 * NOTE: Stopped using these in-favor of `ramda` functions
 */

// export const pluck = <T extends {[x: string]: any}, F extends keyof T>(
//   data: T,
//   field: F,
// ) => data[field];

// export const pick = <
//   T extends {[x: string]: any},
//   F extends keyof T,
//   K extends F | F[],
// >(
//   data: T,
//   fields: F | F[],
// ): K extends F ? T[F] | null : Pick<T, F> => {
//   if (Array.isArray(fields)) {
//     const d = fields.map(field => {
//       return [field, data[field] ?? null];
//     });
//     return Object.fromEntries(d);
//   }

//   return data[fields];
// };

// export const single =
//   <T extends {[x: string]: any}, F extends keyof T>(field: F) =>
//   (data: T) =>
//     data[field];

// export const select =
//   <T extends {[x in string]: any}>(fields: keyof T | Array<keyof T>) =>
//   (data: T) =>
//     pick(data, fields);
