import createElement from "Lib/create-element";

describe("createElement", () => {
  it("creates an element", () => {
    const div = createElement('<div id="foo"></div>');

    document.body.appendChild(div);

    expect(document.getElementById("foo")).toBeTruthy();
  });

  it("pulls tags from body by default", () => {
    const div = createElement('<style id="style"></style><div id="foo"></div>');

    document.body.appendChild(div);

    expect(document.body.querySelector("#foo")).toBeTruthy();
    expect(document.body.querySelector("#style")).toBeFalsy();
  });

  it("can pull tags from head", () => {
    const div = createElement(
      '<style id="style"></style><div id="foo"></div>',
      {
        container: "head",
      }
    );

    document.body.appendChild(div);

    expect(document.body.querySelector("#style")).toBeTruthy();
    expect(document.body.querySelector("#foo")).toBeFalsy();
  });
});
