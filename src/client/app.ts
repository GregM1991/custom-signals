import { registerButtonComponent } from './components/button/button'
import Signal from './Signal'

const count = new Signal(0)

// A function to update our html ~~ It's pretty tied in to the count but that's
// fine given this is a fun test
function updateDisplay() {
	const countElement = document.getElementById('count')
	if (countElement) {
		countElement.textContent = count.get().toString()
	}
}

// We add an update display subscription to our count signal, so that when the
// value is changed, the function will be notified, and re-run, updating the html
count.subscribe(updateDisplay)

// App init
console.log('App initialized')

document.addEventListener('DOMContentLoaded', () => {
	const incrementButton = document.getElementById('increment')
	const decrementButton = document.getElementById('decrement')

	console.log('DOM fully loaded')

	if (incrementButton) {
		incrementButton.addEventListener('click', () => {
			count.set(count.get() + 1)
		})
	}

	if (decrementButton) {
		decrementButton.addEventListener('click', () => {
			count.set(count.get() - 1)
		})
	}

	registerButtonComponent()
	updateDisplay()
})
