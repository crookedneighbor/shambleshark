import nicknames from "Lib/card-nicknames";

describe("nickNames", () => {
  it("does not duplicate any nicknames", () => {
    const count: Record<string, number> = {};

    nicknames.forEach((data) => {
      const key = `${data.setCode}|${data.collectorNumber}`;
      count[key] = count[key] || 0;
      count[key]++;
    });

    Object.keys(count).forEach((value) => {
      try {
        expect(count[value]).toBe(1);
      } catch (e) {
        throw new Error(`${value} had a count of ${count[value]}`);
      }
    });
  });
});
