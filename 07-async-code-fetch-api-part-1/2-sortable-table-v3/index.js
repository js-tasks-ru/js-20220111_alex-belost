import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element = null;
  subElements = {};
  headersMap = {};

  isLoadedAll = false;
  isLoading = false;
  sortDirection = true;

  ordersMap = new Map([
    [true, 'asc'],
    [false, 'desc'],
    ['asc', 1],
    ['desc', -1],
  ]);

  data = [];
  page = 1;
  perPage = 20;

  constructor(headersConfig, options = {}) {
    const {
      url = '',
      isSortLocally = false,
      sorted = {},
    } = options;

    this.headersConfig = headersConfig;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;

    this.render();
  }

  async render() {
    this.element = this.getHostElement();
    this.subElements = this.getElementsMap(this.element, 'element');
    this.headersMap = this.getHeadersMap();

    this.initListeners();

    const { id, order } = this.sorted;

    await this.update(id, order);
  }

  async update(id, order) {
    if (this.isLoadedAll) {
      return;
    }

    const data = await this.getData$(id, order);

    this.data = [...this.data, ...data];
    this.page++;

    this.subElements.body.innerHTML = this.getTableBodyHtml();
  }

  async getData$(id, order) {
    this.isLoading = true;

    this.element.classList.add('sortable-table_loading');

    this.url.searchParams.set('_sort', `${id}`);
    this.url.searchParams.set('_order', `${order}`);
    this.url.searchParams.set('_start', `${this.data.length}`);
    this.url.searchParams.set('_end', `${this.perPage * this.page}`);

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');
    this.isLoading = false;

    this.subElements.loading.removeAttribute('style');

    this.isLoadedAll = data.length < this.perPage;

    return data;
  }

  destroy() {
    window.removeEventListener('scroll', this.onScroll.bind(this));

    if (this.element) {
      this.element.remove();
    }

    this.element = null;
    this.data = [];
    this.headersConfig = [];
    this.subElements = {};
    this.headerElements = {};
  }

  sortOnClient(id, order) {
    const { config } = this.headersMap[id];

    const sortTypeFnMap = {
      'string': this.getStringSortFn(),
      'number': this.getNumberSortFn(),
    };

    this.data = this.data.sort(sortTypeFnMap[config.sortType]);
    this.subElements.body.innerHTML = this.getTableBodyHtml();
  }

  async sortOnServer(id, order) {
    this.page = 1;
    this.data = [];

    await this.update(id, order);
  }

  onSortClick(event) {
    const sortableElement = event.target.closest('[data-sortable="true"]');

    if (!sortableElement) {
      return;
    }

    this.sortDirection = !this.sortDirection;

    this.sorted = {
      id: sortableElement.dataset.id,
      order: this.ordersMap.get(this.sortDirection),
    };

    Object.values(this.headersMap).forEach(({ element }) => element.dataset.order = '');
    sortableElement.dataset.order = this.sorted.order;

    const { id, order } = this.sorted;

    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  onScroll() {
    const { bottom } = this.element.getBoundingClientRect();

    if (bottom >= window.innerHeight || this.isLoading || this.isLoadedAll) {
      return;
    }

    this.update();
  }

  initListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  getStringSortFn() {
    const { id, order } = this.sorted;

    return (a, b) => {
      return this.ordersMap.get(order) * a[id].localeCompare(b[id], ['ru', 'en'], { caseFirst: 'upper' });
    };
  }

  getNumberSortFn() {
    const { id, order } = this.sorted;

    return (a, b) => this.ordersMap.get(order) * (a[id] - b[id]);
  }

  getHeadersMap() {
    const entries = Array.from(this.subElements.header.children, (element) => {
      const elementId = element.dataset.id;
      const config = this.headersConfig.find((headersItem) => elementId === headersItem.id);

      return [elementId, { element, config }];
    });

    return Object.fromEntries(entries);
  }

  getHostElement() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getCoreHtml();

    return wrapper.firstElementChild;
  }

  getElementsMap(target, dataset) {
    const entries = Array.from(
      target.querySelectorAll(`[data-${dataset}]`),
      (element) => [element.dataset[dataset], element],
    );

    return Object.fromEntries(entries);
  }

  getCoreHtml() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getTableHeaderHtml()}
        </div>
    
        <div data-element="body" class="sortable-table__body">
          ${this.getTableBodyHtml()}
        </div>
    
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>
    `;
  }

  getTableHeaderHtml() {
    const arrowHtml = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    return this.headersConfig.map(({ id, title, sortable }) => {
      return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order>
          <span>${title}</span>
          
          ${sortable ? arrowHtml : ''}
        </div>
      `;
    }).join('');
  }

  getTableBodyHtml() {
    return this.data.map((rowData) => {
      const cells = this.headersConfig.map(({ id, template }) => {
        if (template) {
          return template(rowData[id]);
        }

        return `<div class="sortable-table__cell">${rowData[id]}</div>`;
      });

      return `
        <a href="/products/${rowData.id}" class="sortable-table__row">
          ${cells.join('')}
        </a>
      `;
    }).join('');
  }
}
