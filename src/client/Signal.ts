// A very simple, custom signal implementation
export default class Signal<T> {
  private value: T;
  private subscribers: Set<(value: T) => void> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  // Sets new value and runs notify to re-run all subscribers
  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.notify();
    }
  }

  // Adds subscriber functions to notify when new value is set
  subscribe(callback: (value: T) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Reruns all subscribers
  private notify(): void {
    this.subscribers.forEach((callback) => callback(this.value));
  }
}
