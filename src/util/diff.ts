import Decimal from 'decimal.js-light';
import { Money } from '@jadetree/currency';
import { isDate, isEqual as isDateEqual } from 'date-fns';

/** Mapped Comparator */
export type comparator = {
  apply: (value: unknown) => boolean;
  equal: (a: unknown, b: unknown) => boolean;
};

/** Base Comparators */
export const baseComparators: comparator[] = [
  {
    // Decimal
    apply: (value: unknown) => (value instanceof Decimal),
    equal: (a: unknown, b: unknown) => ((a as Decimal).eq(b as Decimal)),
  },
  {
    // Money
    apply: (value: unknown) => (value instanceof Money),
    equal: (a: unknown, b: unknown) => ((a as Money).eq((b as Money))),
  },
  {
    // Date
    apply: (value: unknown) => (isDate(value)),
    equal: (a: unknown, b: unknown) => isDateEqual(a as Date, b as Date),
  },
];

/** String Indexable Type */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
interface Indexable { [key: string]: any }

/**
 * Diff two objects and return differences. Keys that are missing in the new
 * object which exist in the reference object are set to `null`.
 */
export function diff(
  value: Indexable,
  ref: Indexable,
  comparators: comparator[] = baseComparators,
): Indexable {
  const diffs: Indexable = {};

  // Ensure reference object is in fact an object
  if (!ref || Object.prototype.toString.call(ref) !== '[object Object]') {
    return value;
  }

  /*
   * Determine if two values are equal. For objects and arrays, recurse into the
   * fields and keys.
   */
  const compare = (a: unknown, b: unknown, key: string) => {
    const typeA = Object.prototype.toString.call(a);
    const typeB = Object.prototype.toString.call(b);

    // Set removed key to null
    if (typeB === '[object Undefined]') {
      diffs[key] = null;
      return;
    }

    // If items have different types
    if (typeA !== typeB) {
      diffs[key] = b;
      return;
    }

    // Compare Objects with comparators or by recursion
    if (typeA === '[object Object]') {
      let matched = false;
      comparators.forEach((cmp) => {
        if (cmp.apply(b)) {
          if (!cmp.equal(a, b)) diffs[key] = b;
          matched = true;
        }
      });

      if (matched) return;

      // Recurse into unknown object
      const objDiff = diff((a as Indexable)[key], (b as Indexable)[key]);
      if (Object.keys(objDiff).length) {
        diffs[key] = objDiff;
        return;
      }
    }

    // Compare Arrays
    if (typeA === '[object Array]') {
      if ((a as Indexable[]).length !== (b as Indexable[]).length) {
        diffs[key] = b;
        return;
      }

      // Compare Array Items
      for (let idx = 0; idx < (a as Indexable[]).length; idx += 1) {
        const itemDiff = diff((a as Indexable[])[idx], (b as Indexable[])[idx]);
        if (Object.keys(itemDiff).length) {
          diffs[key] = b;
          return;
        }
      }

      // Arrays Matched
      return;
    }

    // Compare Primitives
    if (a !== b) {
      diffs[key] = b;
    }
  };

  // Compare Objects
  Object.keys(ref).forEach((key) => {
    compare(ref[key], value[key], key);
  });

  // Find Added Fields
  Object.keys(value).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      if (!ref[key] && ref[key] !== value[key]) {
        diffs[key] = value[key];
      }
    }
  });

  // Return Diff'ed Object
  return diffs;
}
