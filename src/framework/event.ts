import * as _ from "lodash";

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
  on<U>(eventType: T, callback: EventCallback<U>, ctx?: string): EventBus<T>;
  off(ctx: string): void;
}

export class EventBusImpl<T = string> implements EventBus<T> {
  readonly _eventNames: [T, ...T[]];
  private _callbacks: { [key: string]: EventCallback<any>[] } = {};
  private _cbByContext: { [ctx: string]: EventCallback<any>[] } = {
    default: [],
  };

  constructor(...eventsNames: [T, ...T[]]) {
    this._eventNames = eventsNames;
    for (const eventType of this._eventNames) {
      this._callbacks[eventType as any] = [];
    }
  }

  on<U>(eventType: T, callback: EventCallback<U>, ctx = "default") {
    this.assertEventType(eventType);
    this._callbacks[eventType as any].push(callback);

    if (!this._cbByContext[ctx]) this._cbByContext[ctx] = [];
    this._cbByContext[ctx].push(callback);

    return this;
  }

  off(context: string) {
    if (!(context in this._cbByContext)) {
      return;
    }
    for (let cb of this._cbByContext[context]) {
      for (let evtType in this._callbacks) {
        let idx = this._callbacks[evtType].indexOf(cb);
        if (idx >= 0) {
          this._callbacks[evtType].splice(idx, 1);
        }
      }
    }
    delete this._cbByContext[context];
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
        `Invalid event type ${eventType}. expected one of ${this._eventNames}`
      );
    }
  }
}

class CompletableEvent {}

interface OrchestratorTransactionItem {
  data: any;
  target: string;
  duration: number;
  type: "pause" | "action" | "multi";
}
class OrchestratorTransaction {
  private _items: OrchestratorTransactionItem[] = [];

  constructor(
    private id: string,
    private orchestrator: ConsumerOrchestrator,
    private _register: (id: string, tx: OrchestratorTransaction) => void
  ) {}

  get items() {
    return [...this._items];
  }

  addItem(data: any, target = "root", duration = 1500) {
    this._items.push({ target, data, duration, type: "action" });
  }

  addPause(duration = 1500) {
    this._items.push({ target: "root", data: null, duration, type: "pause" });
  }

  addParallelItems(
    ...items: { target?: string; data: any; duration?: number }[]
  ) {
    this._items.push({
      type: "multi",
      target: "root",
      duration: Math.max(...items.map((i) => i.duration ?? 1500)),
      data: items.map((i) =>
        _.defaults(i, { target: "root", duration: 1500, type: "action" })
      ),
    });
  }

  build() {
    this._register(this.id, this);
    return this.orchestrator;
  }
}

interface Orchestrator {
  observe<T>(callback: (item: T) => void): void;
}

class DelegateOrchestrator implements Orchestrator {
  constructor(private name: string, private parent: ConsumerOrchestrator) {}

  observe<T>(callback: (item: T) => void): void {}
}

class ConsumerOrchestrator implements Orchestrator {
  private _allOrchestrators: { [key: string]: Orchestrator } = {
    root: this,
  };
  private _txList: { [key: string]: OrchestratorTransaction } = {};

  constructor(private name = "root") {}

  createTxId() {
    return _.uniqueId();
  }

  observe<T>(callback: (item: T) => void): void {}

  newTransaction(id = this.createTxId()) {
    return new OrchestratorTransaction(id, this, (id, tx) => {
      this._txList[id] = tx;
    });
  }

  start(
    id: string,
    options: { once?: boolean; delayBefore?: number; delayAfter?: number } = {}
  ) {
    if (!(id in this._txList)) {
      throw new Error("Invalid tx id " + id);
    }
    const tx = this._txList[id];

    const opts = _.defaults(options, {
      once: true,
      delayBefore: 0,
      delayAfter: 0,
    });

    if (opts.once) {
      delete this._txList[id];
    }

    let cursor = opts.delayBefore;
    for (let item of tx.items) {
      setTimeout(() => this.execute(item), cursor);
      cursor += item.duration;
    }

    cursor += opts.delayAfter;
    return new Promise((resolve) => {
      setTimeout(resolve, cursor);
    });
  }

  private execute(item: OrchestratorTransactionItem) {
    try {
      switch (item.type) {
        case "action":
          break;
        case "pause":
          break;
        case "multi":
          break;
        default:
          throw new Error("Invalid type " + item.type);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
