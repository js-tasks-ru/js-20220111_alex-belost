/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const sortableArray = Array.from(arr);

  const compareOptions = { caseFirst: 'upper' };
  const locales = ['ru', 'en'];

  const sortingFnMap = {
    'asc': (a, b) => a.localeCompare(b, locales, compareOptions),
    'desc': (a, b) => b.localeCompare(a, locales, compareOptions),
  };

  return sortableArray.sort(sortingFnMap[param]);
}
