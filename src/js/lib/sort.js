// adapted from the mdn page on array.sort
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
export function sortByAttribute({ attributes }) {
  return (a, b) => {
    let finalResult;

    attributes.find((attr) => {
      let someValueIsUndefined;

      if (attr in a && !(attr in b)) {
        someValueIsUndefined = true;
        finalResult = -1;
      } else if (attr in b && !(attr in a)) {
        someValueIsUndefined = true;
        finalResult = 1;
      } else if (!(attr in a) && !(attr in b)) {
        someValueIsUndefined = true;
        finalResult = 0;
      }

      if (someValueIsUndefined) {
        return finalResult;
      }

      let aValue = a[attr];
      let bValue = b[attr];

      if (typeof aValue !== typeof bValue) {
        throw new Error(
          `${attr} \`${aValue}\` and ${attr} \`${bValue}\` are not of the same type`
        );
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toUpperCase();
        bValue = bValue.toUpperCase();
      }

      if (aValue < bValue) {
        finalResult = -1;
      } else if (aValue > bValue) {
        finalResult = 1;
      } else {
        finalResult = 0;
      }

      return finalResult;
    });

    return finalResult;
  };
}
