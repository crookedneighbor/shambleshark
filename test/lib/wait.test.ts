import wait from "Lib/wait";

describe("wait", () => {
  it("wraps setTimeout in a promise", () => {
    jest.spyOn(global, "setTimeout");

    return wait(10).then(() => {
      expect(global.setTimeout).toBeCalledWith(expect.any(Function), 10);
    });
  });

  it("defautls wait time to 1", () => {
    jest.spyOn(global, "setTimeout");

    return wait().then(() => {
      expect(global.setTimeout).toBeCalledWith(expect.any(Function), 1);
    });
  });
});
