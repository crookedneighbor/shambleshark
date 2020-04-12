import { reset, change, ready } from "Lib/mutation";

describe("mutation", function () {
  describe("ready", function () {
    afterEach(function () {
      reset();
    });

    it("applies transformation to specified DOM nodes right away", function () {
      const spy = jest.fn();

      const div = document.createElement("div");
      const div2 = document.createElement("div");

      div.classList.add("class-name");
      div2.classList.add("class-name");

      document.body.appendChild(div);
      document.body.appendChild(div2);

      ready(".class-name", spy);

      expect(spy).toBeCalledTimes(2);
      expect(spy).toBeCalledWith(div);
      expect(spy).toBeCalledWith(div2);
    });

    it("only creates observer once", function () {
      const spy = jest.fn();

      jest.spyOn(window.MutationObserver.prototype, "observe");
      ready(".class-name", spy);

      expect(window.MutationObserver.prototype.observe).toBeCalledTimes(1);
      expect(window.MutationObserver.prototype.observe).toBeCalledWith(
        document.documentElement,
        {
          childList: true,
          subtree: true,
        }
      );

      ready(".another-class-name", spy);

      expect(window.MutationObserver.prototype.observe).toBeCalledTimes(1);
    });

    it("applies transformation to specified DOM nodes only once", function () {
      const spy = jest.fn();

      const div = document.createElement("div");
      const div2 = document.createElement("div");

      div.classList.add("class-name");
      div2.classList.add("class-name");

      document.body.appendChild(div);
      document.body.appendChild(div2);

      ready(".class-name", spy);

      expect(spy).toBeCalledTimes(2);
      expect(spy).toBeCalledWith(div);
      expect(spy).toBeCalledWith(div2);

      ready(".class-name", spy);

      expect(spy).toBeCalledTimes(2);
    });

    it("applies transformation only to new DOM nodes", function () {
      const spy = jest.fn();

      const div = document.createElement("div");
      const div2 = document.createElement("div");

      div.classList.add("class-name");
      div2.classList.add("class-name");

      document.body.appendChild(div);
      document.body.appendChild(div2);

      ready(".class-name", spy);

      expect(spy).toBeCalledTimes(2);
      expect(spy).toBeCalledWith(div);
      expect(spy).toBeCalledWith(div2);

      const div3 = document.createElement("div");
      div3.classList.add("class-name");
      document.body.appendChild(div3);

      spy.mockReset();

      ready(".class-name", spy);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(div3);
    });
  });

  describe("change", function () {
    it("observes DOM node for selector when ready", function () {
      const node = document.createElement("div");

      node.id = "parent";
      document.body.appendChild(node);

      jest.spyOn(window.MutationObserver.prototype, "observe");

      change("#parent", jest.fn());

      expect(window.MutationObserver.prototype.observe).toBeCalledTimes(2);
      expect(window.MutationObserver.prototype.observe).toBeCalledWith(node, {
        childList: true,
        subtree: true,
      });
    });
  });
});
