/** Generic Comparator Function to use with Array.sort */
export type comparatorFn<T> = (a: T, b: T) => number;

/** Generic Mapped Type */
export type mappedType<T> = { [key: string]: T };

/** Generic Comparator Helper */
export function compare<T>(a: T, b: T): number {
  /* eslint-disable-next-line no-nested-ternary */
  return (a < b) ? -1 : ((a > b) ? 1 : 0);
}

/** Keyed Object Comparator Helper */
export function compareKeys<T>(key: string): comparatorFn<mappedType<T>> {
  return (a: { [key: string]: T }, b: { [key: string]: T }) => compare(a[key], b[key]);
}
