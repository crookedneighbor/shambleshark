import { sortByAttribute } from "Lib/sort";

describe("sort.sortByAttribute", () => {
  let array: {
    id: number;
    name: string | number;
    bool: boolean;
  }[];

  beforeEach(() => {
    array = [
      {
        id: 3,
        name: "B-Middle Entry",
        bool: false,
      },
      {
        id: 2,
        name: "C-Last Entry",
        bool: true,
      },
      {
        id: 1,
        name: "A-First Entry",
        bool: true,
      },
    ];
  });

  it("creates a sort handler to sort arrays of objects by specific attributes", () => {
    const nameHandler = sortByAttribute(["name"]);

    array.sort(nameHandler);

    expect(array[0].name).toBe("A-First Entry");
    expect(array[1].name).toBe("B-Middle Entry");
    expect(array[2].name).toBe("C-Last Entry");

    const idHandler = sortByAttribute(["id"]);

    array.sort(idHandler);

    expect(array[0].name).toBe("A-First Entry");
    expect(array[1].name).toBe("C-Last Entry");
    expect(array[2].name).toBe("B-Middle Entry");

    const boolHandler = sortByAttribute(["bool"]);

    array.sort(boolHandler);

    expect(array[0].name).toBe("B-Middle Entry");
    expect(array[1].name).toBe("A-First Entry");
    expect(array[2].name).toBe("C-Last Entry");
  });

  it("disregards case of string values", () => {
    const handler = sortByAttribute(["name"]);
    array[0].name = "b-middle entry";

    array.sort(handler);

    expect(array[0].name).toBe("A-First Entry");
    expect(array[1].name).toBe("b-middle entry");
    expect(array[2].name).toBe("C-Last Entry");
  });

  it("can sort by multiple attributes if the current attribute is identical", () => {
    const handler = sortByAttribute(["bool", "id", "name"]);

    array.push({
      id: 1,
      name: "D-Extra Entry",
      bool: true,
    });

    array.sort(handler);

    expect(array[0].name).toBe("B-Middle Entry");
    expect(array[1].name).toBe("A-First Entry");
    expect(array[2].name).toBe("D-Extra Entry");
    expect(array[3].name).toBe("C-Last Entry");
  });

  it("throws an error if typeof values do not match", () => {
    const handler = sortByAttribute(["name"]);
    array[0].name = 123;

    expect(() => {
      array.sort(handler);
    }).toThrow("name `C-Last Entry` and name `123` are not of the same type");
  });

  it("if one value is defined and the other is undefined, it does not throw and prefers the truthy value", () => {
    const handler = sortByAttribute(["id"]);
    // @ts-ignore
    delete array[0].id;

    array.sort(handler);

    expect(array[0].name).toBe("A-First Entry");
    expect(array[1].name).toBe("C-Last Entry");
    expect(array[2].name).toBe("B-Middle Entry");
  });
});
