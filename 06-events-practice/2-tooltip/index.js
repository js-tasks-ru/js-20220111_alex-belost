class Tooltip {
  static instance = null;

  element = null;
  isTooltipShown = false;

  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }

    return Tooltip.instance;
  }

  render() {
    document.body.append(this.element);
  }

  initialize() {
    this.element = this.getElement();

    this.initListeners();
  }

  initListeners() {
    document.addEventListener('pointerover', this.onPointerOver.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onPointerOver(event) {
    const tooltip = event.target.closest('[data-tooltip]');

    if (!tooltip) {
      this.element.remove();

      this.isTooltipShown = false;

      return;
    }

    if (!this.isTooltipShown) {
      document.body.append(this.element);

      this.isTooltipShown = true;
    }

    if (this.element.innerHTML !== tooltip.dataset.tooltip) {
      this.element.innerHTML = tooltip.dataset.tooltip;
    }
  }

  onMouseMove(event) {
    if (!this.element || !this.isTooltipShown) {
      return;
    }

    const TOOLTIP_OFFSET = 20;

    this.element.style.left = `${event.x + TOOLTIP_OFFSET}px`;
    this.element.style.top = `${event.y + TOOLTIP_OFFSET}px`;
  }

  getElement() {
    const element = document.createElement('div');

    element.classList.add('tooltip');

    return element;
  }

  destroy() {
    document.removeEventListener('pointerover', this.onPointerOver.bind(this));
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));

    this.element = null;
    this.isTooltipShown = false;
  }
}

export default Tooltip;
