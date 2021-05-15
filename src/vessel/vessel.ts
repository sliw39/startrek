import { HexaCoord, O } from "./hexagon";
import _ from "lodash";
import { EventBus, EventBusImpl } from "../framework/event";

export type PartType =
  | "energy"
  | "defense"
  | "command"
  | "science"
  | "life"
  | "engineering";
export type PartState = "ONLINE" | "OFFLINE" | "DAMAGED" | "DESTROYED";

export type StateListener = (
  newState: PartState,
  oldState: PartState,
  part: Part
) => void;
export type ValueListener = (
  newState: number,
  oldState: number,
  part: Part
) => void;
export type FireListener = (value: number, part: Part) => void;

export interface EnergyBalance {
  consumed: number;
  produced: number;
  balance: number;
  stock: number;
  currentStock: number;
}

export interface PartDesc {
  name: string;
  type: PartType;
  value: number;
  behaviors: string[];
  [key: string]: any;
}

export interface Behavior {
  name: string;
  install(part: Part): void;
}

export interface HexaGrid {
  get(position: HexaCoord): Part;
  rect: {
    origin: HexaCoord;
    width: number;
    height: number;
  };
}

export interface VesselDesc {
  name?: string;
  designation: string;
  class: string;
  faction: string;
}

export function isRunning(part: Part) {
  return part.state !== "DESTROYED" && part.state !== "OFFLINE";
}

export function ifRunning(part: Part, consumer: () => void) {
  if (isRunning(part)) {
    consumer();
  }
}

export class Vessel implements HexaGrid, VesselDesc {
  _uid: string | null = null;
  name: string = "";
  designation: string = "";
  class: string = "";
  faction: string = "";

  private grid: { [key: string]: Part } = {};
  readonly cells: Part[] = [];

  get rect() {
    let result = { origin: O, width: 0, height: 0 };
    if (this.cells.length !== 0) {
      let coords = this.cells.map((c) => c.position.grid);
      result.height = Math.max(...coords.map((c) => c.y));
      result.width = Math.max(...coords.map((c) => c.x));
    }
    return result;
  }

  addCell(cell: Part) {
    if (!this.grid[cell.position.diag.hash]) {
      this.cells.push(cell);
    }
    this.grid[cell.position.diag.hash] = cell;
  }

  installAllBehaviors() {
    for (let cell of this.cells) {
      for (let behavior of cell.behaviors) {
        behavior.install(cell);
      }
    }
  }

  repairAll() {
    for (let cell of this.cells) {
      cell.state = "ONLINE";
      cell.currentValue = cell.value;
    }
  }

  get(coordinates: HexaCoord) {
    return this.grid[coordinates.diag.hash];
  }

  removeCell(cell: Part) {
    delete this.grid[cell.position.diag.hash];
    this.cells.splice(
      this.cells
        .map((c) => c.position.grid.hash)
        .indexOf(cell.position.grid.hash),
      1
    );
  }

  energyBalance(): EnergyBalance {
    const onlineCells = this.cells.filter(
      (part) => ["ONLINE", "DAMAGED"].indexOf(part.state) !== -1
    );
    const energyCells = onlineCells.filter(
      (part) => part instanceof EnergyPart
    ) as EnergyPart[];
    let eb: EnergyBalance = {
      consumed: onlineCells.reduce((value, part) => value + part.value, 0),
      produced: energyCells.reduce((value, part) => value + part.energy, 0),
      stock: energyCells.reduce((value, part) => value + part.stock, 0),
      currentStock: energyCells.reduce(
        (value, part) => value + part.currentStock,
        0
      ),
      balance: 0,
    };
    eb.balance = eb.produced - eb.consumed;
    return eb;
  }

  isKo() {
    let bridge = this.cells.find((c) => /.*passerelle.*/.test(c.name));
    let bridgeOk = bridge && isRunning(bridge);

    let hasAtk =
      this.cells.filter((c) => c instanceof DefensePart && c.purpose !== "DEF")
        .length > 0;

    return !bridgeOk || !hasAtk;
  }
}

export type PartEvents =
  | "beforeDamage"
  | "afterDamage"
  | "beforeRepair"
  | "afterRepair"
  | "beforeDefine"
  | "afterDefine"
  | "beforeStateChange"
  | "afterStateChange";
export interface StateChangeEvent {
  state: PartState;
  oldState: PartState;
  part: Part;
}
export interface ValueChangeEvent {
  value: number;
  oldValue: number;
  part: Part;
}
export abstract class Part {
  state: PartState = "ONLINE";
  currentValue: number;
  type?: PartType;

  protected _parent?: HexaGrid;
  private _eventBus = new EventBusImpl<PartEvents>(
    "beforeDamage",
    "afterDamage",
    "beforeRepair",
    "afterRepair",
    "beforeDefine",
    "afterDefine",
    "beforeStateChange",
    "afterStateChange"
  );

  constructor(
    public readonly position: HexaCoord,
    public readonly name: string,
    public readonly value: number,
    public readonly behaviors: Behavior[] = []
  ) {
    this.currentValue = value;
  }

  get parent() {
    return this._parent;
  }
  get event(): EventBus<PartEvents> {
    return this._eventBus;
  }

  attachParent(parent: HexaGrid) {
    this._parent = parent;
  }

