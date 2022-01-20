/**
 * Sum - returns sum of arguments if they can be converted to a number
 * @param {number} n value
 * @returns {number | function}
 */
export function sum(n = 0) {
  let result = n;

  function curry(b = 0) {
    result += b;

    return curry;
  }

  curry[Symbol.toPrimitive] = () => result;

  return curry;
}
