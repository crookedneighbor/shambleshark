import DialogInterface from "Ui/dialog-interface";
import Drawer from "Ui/drawer";

describe("Drawer", () => {
  it("is a DialogInterface", () => {
    const drawer = new Drawer();

    expect(drawer).toBeInstanceOf(DialogInterface);
  });

  it("makes a drawer element", () => {
    const drawer = new Drawer();

    expect(drawer.$(".drawer-dialog")).toBeTruthy();
  });

  it("defaults position to right", () => {
    const drawer = new Drawer();

    expect(drawer.$(".drawer-dialog-position-right")).toBeTruthy();
    expect(drawer.$(".drawer-dialog-position-left")).toBeFalsy();
    expect(drawer.$(".drawer-dialog-position-top")).toBeFalsy();
    expect(drawer.$(".drawer-dialog-position-bottom")).toBeFalsy();
  });

  it("can set position", () => {
    const drawer = new Drawer({
      position: "top",
    });

    expect(drawer.$(".drawer-dialog-position-right")).toBeFalsy();
    expect(drawer.$(".drawer-dialog-position-top")).toBeTruthy();
  });

  it("closes when the close button is clicked", () => {
    const drawer = new Drawer();
    const close = drawer.$(".dialog-close");

    jest.spyOn(drawer, "close").mockImplementation();

    close.click();

    expect(drawer.close).toBeCalledTimes(1);
  });

  it("adds an open class when open is called", () => {
    const drawer = new Drawer();

    expect(drawer.element.classList.contains("open")).toBeFalsy();

    drawer.open();

    expect(drawer.element.classList.contains("open")).toBeTruthy();
  });

  it("removes open class when close is called", () => {
    const drawer = new Drawer();

    drawer.open();
    expect(drawer.element.classList.contains("open")).toBeTruthy();

    drawer.close();
    expect(drawer.element.classList.contains("open")).toBeFalsy();
  });

  it("can set on onScroll callback", () => {
    const spy = jest.fn();
    const drawer = new Drawer({
      onScroll: spy,
    });
    expect(spy).toBeCalledTimes(0);

    const event = document.createEvent("UIEvents");
    event.initEvent("scroll", true, true);
    drawer.$(".drawer-dialog").dispatchEvent(event);

    expect(spy).toBeCalledTimes(1);
  });

  it("can return the scrollable element", () => {
    const drawer = new Drawer();

    const el = drawer.getScrollableElement();

    expect(el.classList.contains("drawer-dialog")).toBeTruthy();
  });
});
