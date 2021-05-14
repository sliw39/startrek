export class TrekEvent<T> {
    #stop = false;
    #stopImmediate = false;
    #ttl = 0;
    #origin: TrekEvent<T> | null = null; 
    #detached = false;

    constructor(public readonly eventType: string, public data: T) {}

    get ttl() { return this.#ttl }
    get stopped() { return this.#stop }
    get stoppedImmediate() { return this.#stopImmediate }
    get origin(): TrekEvent<T> | null { return this.#origin }
    get detached() { return this.#detached }

    stop() {
        this.stopImmediate();
        this.#stop = true;
    }

    stopImmediate() {
        this.#stopImmediate = true;
    }

    propagate() {
        this.#ttl++;
        if(this.#origin && !this.#detached) {
            this.#origin.propagate();
        }
        return this;
    }

    fork<U>(eventType: string, data: U, detached = false) {
        const evt = new TrekEvent<U>(eventType, data);
        evt.#detached = detached;
        evt.#origin = this as any;
        this.propagate();
        return evt;
    }
}

export type EventCallback<U> = (evt: TrekEvent<U>) => boolean | void;
export interface EventBus<T = string> {
    on<U>(eventType: T, callback: EventCallback<U>): EventBus<T>;
}

export class EventBusImpl<T = string> implements EventBus<T> {
    readonly #eventNames: [T, ...T[]];
    #callbacks: {[key: string]: EventCallback<any>[]} = {};

    constructor(...eventsNames: [T, ...T[]]) {
        this.#eventNames = eventsNames;
        for(const eventType of this.#eventNames) {
            this.#callbacks[eventType as any] = [];
        }
    }

    on<U>(eventType: T, callback: EventCallback<U>) {
        this.assertEventType(eventType);
        this.#callbacks[eventType as any].push(callback);
        return this;
    }

    trigger<U>(eventType: T, data: U) {
        this.assertEventType(eventType);
        
        const event = new TrekEvent<U>(eventType as any, data);
        for(const cb of this.#callbacks[eventType as any]) {
            let result = cb(event.propagate());
            if(typeof result === "boolean" && !result || event.stoppedImmediate) {
                break;
            }
        }

        return event;
    }

    forward<U>(event: TrekEvent<any>, eventType: T, data: U, detached = false) {
        this.assertEventType(eventType);
        if(event.stopped) {
            throw new Error("Cannot forward stopped event");
        }
        
        const evt = event.fork<U>(eventType as any, data, detached);
        for(const cb of this.#callbacks[eventType as any]) {
            let result = cb(evt.propagate());
            if(typeof result === "boolean" && !result || event.stoppedImmediate) {
                break;
            }
        }

        return evt;
    }

    private assertEventType(eventType: T) {
        if(this.#eventNames.indexOf(eventType) === -1) {
            throw new Error(`Invalid event type ${event}. expected one of ${this.#eventNames}`);
        }
    }
}
