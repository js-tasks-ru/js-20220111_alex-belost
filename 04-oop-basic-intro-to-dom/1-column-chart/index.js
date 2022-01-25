export default class ColumnChart {
  config = {};

  get chartHeight() {
    const computedStyle = window.getComputedStyle(this.element);

    return parseInt(computedStyle.getPropertyValue('--chart-height'));
  }

  get _isDataExist() {
    return this.config.data && !!this.config.data.length;
  }

  constructor(config) {
    this._setConfig(config);
    this._render();
  }

  update(config) {
    this._setConfig(config);
    this._render();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.remove();
  }

  _render() {
    const wrapperElement = document.createElement('div');

    wrapperElement.innerHTML = this._getTemplate();

    const chartElement = wrapperElement.firstElementChild;

    if (!this.element) {
      this.element = chartElement;
    }

    this.element.replaceWith(chartElement);
    this.element = chartElement;
  }

  _getTemplate() {
    return `
      <div class="column-chart${!this._isDataExist ? ' column-chart_loading' : ''}" style="--chart-height: 50">
        <div class="column-chart__title">
          ${this.config.label} ${this._getLintTemplate(this.config.link)}
        </div>
        
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this._getChartValue()}</div>
          
          <div data-element="body" class="column-chart__chart">
            ${this._getDataTemplate()}
          </div>
        </div>
      </div>
    `;
  }

  _getLintTemplate(link) {
    const getLintTemplate = (url) => `<a href="${url}" class="column-chart__link">View all</a>`;

    return link ? getLintTemplate(link) : '';
  }

  _getChartValue() {
    return this.config.formatHeading ? this.config.formatHeading(this.config.value) : this.config.value;
  }

  _getDataTemplate() {
    return this._isDataExist ? this._getColumnProps(this.config.data)
        .map(({ value, percent }) => this._getDataItemTemplate(value, percent)) : '';
  }

  _getDataItemTemplate(value, tooltip) {
    console.log(value, tooltip);
    return `<div style="--value: ${value}" data-tooltip="${tooltip}"></div>`;
  }

  _setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  _getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale)),
      };
    });
  }
}
