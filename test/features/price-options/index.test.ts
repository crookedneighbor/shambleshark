import PriceOptions from "Features/deck-view-features/price-options";

describe("Price Options", () => {
  let po: PriceOptions;

  beforeEach(() => {
    po = new PriceOptions();
  });

  afterEach(() => {
    // reset the window state
    window.history.pushState({}, "Title", "/");
  });

  describe("run", () => {
    beforeEach(() => {
      jest.spyOn(po, "hidePriceUI");
    });

    it("adds no prices option to select element", async () => {
      const select = document.createElement("select");
      select.id = "with";
      select.innerHTML = `
        <option value="foo">Foo</option>
        <option value="bar">Bar</option>
      `;

      document.body.appendChild(select);

      await po.run();

      expect(select.querySelectorAll("option").length).toBe(3);

      const lastOption = select.querySelectorAll("option")[2];

      expect(lastOption.value).toBe("no-prices");
      expect(lastOption.innerHTML).toBe("No Prices");
    });

    it("does not error if select element is not available", async () => {
      expect(document.querySelector("select#with")).toBeFalsy();

      await po.run();

      expect(document.querySelector("select#with")).toBeFalsy();
    });

    it("does not run any modification when query param is not present", async () => {
      window.history.pushState({}, "Title", "/");

      await po.run();

      expect(po.hidePriceUI).toBeCalledTimes(0);
    });

    it("does not run any modification when with query param is not present", async () => {
      window.history.pushState({}, "Title", "?other-param=foo");

      await po.run();

      expect(po.hidePriceUI).toBeCalledTimes(0);
    });

    it("does not run any modification when with is a normal value", async () => {
      window.history.pushState({}, "Title", "?with=usd");

      await po.run();

      expect(po.hidePriceUI).toBeCalledTimes(0);
    });

    it("hides price ui elements when query param with=no-prices", async () => {
      window.history.pushState({}, "Title", "?with=no-prices");

      await po.run();

      expect(po.hidePriceUI).toBeCalledTimes(1);
    });

    it("sets select value to no-prices when query param with=no-prices", async () => {
      window.history.pushState({}, "Title", "?with=no-prices");

      const select = document.createElement("select");
      select.id = "with";
      select.innerHTML = `
        <option value="foo">Foo</option>
        <option value="bar">Bar</option>
      `;

      document.body.appendChild(select);

      await po.run();

      expect(select.querySelectorAll("option")[2].selected).toBeTruthy();
    });
  });

  describe("getWithParam", () => {
    it("returns the value of the with param", () => {
      window.history.pushState({}, "Title", "/");

      expect(po.getWithParam()).toBe(null);

      window.history.pushState({}, "Title", "?foo=value");

      expect(po.getWithParam()).toBe(null);

      window.history.pushState({}, "Title", "?with=no-prices");

      expect(po.getWithParam()).toBe("no-prices");
    });
  });

  describe("hidePriceUI", () => {
    it("hides the sidebar prices", () => {
      const el = document.createElement("div");

      el.classList.add("sidebar-prices");
      document.body.appendChild(el);

      po.hidePriceUI();

      expect(el.classList.contains("hidden")).toBe(true);
    });

    it("hides the auxilary deck data (containing the price info)", () => {
      const els = [
        document.createElement("div"),
        document.createElement("div"),
        document.createElement("div"),
        document.createElement("div"),
      ];

      els.forEach((el) => {
        el.classList.add("deck-list-entry-axial-data");

        document.body.appendChild(el);
      });

      po.hidePriceUI();

      els.forEach((el) => {
        expect(el.classList.contains("hidden")).toBe(true);
      });
    });
  });
});
