import { Events, Listener } from './types';

export class EventEmitter {
  private readonly events: Events = {};

  private wildcardEvents: string[] = [];

  private makeWildcardEvents() {
    const newWildCardEvents = [];

    Object.keys(this.events).forEach((event: string) => {
      if (event.endsWith('*') && this.events[event] && this.events[event].length > 0) {
        newWildCardEvents.push(event);
      }
    });

    this.wildcardEvents = newWildCardEvents;
  }

  public on(event: string, listener: Listener): () => void {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = [];
    }

    this.events[event].push(listener);
    this.makeWildcardEvents();
    return () => this.removeListener(event, listener);
  }

  public removeListener(event: string, listener: Listener): void {
    if (typeof this.events[event] !== 'object') {
      return;
    }

    const idx: number = this.events[event].indexOf(listener);
    if (idx > -1) {
      this.events[event].splice(idx, 1);
    }
    this.makeWildcardEvents();
  }

  public removeAllListeners(): void {
    Object.keys(this.events).forEach((event: string) =>
      this.events[event].splice(0, this.events[event].length)
    );
    this.makeWildcardEvents();
  }

  public emit(event: string, ...args: any[]): void {
    if (typeof this.events[event] === 'object') {
      [...this.events[event]].forEach((listener) => listener.apply(this, args));
    }

    if (event !== '*') {
      this.emit('*', ...args);
    }

    for (const rawWcEvent of this.wildcardEvents) {
      const wcEvent = rawWcEvent.slice(0, rawWcEvent.endsWith('.*') ? -2 : -1);
      if (!event.endsWith('*') && event !== wcEvent && event.startsWith(wcEvent)) {
        this.emit(rawWcEvent, event);
      }
    }
  }

  public once(event: string, listener: Listener): () => void {
    const remove: (() => void) = this.on(event, (...args: any[]) => {
      remove();
      listener.apply(this, args);
      this.makeWildcardEvents();
    });

    return remove;
  }
}
