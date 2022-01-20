/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  const invert = () => {
    const entries = Object.entries(obj);
    const invertedEntries = entries.map((props) => props.reverse());

    return Object.fromEntries(invertedEntries);
  };

  return obj && invert();
}
