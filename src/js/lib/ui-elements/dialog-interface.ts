import scrollLock from "Lib/scroll-lock";
import emptyElement from "Lib/empty-element";

function noop() {
  // do nothing!
}

export type DialogInterfaceOptions = {
  content?: string;
  header?: string;
  headerSymbol?: string;
  id?: string;
  loadingMessage?: string;
  onClose?: Function;
  onOpen?: Function;
  onScroll?: Function;
  open?: boolean;
  resetContentOnClose?: boolean;
};

export default abstract class DialogInterface {
  _isOpen: boolean;
  _originalContent: string;
  _resetContentOnClose: boolean;
  _onClose: Function;
  _onOpen: Function;
  _onScroll: Function;
  _originalHeaderText: string;
  _contentNodeContainer: HTMLElement;
  _contentNode: HTMLElement;
  _loaderNode: HTMLElement;
  _headerNode: HTMLElement;

  element: HTMLDivElement;

  constructor(options: DialogInterfaceOptions = {}) {
    this._isOpen = false;
    this._originalContent = options.content || "";
    this._resetContentOnClose = Boolean(options.resetContentOnClose);
    this._onClose = options.onClose || noop;
    this._onOpen = options.onOpen || noop;
    this._onScroll = options.onScroll || noop;

    this._originalHeaderText = options.header || "";

    this.element = this._constructElement(options);
    this.element.addEventListener("click", (evt) => {
      if (evt.target !== this.element) {
        return;
      }

      this.close();
    });
    if (options.id) {
      this.element.id = options.id;
    }
    document.addEventListener("keyup", this._onEscKey.bind(this));

    this._contentNodeContainer = this.$(".dialog-content-container");
    this._contentNode = this._contentNodeContainer.querySelector(
      ".dialog-content"
    ) as HTMLElement;
    this.setContent(this._originalContent);
    this._loaderNode = this.$(".dialog-loader");
    this._loaderNode.setAttribute(
      "aria-label",
      options.loadingMessage || "Loading"
    );
    this._headerNode = this.$(".dialog-title-content");
    this.setHeader(this._originalHeaderText);

    if (!options.open) {
      this.element.style.display = "none";
    }
  }

  $(selector: string) {
    return this.element.querySelector(selector) as HTMLElement;
  }

  setContent(content: string | HTMLElement) {
    emptyElement(this._contentNode);

    if (typeof content === "string") {
      this._contentNode.innerText = content;
    } else {
      this._contentNode.appendChild(content);
    }
  }

  resetHeader() {
    this.setHeader(this._originalHeaderText);
  }

  setHeader(value: string) {
    this._headerNode.innerText = value;
  }

  setLoading(state: boolean) {
    const closeBtn = this.$(".dialog-close");

    if (state) {
      this._contentNodeContainer.classList.add("loading");
      this._loaderNode.removeAttribute("style");
    } else {
      this._contentNodeContainer.classList.remove("loading");
      this._loaderNode.style.display = "none";
      // Firefox often scrolls down content is
      // loading. This puts us back to the top
      this.scrollTo(0, 0);
    }
    closeBtn.title = this._getCloseButtonMessage(state);
  }

  open() {
    scrollLock(true);

    this.element.style.display = "";
    this._isOpen = true;

    this.triggerOnOpen();

    this.$(".dialog-close").focus();
  }

  close() {
    scrollLock(false);

    this.element.style.display = "none";
    this._isOpen = false;

    if (this._resetContentOnClose) {
      this.setContent(this._originalContent);
    }
    this.triggerOnClose();
  }

  triggerOnClose() {
    return this._onClose(this);
  }

  triggerOnOpen() {
    return this._onOpen(this);
  }

  triggerOnScroll() {
    return this._onScroll(this);
  }

  _onEscKey(event: KeyboardEvent) {
    if (!this._isOpen) {
      return;
    }

    if (event.key === "Escape") {
      event.stopPropagation();

      this.close();
    }
  }

  _getCloseButtonMessage(isLoading?: boolean) {
    if (isLoading) {
      return "The dialog is loading. You may cancel this dialog by using this button.";
    } else {
      return "Close this dialog.";
    }
  }

  abstract _constructElement(options: DialogInterfaceOptions): HTMLDivElement;

  scrollTo(x: number, y: number) {
    this.element.scrollTo(x, y);
  }
}
