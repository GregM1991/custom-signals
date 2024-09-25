// Custom Signal implementation
class Signal<T> {
  private value: T;
  private subscribers: Set<(value: T) => void> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.notify();
    }
  }

  subscribe(callback: (value: T) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach((callback) => callback(this.value));
  }
}

// Counter app logic
const count = new Signal<number>(0);

function updateDisplay() {
  const countElement = document.getElementById("count");
  if (countElement) {
    countElement.textContent = count.get().toString();
  }
}

count.subscribe(updateDisplay);
console.log("Hello")
document.addEventListener("DOMContentLoaded", () => {
  const incrementButton = document.getElementById("increment");
  const decrementButton = document.getElementById("decrement");
  console.log("Hello")
  if (incrementButton) {
    console.log({incrementButton})
    incrementButton.addEventListener("click", () => {
      count.set(count.get() + 1);
    });
  }

  if (decrementButton) {
    decrementButton.addEventListener("click", () => {
      count.set(count.get() - 1);
    });
  }

  updateDisplay();
});
