class ButtonComponent extends HTMLElement {
  connectedCallback() {
    if (!this.querySelector('button')) {
        this.append(document.createElement('button'));
    }
    this.update();
}

  static get observedAttributes() {
      return ['src', 'alt'];
  }

  attributeChangedCallback() {
      this.update();
  }

  update() {
      const button = this.querySelector('img');
      if (button) {
        button.innerText = 'Button!!!'
      }
  }
}

export const registerButtonComponent = () => {
  customElements.define('x-button', ButtonComponent);
}