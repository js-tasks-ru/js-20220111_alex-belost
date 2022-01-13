/**
 * sum
 * @param {number} m base
 * @param {number} n index
 * @returns {number}
 */
export default function sum(m, n) {
  return Array.from(arguments).reduce((result, arg) => (result + arg), 0);
}
