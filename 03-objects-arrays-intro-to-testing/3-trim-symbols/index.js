/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let iterableLetter = null;
  let counter = 0;

  let result = '';

  for (const letter of string) {
    if (iterableLetter !== letter) {
      iterableLetter = letter;
      counter = 0;
    }

    if (counter >= size) {
      continue;
    }

    result += iterableLetter || '';
    counter++;
  }

  return result;
}
