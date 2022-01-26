const DEFAULT_CONFIG = {
  duration: 3000,
  type: 'success',
};

export default class NotificationMessage {
  timeoutIndex = null;
  element = null;

  constructor(message = '', { type, duration } = DEFAULT_CONFIG) {
    this.message = message;
    this.type = type;
    this.duration = duration;

    this.createElement();
  }

  show(target) {
    const targetElement = target || document.body;
    const existNotificationElement = document.querySelector('.notification');

    if (existNotificationElement) {
      existNotificationElement.remove();

      clearTimeout(this.timeoutIndex);
      this.timeoutIndex = null;
    }

    targetElement.append(this.element);

    this.timeoutIndex = setTimeout(() => {
      this.remove();
      this.timeoutIndex = null;
    }, this.duration);
  }

  remove() {
    this.element.remove();
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
