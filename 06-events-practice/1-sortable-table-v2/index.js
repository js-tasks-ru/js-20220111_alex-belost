export default class SortableTable {
  element = null;
  subElements = {};
  headerElementsMap = {};
  sorted = {};

  sortDirection = true;

  orderMap = new Map([
    [ 'asc', 1 ],
    [ 'desc', -1 ],
    [ true, 'asc' ],
    [ false, 'desc' ],
  ]);

  constructor(headersConfig, {
    data = [], sorted = {},
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.sortDirection = this.orderMap.get(sorted.order) === 1;

    this.render();
    this.updateData();
  }

  render() {
    this.element = this.getHostElement();
    this.subElements = this.getElementsMap(this.element, 'element');
    this.headerElementsMap = this.getHeaderElementsMap();

    this.initListeners();
  }

  destroy() {
    if (!this.element) {
      return;
    }

    this.subElements.header.removeEventListener('click', this.onSort.bind(this));

    this.element.remove();
    this.element = null;
    this.data = [];
    this.headersConfig = [];
    this.subElements = {};
    this.headerElements = {};
  }

  onSort(event) {
    const sortableElement = event.target.closest('[data-id]');
    const id = sortableElement.dataset.id;
    const { config: { sortable } } = this.headerElementsMap[ id ];

    if (!sortable) {
      return;
    }

    this.sortDirection = !this.sortDirection;

    const order = this.orderMap.get(this.sortDirection);

    this.sorted = { id, order };
    this.updateData();
  }

  initListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSort.bind(this));
  }

  getStringSortFn() {
    const { id, order } = this.sorted;

    return (a, b) => {
      return this.orderMap.get(order) * a[ id ].localeCompare(b[ id ], [ 'ru', 'en' ], { caseFirst: 'upper' });
    };
  }

  getNumberSortFn() {
    const { id, order } = this.sorted;

    return (a, b) => this.orderMap.get(order) * (a[ id ] - b[ id ]);
  }

  updateData() {
    const { id, order } = this.sorted;
    const { element, config } = this.headerElementsMap[ id ];

    const sortTypeFnMap = {
      'string': this.getStringSortFn(),
      'number': this.getNumberSortFn(),
    };

    Object.values(this.headerElementsMap).forEach(({ element }) => element.dataset.order = '');

    element.dataset.order = order;

    this.data = this.data.sort(sortTypeFnMap[ config.sortType ]);
    this.subElements.body.innerHTML = this.getBodyContent();
  }

  getHeaderElementsMap() {
    const entries = Array.from(this.subElements.header.children, (element) => {
      const elementId = element.dataset.id;
      const config = this.headersConfig.find((headersItem) => elementId === headersItem.id);

      return [ elementId, { element, config } ];
    });

    return Object.fromEntries(entries);
  }

  getHostElement() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    return wrapper.firstElementChild;
  }

  getElementsMap(target, dataset) {
    const entries = Array.from(
        target.querySelectorAll(`[data-${dataset}]`),
        (element) => [ element.dataset[ dataset ], element ],
    );

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
    const cellList = this.headersConfig.map((cellData) => this.getHeaderCellTemplate(cellData));

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
    const cellList = this.headersConfig.map(({ id, template = this.getBodyCellTemplate }) => template(rowData[ id ]));

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
