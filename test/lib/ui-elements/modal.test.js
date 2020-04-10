import DialogInterface from "Ui/dialog-interface";
import Modal from "Ui/modal";

describe("Modal", function () {
  it("is a DialogInterface", function () {
    const modal = new Modal();

    expect(modal).toBeInstanceOf(DialogInterface);
  });

  it("creates a scryfall style modal", function () {
    const modal = new Modal();

    expect(modal.element.querySelector(".modal-dialog")).not.toBeFalsy();
    expect(
      modal.element.querySelector(".modal-dialog-content")
    ).not.toBeFalsy();
    expect(modal.element.querySelector(".modal-dialog-close")).not.toBeFalsy();
  });

  it("closes when the close button is clicked", function () {
    const modal = new Modal();
    const close = modal.element.querySelector(".modal-dialog-close");

    jest.spyOn(modal, "close").mockImplementation();

    close.click();

    expect(modal.close).toBeCalledTimes(1);
  });

  it("has default loading label", function () {
    const modal = new Modal();

    expect(
      modal.element.querySelector(".dialog-loader").getAttribute("aria-label")
    ).toBe("Loading");
  });

  it("can provide a loading label", function () {
    const modal = new Modal({
      loadingMessage: "Custom Loading Message",
    });

    expect(
      modal.element.querySelector(".dialog-loader").getAttribute("aria-label")
    ).toBe("Custom Loading Message");
  });
});
