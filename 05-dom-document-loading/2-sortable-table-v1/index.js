const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
};

const SORTABLE_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
};

const COMPARE_OPTIONS = { caseFirst: 'upper' };

const LOCALITIES = ['ru', 'en'];

export default class SortableTable {
  element = null;
  subElements = {};
  headerElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  render() {
    this.element = this.getHostElement();
    this.subElements = this.getElementsMap(this.element, 'element');
    this.headerElements = this.getElementsMap(this.subElements.header, 'id');
  }

  destroy() {
    if (!this.element) {
      return;
    }

    this.element.remove();
    this.element = null;
    this.data = [];
    this.headerConfig = [];
    this.subElements = {};
    this.headerElements = {};
  }

  sort(field, order) {
    if (!this.element) {
      return;
    }

    const sortingFnMaps = {
      [SORT_ORDERS.ASC]: {
        [SORTABLE_TYPES.STRING]: (a, b) => (a[field].localeCompare(b[field], LOCALITIES, COMPARE_OPTIONS)),
        [SORTABLE_TYPES.NUMBER]: (a, b) => (a[field] - b[field]),
      },
      [SORT_ORDERS.DESC]: {
        [SORTABLE_TYPES.STRING]: (a, b) => (b[field].localeCompare(a[field], LOCALITIES, COMPARE_OPTIONS)),
        [SORTABLE_TYPES.NUMBER]: (a, b) => (b[field] - a[field]),
      },
    };

    const headerConfigItem = this.headerConfig.find(({ id }) => (id === field));

    Object.values(this.headerElements).forEach(({ dataset }) => (dataset.order = ''));

    this.headerElements[field].dataset.order = order;
    this.data = this.data.sort(sortingFnMaps[order][headerConfigItem.sortType]);

    this.subElements.body.innerHTML = this.getBodyContent();
  }

  getHostElement() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    return wrapper.firstElementChild;
  }

  getElementsMap(target, dataset) {
    const entries = Array.from(target.querySelectorAll(`[data-${dataset}]`), (element) => {
      return [element.dataset[dataset], element];
    });

    return Object.fromEntries(entries);
  }

  getTemplate() {
    return `
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaderContent()}
        </div>
    
        <div data-element="body" class="sortable-table__body">
          ${this.getBodyContent()}
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

  getHeaderContent() {
    const cellList = this.headerConfig.map((cellData) => this.getHeaderCellTemplate(cellData));

    return cellList.join('');
  }

  getBodyContent() {
    return this.data.map((rowData) => {
      return this.getBodyRowTemplate(rowData);
    }).join('');
  }

  getHeaderCellTemplate({ id, title, sortable } = {}) {
    const arrowTemplate = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order>
        <span>${title}</span>
        
        ${sortable ? arrowTemplate : ''}
      </div>
    `;
  }

  getBodyRowTemplate(rowData) {
    const cellList = this.headerConfig.map(({ id, template = this.getBodyCellTemplate }) => template(rowData[id]));

    return `
      <a href="/products/${rowData.id}" class="sortable-table__row">
        ${cellList.join('')}
      </a>
    `;
  }

  getBodyCellTemplate(data) {
    return `<div class="sortable-table__cell">${data}</div>`;
  }
}

