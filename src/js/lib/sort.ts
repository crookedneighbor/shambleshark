// adapted from the mdn page on array.sort
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
export function sortByAttribute<T>(attributes: (keyof T)[]) {
  return (a: T, b: T): number => {
    let comparison = 0;

    attributes.find((attr) => {
      if (attr in a && !(attr in b)) {
        return (comparison = -1);
      } else if (attr in b && !(attr in a)) {
        return (comparison = 1);
      } else if (!(attr in a) && !(attr in b)) {
        return (comparison = 0);
      }

      let aValue: T[keyof T] | string = a[attr];
      let bValue: T[keyof T] | string = b[attr];

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
        return (comparison = -1);
      } else if (aValue > bValue) {
        return (comparison = 1);
      } else {
        return (comparison = 0);
      }
    });

    return comparison;
  };
}
