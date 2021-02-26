import { ready as elementReady } from "Lib/mutation";
import noop from "Lib/noop";

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

let tooltipElement: HTMLElement | null;

export default class CardTooltip {
  elements: ElementConfig[];
  tooltipElement?: HTMLElement;
  frontImg?: string;
  backImg?: string;

  private _onMouseover: OnMouseHandler;
  private _onMouseout: OnMouseHandler;

  constructor(options: CardTooltipOptions = {}) {
    this.elements = [];

    this._onMouseover = options.onMouseover || noop;
    this._onMouseout = options.onMouseout || noop;

    this.findTooltip();
  }

  static resetTooltipElement(): void {
    tooltipElement = null;
  }

  findTooltip(): void {
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

  addElement(el: HTMLElement): void {
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

  removeElement(el: HTMLElement): void {
    const index = this.elements.findIndex((config) => el === config.element);

    if (index === -1) {
      return;
    }

    const config = this.elements[index];

    config.element.removeEventListener("mousemove", config.mousemoveHandler);
    config.element.removeEventListener("mouseout", config.mouseoutHandler);

    this.elements.splice(index, 1);
  }

  setImages(frontUrl: string, backUrl?: string): void {
    this.frontImg = frontUrl;
    this.backImg = backUrl;
  }

  createMousemoveHandler(el: HTMLElement): MouseHandler {
    return (event: MouseEvent): void => {
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

      if (!this.frontImg) {
        return;
      }

      if (this.backImg) {
        this.tooltipElement.className = "two-up";
      } else {
        this.tooltipElement.className = "";
      }

      if (this.tooltipElement.style.display !== "flex") {
        this.tooltipElement.style.display = "flex";
      }

      // TODO look into using something other than pageX, as it is not
      // fully supported
      this.tooltipElement.style.left = event.pageX + 50 + "px";
      this.tooltipElement.style.top = event.pageY - 30 + "px";

      const existingFrontCardTooltipImg = document.getElementById(
        "card-tooltip-img-front"
      ) as HTMLImageElement;
      const existingBackCardTooltipImg = document.getElementById(
        "card-tooltip-img-back"
      ) as HTMLImageElement;

      if (existingFrontCardTooltipImg?.src !== this.frontImg) {
        const newFrontImgElement = document.createElement("img");
        newFrontImgElement.id = "card-tooltip-img-front";
        newFrontImgElement.className = "card";
        newFrontImgElement.src = this.frontImg;

        if (existingFrontCardTooltipImg) {
          this.tooltipElement.removeChild(existingFrontCardTooltipImg);
        }
        this.tooltipElement.appendChild(newFrontImgElement);
      }

      if (this.backImg && existingBackCardTooltipImg?.src !== this.backImg) {
        const newBackImgElement = document.createElement("img");
        newBackImgElement.id = "card-tooltip-img-back";
        newBackImgElement.className = "card";
        newBackImgElement.src = this.backImg;
        if (existingBackCardTooltipImg) {
          this.tooltipElement.removeChild(existingBackCardTooltipImg);
        }
        this.tooltipElement.appendChild(newBackImgElement);
      } else if (existingBackCardTooltipImg && !this.backImg) {
        this.tooltipElement.removeChild(existingBackCardTooltipImg);
      }
    };
  }

  createMouseoutHandler(el: HTMLElement): MouseHandler {
    return (): void => {
      if (!this.tooltipElement) {
        return;
      }

      this.triggerOnMouseout(el);

      this.tooltipElement.style.display = "none";
    };
  }

  triggerOnMouseover(el: HTMLElement): void {
    if (!this._onMouseover) {
      return;
    }
    this._onMouseover(el);
  }

  triggerOnMouseout(el: HTMLElement): void {
    if (!this._onMouseout) {
      return;
    }
    this._onMouseout(el);
  }
}
