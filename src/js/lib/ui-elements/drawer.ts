import DialogInterface, {
  DialogInterfaceOptions,
  DialogListener,
} from "./dialog-interface";
import createElement from "Lib/create-element";
import "./drawer.css";
import { SPINNER_GIF } from "Constants";

interface DrawerOptions extends DialogInterfaceOptions {
  position?: string;
  contentMessage?: string;
}

export default class Drawer extends DialogInterface {
  _scrollableEl: HTMLElement;

  position: string;

  constructor(options: DrawerOptions = {}) {
    super(options);

    this.position = options.position || "right";
    this.$(".drawer-dialog").classList.add(
      `drawer-dialog-position-${this.position}`
    );

    this._scrollableEl = this.$(".drawer-dialog");

    if (options.onScroll) {
      this._scrollableEl.addEventListener("scroll", () => {
        this.triggerOnScroll();
      });
    }
  }

  open() {
    super.open();

    this.element.classList.add("open");
  }

  close() {
    super.close();

    this.element.classList.remove("open");
  }

  getScrollableElement() {
    return this._scrollableEl;
  }

  // TODO explore using an HTMLDialogElement here
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement
  _constructElement(options: DrawerOptions): HTMLDivElement {
    const titleId = `drawer-title-${options.id}`;

    const drawer = createElement<HTMLDivElement>(`<div
      class="drawer-dialog-overlay modal-dialog-overlay"
      aria-modal="true"
      role="dialog"
      aria-labelledby="${titleId}"
    >
      <!-- sometimes modal dialog classes are used to take advantage of existing style rules on the site -->
      <div class="drawer-dialog">
        <h6 class="drawer-dialog-title modal-dialog-title">
          <span class="dialog-title" id="${titleId}">
            <span class="dialog-title-symbol">${
              options.headerSymbol || ""
            }</span>
            <span class="dialog-title-content"></span>
          </span>
          <button type="button" title="${this._getCloseButtonMessage(
            true
          )}" class="dialog-close modal-dialog-close">
            <span class="vh">Close this dialog</span> <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M217.5 256l137.2-137.2c4.7-4.7 4.7-12.3 0-17l-8.5-8.5c-4.7-4.7-12.3-4.7-17 0L192 230.5 54.8 93.4c-4.7-4.7-12.3-4.7-17 0l-8.5 8.5c-4.7 4.7-4.7 12.3 0 17L166.5 256 29.4 393.2c-4.7 4.7-4.7 12.3 0 17l8.5 8.5c4.7 4.7 12.3 4.7 17 0L192 281.5l137.2 137.2c4.7 4.7 12.3 4.7 17 0l8.5-8.5c4.7-4.7 4.7-12.3 0-17L217.5 256z"></path></svg>
          </button>
        </h6>

        <div class="dialog-loader drawer-dialog-content" role="alert">
          <img src="${SPINNER_GIF}" class="modal-dialog-spinner" aria-hidden="true">
        </div>
      <!---->
        <div class="dialog-content-container drawer-dialog-stage loading">
          <div role="alert" aria-label="${
            options.contentMessage || "Dialog Loaded"
          }"></div>
          <div class="dialog-content drawer-dialog-stage-content"></div>
        </div>
      </div>
    </div>`);

    drawer.querySelector(".dialog-close")!.addEventListener("click", () => {
      this.close();
    });

    return drawer;
  }
}
