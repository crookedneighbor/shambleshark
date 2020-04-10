import mutation from "Lib/mutation";

let tooltipElement;

export default class CardTooltip {
  constructor(options = {}) {
    this.elements = [];

    this._onMouseover = options.onMouseover;
    this._onMouseout = options.onMouseout;

    this.findTooltip();
  }

  static resetTooltipElement() {
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
    mutation.ready("#card-tooltip", (tooltip) => {
      this.tooltipElement = tooltipElement = tooltip;
    });
  }

  addElement(el) {
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

  removeElement(el) {
    const index = this.elements.findIndex((config) => el === config.element);

    if (index === -1) {
      return;
    }

    const config = this.elements[index];

    config.element.removeEventListener("mousemove", config.mousemoveHandler);
    config.element.removeEventListener("mouseout", config.mouseoutHandler);

    this.elements.splice(index, 1);
  }

  setImage(url) {
    this.img = url;
  }

  createMousemoveHandler(el) {
    const self = this;

    return (event) => {
      // largley adapted from Scryfall's site, if that changes
      // this may also need ot be updated

      if (!self.tooltipElement) {
        return;
      }

      if (window.innerWidth < 768) {
        // window is too small to bother with presenting card image
        return;
      }

      self.triggerOnMouseover(el);

      if (!self.img) {
        return;
      }

      if (self.tooltipElement.style.display !== "block") {
        self.tooltipElement.style.display = "block";
      }

      self.tooltipElement.style.left = event.pageX + 50 + "px";
      self.tooltipElement.style.top = event.pageY - 30 + "px";

      const cardToolTipImg = document.getElementById("card-tooltip-img");

      if (cardToolTipImg.src !== self.img) {
        const t = document.createElement("img");
        t.id = "card-tooltip-img";
        t.className = "card";
        t.src = self.img;

        self.tooltipElement.removeChild(cardToolTipImg);
        self.tooltipElement.appendChild(t);
      }
    };
  }

  createMouseoutHandler(el) {
    const self = this;

    return () => {
      if (!self.tooltipElement) {
        return;
      }

      self.triggerOnMouseout(el);

      self.tooltipElement.style.display = "none";
    };
  }

  triggerOnMouseover(el) {
    if (!this._onMouseover) {
      return;
    }
    this._onMouseover(el);
  }

  triggerOnMouseout(el) {
    if (!this._onMouseout) {
      return;
    }
    this._onMouseout(el);
  }
}
