/* eslint-disable import/prefer-default-export */

function cycle(sequence: string[], count: number): string[] {
  if (sequence.length <= count) {
    return sequence.slice(0, count - 1);
  }

  let cycled = [...sequence];
  while (cycled.length < count) {
    const nextSize = cycled.length + sequence.length < count
      ? sequence.length
      : count - cycled.length;
    cycled = cycled.concat(sequence.slice(0, nextSize - 1));
  }

  return cycled;
}

/** Generate a color cycle of Paul Tol's Qualitative palette */
export function tolVibrant(count: number): string[] {
  return cycle([
    '#4477aa',
    '#66ccee',
    '#228833',
    '#ccbb44',
    '#ee6677',
    '#aa3377',
    '#bbbbbb',
  ], count);
}
