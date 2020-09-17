import { ready } from "Lib/mutation";
import CardTooltip from "Ui/card-tooltip";
import noop from "Lib/noop";

import { mocked } from "ts-jest/utils";

jest.mock("Lib/mutation");

describe("CardTooltip", () => {
  beforeEach(() => {
    jest.spyOn(CardTooltip.prototype, "findTooltip").mockImplementation();
  });

  it("looks for tooltip", () => {
    const tooltip = new CardTooltip();

    expect(tooltip.findTooltip).toBeCalledTimes(1);
  });

  describe("findTooltip", () => {
    let tooltip: CardTooltip, fakeElement: HTMLElement;

    beforeEach(() => {
      fakeElement = document.createElement("div");
      mocked(ready).mockImplementation((selector, cb) => {
        cb(fakeElement);
      });
      tooltip = new CardTooltip();
      (tooltip.findTooltip as jest.Mock).mockRestore();
    });

    afterEach(() => {
      CardTooltip.resetTooltipElement();
    });

    it("waits for tooltip element to be available", () => {
      tooltip.findTooltip();

      expect(ready).toBeCalledTimes(1);
      expect(ready).toBeCalledWith("#card-tooltip", expect.any(Function));
    });

    it("skips waiting for tooltip element if it is already available", () => {
      tooltip.findTooltip();

      expect(ready).toBeCalledTimes(1);
      mocked(ready).mockClear();

      tooltip.findTooltip();

      expect(ready).not.toBeCalled();
    });
  });

  describe("addElement", () => {
    let tooltip: CardTooltip;

    beforeEach(() => {
      tooltip = new CardTooltip();
      jest.spyOn(tooltip, "createMousemoveHandler").mockReturnValue(noop);
      jest.spyOn(tooltip, "createMouseoutHandler").mockReturnValue(noop);
    });

    it("adds an element to list of elements with handlers", () => {
      const el = document.createElement("div");

      expect(tooltip.elements.length).toBe(0);

      tooltip.addElement(el);

      expect(tooltip.elements.length).toBe(1);
      expect(tooltip.elements[0].element).toBe(el);
      expect(tooltip.elements[0].mousemoveHandler).toBeInstanceOf(Function);
      expect(tooltip.elements[0].mouseoutHandler).toBeInstanceOf(Function);
    });

    it("adds event listeners to element", () => {
      const el = document.createElement("div");

      jest.spyOn(el, "addEventListener");

      tooltip.addElement(el);

      expect(el.addEventListener).toBeCalledTimes(2);
      expect(el.addEventListener).toBeCalledWith(
        "mousemove",
        expect.any(Function)
      );
      expect(el.addEventListener).toBeCalledWith(
        "mouseout",
        expect.any(Function)
      );

      expect(tooltip.createMousemoveHandler).toBeCalledTimes(1);
      expect(tooltip.createMousemoveHandler).toBeCalledWith(el);
      expect(tooltip.createMouseoutHandler).toBeCalledTimes(1);
      expect(tooltip.createMouseoutHandler).toBeCalledWith(el);
    });
  });

  describe("removeElement", () => {
    let tooltip: CardTooltip;

    beforeEach(() => {
      tooltip = new CardTooltip();
      jest.spyOn(tooltip, "createMousemoveHandler").mockReturnValue(noop);
      jest.spyOn(tooltip, "createMouseoutHandler").mockReturnValue(noop);
    });

    it("ignores elements that do not exist in list", () => {
      const el = document.createElement("div");

      expect(() => {
        tooltip.removeElement(el);
      }).not.toThrow();

      expect(tooltip.elements.length).toBe(0);
    });

    it("removes element from list of elements with handlers", () => {
      const el = document.createElement("div");

      tooltip.addElement(el);

      expect(tooltip.elements.length).toBe(1);

      tooltip.removeElement(el);

      expect(tooltip.elements.length).toBe(0);
    });

    it("removes event listeners from element", () => {
      const el = document.createElement("div");

      jest.spyOn(el, "removeEventListener");

      tooltip.addElement(el);

      const mousemoveHandler = tooltip.elements[0].mousemoveHandler;
      const mouseoutHandler = tooltip.elements[0].mouseoutHandler;

      tooltip.removeElement(el);

      expect(el.removeEventListener).toBeCalledTimes(2);
      expect(el.removeEventListener).toBeCalledWith(
        "mousemove",
        mousemoveHandler
      );
      expect(el.removeEventListener).toBeCalledWith(
        "mouseout",
        mouseoutHandler
      );
    });
  });

  describe("setImage", () => {
    it("sets image", () => {
      const tooltip = new CardTooltip();

      tooltip.setImage("https://example.com/foo.png");
      expect(tooltip.img).toBe("https://example.com/foo.png");
    });
  });

  describe("createMousemoveHandler", () => {
    let tooltip: CardTooltip;
    let el: HTMLElement;
    let fakeEvent: MouseEvent;
    let mousemoveSpy: jest.Mock;

    beforeEach(() => {
      mousemoveSpy = jest.fn();

      tooltip = new CardTooltip({
        onMouseover: mousemoveSpy,
      });

      tooltip.tooltipElement = document.createElement("div");
      tooltip.tooltipElement.innerHTML = '<img id="card-tooltip-img" />';
      document.body.appendChild(tooltip.tooltipElement);

      tooltip.img = "https://example.com/image.png";
      el = document.createElement("div");
      fakeEvent = new MouseEvent("mouseout");
    });

    it("returns a function", () => {
      expect(tooltip.createMousemoveHandler(el)).toBeInstanceOf(Function);
    });

    it("does nothing if no tooltip element is available", () => {
      delete tooltip.tooltipElement;

      const handler = tooltip.createMousemoveHandler(el);

      expect(() => {
        handler(new MouseEvent("mousemove"));
      }).not.toThrow();
    });

    it("noops when window width is small", () => {
      const originalWidth = window.innerWidth;
      const handler = tooltip.createMousemoveHandler(el);

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: 600,
      });

      handler(fakeEvent);

      expect(tooltip.tooltipElement?.style.display).not.toBe("block");

      Object.defineProperty(window, "innerWidth", {
        writable: true,
        value: originalWidth,
      });
    });

    it("noops when there is no img", () => {
      delete tooltip.img;

      const handler = tooltip.createMousemoveHandler(el);

      handler(fakeEvent);

      expect(tooltip.tooltipElement?.style.display).not.toBe("block");
    });

    it("opens tooltip", () => {
      const handler = tooltip.createMousemoveHandler(el);

      Object.defineProperty(fakeEvent, "pageX", {
        writable: true,
        value: 100,
      });
      Object.defineProperty(fakeEvent, "pageY", {
        writable: true,
        value: 100,
      });
      handler(fakeEvent);

      expect(tooltip.tooltipElement?.style.display).toBe("block");
      expect(tooltip.tooltipElement?.style.left).toBe("150px");
      expect(tooltip.tooltipElement?.style.top).toBe("70px");

      expect(
        (document.getElementById("card-tooltip-img") as HTMLImageElement).src
      ).toBe("https://example.com/image.png");
    });

    it("calls onMousemove callback with element if provided", () => {
      const handler = tooltip.createMousemoveHandler(el);

      handler(fakeEvent);

      expect(mousemoveSpy).toBeCalledTimes(1);
      expect(mousemoveSpy).toBeCalledWith(el);
    });
  });

  describe("createMouseoutHandler", () => {
    let tooltip: CardTooltip, el: HTMLElement;

    beforeEach(() => {
      tooltip = new CardTooltip();
      tooltip.tooltipElement = document.createElement("div");
      el = document.createElement("div");
    });

    it("returns a function", () => {
      expect(tooltip.createMouseoutHandler(el)).toBeInstanceOf(Function);
    });

    it("does nothing if no tooltip element is available", () => {
      delete tooltip.tooltipElement;

      const handler = tooltip.createMouseoutHandler(el);

      expect(() => {
        handler(new MouseEvent("mouseout"));
      }).not.toThrow();
    });

    it("sets tooltip element style to `none`", () => {
      const handler = tooltip.createMouseoutHandler(el);

      handler(new MouseEvent("mouseout"));

      expect(tooltip.tooltipElement?.style.display).toBe("none");
    });

    it("calls onMouseout callback with element if provided", () => {
      const spy = jest.fn();

      tooltip = new CardTooltip({
        onMouseout: spy,
      });
      tooltip.tooltipElement = document.createElement("div");
      const handler = tooltip.createMouseoutHandler(el);

      handler(new MouseEvent("mouseout"));

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(el);
    });
  });

  describe("triggerOnMouseover", () => {
    it("calls onMouseover handler", () => {
      const spy = jest.fn();
      const el = document.createElement("div");
      const tooltip = new CardTooltip({
        onMouseover: spy,
      });

      tooltip.triggerOnMouseover(el);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(el);
    });

    it("does not error if no onMouseover option is passed", () => {
      const el = document.createElement("div");
      const tooltip = new CardTooltip();

      expect(() => {
        tooltip.triggerOnMouseover(el);
      }).not.toThrow();
    });
  });

  describe("triggerOnMouseout", () => {
    it("calls onMouseout handler", () => {
      const spy = jest.fn();
      const el = document.createElement("div");
      const tooltip = new CardTooltip({
        onMouseout: spy,
      });

      tooltip.triggerOnMouseout(el);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(el);
    });

    it("does not error if no onMouseout option is passed", () => {
      const el = document.createElement("div");
      const tooltip = new CardTooltip();

      expect(() => {
        tooltip.triggerOnMouseout(el);
      }).not.toThrow();
    });
  });
});
