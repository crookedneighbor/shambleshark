import DialogInterface, { DialogInterfaceOptions } from "./dialog-interface";
import createElement from "Lib/create-element";
import { getURL } from "Browser/runtime";

const SPINNER_GIF = getURL("spinner.gif");

import "./modal.css";

interface ModalOptions extends DialogInterfaceOptions {
  contentMessage?: string;
}

export default class Modal extends DialogInterface {
  _constructElement(options: ModalOptions = {}): HTMLDivElement {
    const titleId = `modal-title-${options.id}`;
    const modal = createElement<HTMLDivElement>(`<div
      class="modal-dialog-overlay"
      aria-modal="true"
      role="dialog")
      aria-labelledby="${titleId}"
    >
      <div class="modal-dialog">
        <h6 class="modal-dialog-title">
          <span class="dialog-title" id="${titleId}">
            <span class="dialog-title-symbol">${
              options.headerSymbol || ""
            }</span>
            <span class="dialog-title-content"></span>
          </span>
          <button type="button" title="${this._getCloseButtonMessage()}" class="dialog-close modal-dialog-close">
            <span class="vh">Close this dialog</span> <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M217.5 256l137.2-137.2c4.7-4.7 4.7-12.3 0-17l-8.5-8.5c-4.7-4.7-12.3-4.7-17 0L192 230.5 54.8 93.4c-4.7-4.7-12.3-4.7-17 0l-8.5 8.5c-4.7 4.7-4.7 12.3 0 17L166.5 256 29.4 393.2c-4.7 4.7-4.7 12.3 0 17l8.5 8.5c4.7 4.7 12.3 4.7 17 0L192 281.5l137.2 137.2c4.7 4.7 12.3 4.7 17 0l8.5-8.5c4.7-4.7 4.7-12.3 0-17L217.5 256z"></path></svg>
          </button>
        </h6>

        <div class="dialog-loader modal-dialog-content" role="alert">
          <img src="${SPINNER_GIF}" class="modal-dialog-spinner" aria-hidden="true">
        </div>
      <!---->
        <div class="dialog-content-container modal-dialog-stage loading">
          <div role="alert" aria-label="${
            options.contentMessage || "Modal Loaded"
          }"></div>
          <div class="dialog-content modal-dialog-stage-content"></div>
        </div>
      </div>
   </div>`);

    (modal.querySelector(".dialog-close") as HTMLElement).addEventListener(
      "click",
      () => {
        this.close();
      }
    );

    return modal;
  }
}