  abstract newInstance(coord: HexaCoord): Part;

  damage(amount: number, propagate = true) {
    this.modify(amount, "Damage", () => {
      let state = this.state;
      let value = this.currentValue;

      value -= amount;
      if (value === 0) {
        state = "OFFLINE";
      } else if (value < 0) {
        state = "DESTROYED";
        value = 0;
      } else if (amount > 0) {
        state = "DAMAGED";
      } else {
        return null;
      }
      return { value, state };
    });
  }

  repair(amount: number) {
    this.modify(amount, "Repair", () => {
      let state = this.state;
      let value = this.currentValue;

      value += amount;
      if (this.currentValue >= this.value) {
        value = this.value;
        state = "ONLINE";
      } else if (value > 0) {
        state = "DAMAGED";
      } else {
        return null;
      }
      return { value, state };
    });
  }

  define(amount: number) {
    this.modify(amount, "Define", () => {
      let state = this.state;
      let value = this.currentValue;

      if (amount <= 0) {
        state = "DESTROYED";
        value = 0;
      } else if (amount >= this.value) {
        state = this.state === "OFFLINE" ? "OFFLINE" : "ONLINE";
        value = this.value;
      } else {
        state = this.state === "OFFLINE" ? "OFFLINE" : "DAMAGED";
        value = amount;
      }
      return { value, state };
    });
  }

  private modify(
    amount: number,
    eventName: "Repair" | "Damage" | "Define",
    modifierFn: () => { value: number; state: PartState } | null
  ) {
    if (amount < 0) {
      throw "Amount amount must be positive";
    }

    const oldState = this.state;
    const oldValue = this.currentValue;
    const res = modifierFn();
    if (!res) {
      return;
    }

    const { state, value } = res;
    let stateEvent = this._eventBus.trigger<StateChangeEvent>(
      "beforeStateChange",
      { state, oldState, part: this }
    );
    let valueEvent = this._eventBus.trigger<ValueChangeEvent>(
      ("before" + eventName) as any,
      { value, oldValue, part: this }
    );

    if (!stateEvent.stopped) {
      this.state = stateEvent.data?.state ?? this.state;
      this._eventBus.forward<StateChangeEvent>(stateEvent, "afterStateChange", {
        state: this.state,
        oldState,
        part: this,
      });
    }

    if (!valueEvent.stopped) {
      this.currentValue = valueEvent.data?.value ?? this.currentValue;
      this._eventBus.forward<ValueChangeEvent>(
        valueEvent,
        ("after" + eventName) as any,
        { value: this.currentValue, oldValue, part: this }
      );
    }
  }
}

export class EnergyPart extends Part {
  stock = 0;
  currentStock = 0;
  energy = 0;

  constructor(
    position: HexaCoord,
    name: string,
    value: number,
    behaviors: Behavior[] = []
  ) {
    super(position, name, value, behaviors);
    this.type = "energy";
  }

  newInstance(coord: HexaCoord) {
    let part = new EnergyPart(coord, this.name, this.value, this.behaviors);
    part.stock = this.stock;
    part.energy = this.energy;
    return part;
  }
}

export class DefensePart extends Part {
  private fireListeners: FireListener[] = [];
  purpose: "ATK" | "DEF" | "BOTH" = "DEF";

  constructor(
    position: HexaCoord,
    name: string,
    value: number,
    behaviors: Behavior[] = []
  ) {
    super(position, name, value, behaviors);
    this.type = "defense";
  }

  onFire(callback: FireListener) {
    this.fireListeners.push(callback);
  }

  fire(dryrun: boolean, propagate = true) {
    if (!dryrun && propagate) {
      for (const cb of this.fireListeners) {
        cb(this.value, this);
      }
    }
    return this.value;
  }

  newInstance(coord: HexaCoord) {
    return new DefensePart(coord, this.name, this.value, this.behaviors);
  }
}

export class CommandPart extends Part {
  constructor(
    position: HexaCoord,
    name: string,
    value: number,
    behaviors: Behavior[] = []
  ) {
    super(position, name, value, behaviors);
    this.type = "command";
  }

  newInstance(coord: HexaCoord): Part {
    return new CommandPart(coord, this.name, this.value, this.behaviors);
  }
}

export class SciencePart extends Part {
  constructor(
    position: HexaCoord,
    name: string,
    value: number,
    behaviors: Behavior[] = []
  ) {
    super(position, name, value, behaviors);
    this.type = "science";
  }

  newInstance(coord: HexaCoord): Part {
    return new SciencePart(coord, this.name, this.value, this.behaviors);
  }
}

export class LifePart extends Part {
  constructor(
    position: HexaCoord,
    name: string,
    value: number,
    behaviors: Behavior[] = []
  ) {
    super(position, name, value, behaviors);
    this.type = "life";
  }

  newInstance(coord: HexaCoord): Part {
    return new LifePart(coord, this.name, this.value, this.behaviors);
  }
}

export class EngineeringPart extends Part {
  constructor(
    position: HexaCoord,
    name: string,
    value: number,
    behaviors: Behavior[] = []
  ) {
    super(position, name, value, behaviors);
    this.type = "engineering";
  }

  newInstance(coord: HexaCoord): Part {
    return new EngineeringPart(coord, this.name, this.value, this.behaviors);
  }
}
