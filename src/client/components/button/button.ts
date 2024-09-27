class XButton extends HTMLElement {
	private button: HTMLButtonElement

	constructor() {
		super()
		this.button = document.createElement('button')
		this.button.setAttribute('part', 'button')
		while (this.firstChild) {
			this.button.appendChild(this.firstChild)
		}
		this.appendChild(this.button)
	}

	connectedCallback() {
		this.update()
	}

	static get observedAttributes() {
		return ['size', 'variant', 'disabled']
	}

	attributeChangedCallback() {
		this.update()
	}

	update() {
		this.button.disabled = this.hasAttribute('disabled')

		// Forward other relevant attributes
		;['name', 'value', 'type'].forEach(attr => {
			if (this.hasAttribute(attr)) {
				this.button.setAttribute(attr, this.getAttribute(attr)!)
			} else {
				this.button.removeAttribute(attr)
			}
		})
	}
}

export function registerButtonComponent() {
	customElements.define('x-button', XButton)
}
