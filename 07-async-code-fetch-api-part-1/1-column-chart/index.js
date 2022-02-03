import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  config = {};

  element = null;
  data = {};
  dataValues = [];
  subElements = {};

  get chartHeight() {
    const computedStyle = window.getComputedStyle(this.element);

    return parseInt(computedStyle.getPropertyValue('--chart-height'));
  }

  constructor({
    url = '',
    label = '',
    formatHeading = data => data,
    range,
    link,
  } = {}) {
    this.url = url;
    this.label = label;
    this.formatHeading = formatHeading;
    this.link = link;

    this.render();
    this.initListeners();

    this.setData(range);
  }

  initListeners() {
    this.element.addEventListener('data:change', this.onDataChange.bind(this));
  }

  async update(from, to) {
    await this.setData({ from, to });

    return this.data;
  }

  remove() {
    if (!this.element) {
      return;
    }

    this.element.remove();
  }

  destroy() {
    if (!this.element) {
      return;
    }

    this.element.remove();
    this.element = null;
    this.subElements = {};
    this.data = {};
    this.dataValues = [];
  }

  render() {
    const wrapperElement = document.createElement('div');

    wrapperElement.innerHTML = this.getCoreHtml();

    this.element = wrapperElement.firstElementChild;
    this.element.querySelectorAll('[data-element]')
        .forEach((element) => this.subElements[element.dataset.element] = element);
  }

  onDataChange(event) {
    if (!event.detail) {
      return;
    }

    this.data = event.detail;
    this.dataValues = Object.values(this.data);

    const totalValue = this.dataValues.reduce((result, value) => (result += value));

    this.subElements.header.innerHTML = this.formatHeading(totalValue);
    this.subElements.body.innerHTML = this.getChartDataHtml();

    this.element.classList.remove('column-chart_loading');
  }

  getCoreHtml() {
    const titleLinkHtml = this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';

    return `
      <div class="column-chart" style="--chart-height: 50">
        <div class="column-chart__title">
          ${this.label} ${titleLinkHtml}
        </div>
        
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  getChartDataHtml() {
    const props = this.getProps(this.dataValues);
    const list = props.map(({ value, percent }) => `<div style="--value: ${value}" data-tooltip="${percent}"></div>`);

    return list.join('');
  }

  getProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale)),
      };
    });
  }

  getUrl(path = '', params = {}) {
    const url = new URL(path, BACKEND_URL);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value.toISOString());
    });

    return url;
  }

  emitDataChange(data) {
    this.element.dispatchEvent(new CustomEvent('data:change', { detail: data }));
  }

  async setData(range) {
    this.element.classList.add('column-chart_loading');

    if (!range) {
      return;
    }

    const response = await fetchJson(this.getUrl(this.url, range));

    this.emitDataChange(response);
  }
}
