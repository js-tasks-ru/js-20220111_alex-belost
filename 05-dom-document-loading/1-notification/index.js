const DEFAULT_CONFIG = {
  duration: 3000,
  type: 'success',
};

export default class NotificationMessage {
  static element = null;
  static timeoutIndex = null;

  element = null;

  constructor(message = '', { type, duration } = DEFAULT_CONFIG) {
    this.message = message;
    this.type = type;
    this.duration = duration;

    this.createElement();
  }

  show(target) {
    this.removeElementHandler();
    this.appendElementHandler(target);
  }

  remove() {
    NotificationMessage.element.remove();
    NotificationMessage.element = null;
  }

  removeElementHandler() {
    if (!NotificationMessage.element) {
      return;
    }

    this.remove();

    clearTimeout(NotificationMessage.timeoutIndex);
    NotificationMessage.timeoutIndex = null;
  }

  appendElementHandler(target = document.body) {
    NotificationMessage.element = this.element;
    target.append(NotificationMessage.element);

    NotificationMessage.timeoutIndex = setTimeout(() => {
      this.remove();
      NotificationMessage.timeoutIndex = null;
    }, this.duration);
  }

  destroy() {
    this.element = null;
    this.timeoutIndex = null;
  }

  createElement() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:20s">
        <div class="timer"></div>
        
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }
}
