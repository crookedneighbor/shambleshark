import { ready as elementReady } from "Lib/mutation";

type MouseHandler = (event: MouseEvent) => void;
type OnMouseHandler = (el: HTMLElement) => void;

type CardTooltipOptions = {
  onMouseover?: OnMouseHandler;
  onMouseout?: OnMouseHandler;
};

type ElementConfig = {
  element: HTMLElement;
  mousemoveHandler: MouseHandler;
  mouseoutHandler: MouseHandler;
};

let tooltipElement: HTMLElement;

export default class CardTooltip {
  elements: ElementConfig[];
  tooltipElement?: HTMLElement;
  img?: string;

  private _onMouseover: OnMouseHandler;
  private _onMouseout: OnMouseHandler;

  constructor(options: CardTooltipOptions = {}) {
    this.elements = [];

    this._onMouseover = options.onMouseover || function () {};
    this._onMouseout = options.onMouseout || function () {};

    this.findTooltip();
  }

  static resetTooltipElement() {
    // @ts-ignore
    tooltipElement = null;
  }

  findTooltip() {
    if (tooltipElement) {
      this.tooltipElement = tooltipElement;

      return;
    }

    // TODO it's possible to hit a race condition here if multiple
    // features on the same page are using this where the tooltip
    // element never respnds a second time
    elementReady("#card-tooltip", (tooltip) => {
      this.tooltipElement = tooltipElement = tooltip;
    });
  }

  addElement(el: HTMLElement) {
    const mousemoveHandler = this.createMousemoveHandler(el);
    const mouseoutHandler = this.createMouseoutHandler(el);

    this.elements.push({
      element: el,
      mousemoveHandler,
      mouseoutHandler,
    });

    el.addEventListener("mousemove", mousemoveHandler);
    el.addEventListener("mouseout", mouseoutHandler);
  }

  removeElement(el: HTMLElement) {
    const index = this.elements.findIndex((config) => el === config.element);

    if (index === -1) {
      return;
    }

    const config = this.elements[index];

    config.element.removeEventListener("mousemove", config.mousemoveHandler);
    config.element.removeEventListener("mouseout", config.mouseoutHandler);

    this.elements.splice(index, 1);
  }

  setImage(url: string) {
    this.img = url;
  }

  createMousemoveHandler(el: HTMLElement): MouseHandler {
    return (event: MouseEvent) => {
      // largley adapted from Scryfall's site, if that changes
      // this may also need ot be updated

      if (!this.tooltipElement) {
        return;
      }

      if (window.innerWidth < 768) {
        // window is too small to bother with presenting card image
        return;
      }

      this.triggerOnMouseover(el);

      if (!this.img) {
        return;
      }

      if (this.tooltipElement.style.display !== "block") {
        this.tooltipElement.style.display = "block";
      }

      // TODO look into using something other than pageX, as it is not
      // fully supported
      this.tooltipElement.style.left = event.pageX + 50 + "px";
      this.tooltipElement.style.top = event.pageY - 30 + "px";

      const cardToolTipImg = document.getElementById(
        "card-tooltip-img"
      ) as HTMLImageElement;

      if (cardToolTipImg.src !== this.img) {
        const t = document.createElement("img");
        t.id = "card-tooltip-img";
        t.className = "card";
        t.src = this.img;

        this.tooltipElement.removeChild(cardToolTipImg);
        this.tooltipElement.appendChild(t);
      }
    };
  }

  createMouseoutHandler(el: HTMLElement): MouseHandler {
    return () => {
      if (!this.tooltipElement) {
        return;
      }

      this.triggerOnMouseout(el);

      this.tooltipElement.style.display = "none";
    };
  }

  triggerOnMouseover(el: HTMLElement) {
    if (!this._onMouseover) {
      return;
    }
    this._onMouseover(el);
  }

  triggerOnMouseout(el: HTMLElement) {
    if (!this._onMouseout) {
      return;
    }
    this._onMouseout(el);
  }
}
