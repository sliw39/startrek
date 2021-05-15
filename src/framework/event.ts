export class TrekEvent<T> {
  private _stop = false;
  private _stopImmediate = false;
  private _ttl = 0;
  private _origin: TrekEvent<T> | null = null;
  private _detached = false;

  constructor(public readonly eventType: string, public data: T) {}

  get ttl() {
    return this._ttl;
  }
  get stopped() {
    return this._stop;
  }
  get stoppedImmediate() {
    return this._stopImmediate;
  }
  get origin(): TrekEvent<T> | null {
    return this._origin;
  }
  get detached() {
    return this._detached;
  }

  stop() {
    this.stopImmediate();
    this._stop = true;
  }

  stopImmediate() {
    this._stopImmediate = true;
  }

  propagate() {
    this._ttl++;
    if (this._origin && !this._detached) {
      this._origin.propagate();
    }
    return this;
  }

  fork<U>(eventType: string, data: U, detached = false) {
    const evt = new TrekEvent<U>(eventType, data);
    evt._detached = detached;
    evt._origin = this as any;
    this.propagate();
    return evt;
  }
}

export type EventCallback<U> = (evt: TrekEvent<U>) => boolean | void;
export interface EventBus<T = string> {
  on<U>(eventType: T, callback: EventCallback<U>): EventBus<T>;
}

export class EventBusImpl<T = string> implements EventBus<T> {
  readonly _eventNames: [T, ...T[]];
  _callbacks: { [key: string]: EventCallback<any>[] } = {};

  constructor(...eventsNames: [T, ...T[]]) {
    this._eventNames = eventsNames;
    for (const eventType of this._eventNames) {
      this._callbacks[eventType as any] = [];
    }
  }

  on<U>(eventType: T, callback: EventCallback<U>) {
    this.assertEventType(eventType);
    this._callbacks[eventType as any].push(callback);
    return this;
  }

  trigger<U>(eventType: T, data: U) {
    this.assertEventType(eventType);

    const event = new TrekEvent<U>(eventType as any, data);
    for (const cb of this._callbacks[eventType as any]) {
      let result = cb(event.propagate());
      if ((typeof result === "boolean" && !result) || event.stoppedImmediate) {
        break;
      }
    }

    return event;
  }

  forward<U>(event: TrekEvent<any>, eventType: T, data: U, detached = false) {
    this.assertEventType(eventType);
    if (event.stopped) {
      throw new Error("Cannot forward stopped event");
    }

    const evt = event.fork<U>(eventType as any, data, detached);
    for (const cb of this._callbacks[eventType as any]) {
      let result = cb(evt.propagate());
      if ((typeof result === "boolean" && !result) || event.stoppedImmediate) {
        break;
      }
    }

    return evt;
  }

  private assertEventType(eventType: T) {
    if (this._eventNames.indexOf(eventType) === -1) {
      throw new Error(
        `Invalid event type ${event}. expected one of ${this._eventNames}`
      );
    }
  }
}
