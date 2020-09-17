import DialogInterface from "Ui/dialog-interface";
import Modal from "Ui/modal";

describe("Modal", () => {
  it("is a DialogInterface", () => {
    const modal = new Modal();

    expect(modal).toBeInstanceOf(DialogInterface);
  });

  it("creates a scryfall style modal", () => {
    const modal = new Modal();

    expect(modal.$(".modal-dialog")).not.toBeFalsy();
    expect(modal.$(".modal-dialog-content")).not.toBeFalsy();
    expect(modal.$(".modal-dialog-close")).not.toBeFalsy();
  });

  it("closes when the close button is clicked", () => {
    const modal = new Modal();
    const close = modal.$(".modal-dialog-close");

    jest.spyOn(modal, "close").mockImplementation();

    close.click();

    expect(modal.close).toBeCalledTimes(1);
  });

  it("has default loading label", () => {
    const modal = new Modal();

    expect(modal.$(".dialog-loader").getAttribute("aria-label")).toBe(
      "Loading"
    );
  });

  it("can provide a loading label", () => {
    const modal = new Modal({
      loadingMessage: "Custom Loading Message",
    });

    expect(modal.$(".dialog-loader").getAttribute("aria-label")).toBe(
      "Custom Loading Message"
    );
  });
});
