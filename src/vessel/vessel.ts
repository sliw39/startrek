import { HexaCoord, O } from "./hexagon";
import _ from "lodash";

export type PartType = "energy" | "defense" | "command" | "science" | "life" | "engineering";
export type PartState = "ONLINE" | "OFFLINE" | "DAMAGED" | "DESTROYED";

export type StateListener = (newState: PartState, oldState: PartState, part: Part) => void;
export type ValueListener = (newState: number, oldState: number, part: Part) => void;
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
    }
}

export interface VesselDesc {
    name?: string;
    designation: string;
    class: string;
    faction: string;
}

export class Vessel implements HexaGrid, VesselDesc {
    _uid: string|null = null;
    name: string = "";
    designation: string = "";
    class: string = "";
    faction: string = "";

    private grid: {[key: string]: Part} = {}
    readonly cells: Part[] = [];

    get rect() {
        let result = { origin: O, width: 0, height: 0 }
        if(this.cells.length !== 0) {
            let coords = this.cells.map(c => c.position.grid);
            result.height = Math.max(...coords.map(c => c.y));
            result.width = Math.max(...coords.map(c => c.x))
        }
        return result;
    }

    addCell(cell: Part) {
        if(!this.grid[cell.position.diag.hash]) {
            this.cells.push(cell);
        }
        this.grid[cell.position.diag.hash] = cell;
    }

    installAllBehaviors() {
        for(let cell of this.cells) {
            for(let behavior of cell.behaviors) {
                behavior.install(cell);
            }
        }
    }

    get(coordinates: HexaCoord) {
        return this.grid[coordinates.diag.hash];
    }

    removeCell(cell: Part) {
        delete this.grid[cell.position.diag.hash];
        this.cells.splice(this.cells.map(c => c.position.grid.hash).indexOf(cell.position.grid.hash), 1);
    }

    energyBalance(): EnergyBalance {
        const onlineCells = this.cells.filter(part => ["ONLINE", "DAMAGED"].indexOf(part.state) !== -1);
        const energyCells = onlineCells.filter(part => part instanceof EnergyPart) as EnergyPart[];
        let eb: EnergyBalance = {
            consumed: onlineCells.reduce((value, part) => value + part.value, 0),
            produced: energyCells.reduce((value, part) => value + part.energy, 0),
            stock: energyCells.reduce((value, part) => value + part.stock, 0),
            currentStock: energyCells.reduce((value, part) => value + part.currentStock, 0),
            balance: 0
        }
        eb.balance = eb.produced - eb.consumed;
        return eb;
    }
}

export abstract class Part {
    state: PartState = "ONLINE";
    currentValue: number;
    type?: PartType;

    protected _parent?: HexaGrid;
    private stateListeners: StateListener[] = [];
    private damageListeners: ValueListener[] = [];
    private repairListeners: ValueListener[] = [];

    constructor(
        public readonly position: HexaCoord, 
        public readonly name: string, 
        public readonly value: number,
        public readonly behaviors: Behavior[] = []) {
            this.currentValue = value;
        }

    get parent() {
        return this._parent;
    }

    attachParent(parent: HexaGrid) {
        this._parent = parent;
    }

    abstract newInstance(coord: HexaCoord): Part;

    onStateChanged(callback: StateListener) {
        this.stateListeners.push(callback);
    }
    onDamage(callback: ValueListener) {
        this.damageListeners.push(callback);
    }
    onRepair(callback: ValueListener) {
        this.repairListeners.push(callback);
    }

    damage(amount: number, propagate = true) {
        if(amount < 0) {
            throw "Damage amount must be positive";
        }

        const oldState = this.state;
        const oldValue = this.currentValue;

        this.currentValue -= amount;
        if(this.currentValue == 0) {
            this.state = "OFFLINE";
        } else if(this.currentValue < 0) {
            this.state = "DESTROYED";
            this.currentValue = 0;
        } else if(amount > 0) {
            this.state = "DAMAGED";
        }

        if(propagate && oldState !== this.state) {
            for(const cb of this.stateListeners) {
                cb(this.state, oldState, this);
            }
        }
        if(propagate && oldValue !== this.currentValue) {
            for(const cb of this.damageListeners) {
                cb(this.currentValue, oldValue, this);
            }
        }

    }

    repair(amount: number, propagate = true) {
        if(amount < 0) {
            throw "Repair amount must be positive";
        }

        const oldState = this.state;
        const oldValue = this.currentValue;

        this.currentValue += amount;
        if(this.currentValue >= this.value) {
            this.currentValue = this.value;
            this.state = "ONLINE";
        } else if (this.currentValue > 0) {
            this.state = "DAMAGED";
        }

        if(propagate && oldState !== this.state) {
            for(const cb of this.stateListeners) {
                cb(this.state, oldState, this);
            }
        }
        if(propagate && oldValue !== this.currentValue) {
            for(const cb of this.repairListeners) {
                cb(this.currentValue, oldValue, this);
            }
        }
    }
}

export class EnergyPart extends Part {
    stock = 0;
    currentStock = 0;
    energy = 0;

    constructor(position: HexaCoord, name: string, value: number, behaviors: Behavior[] = []) {
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

    constructor(position: HexaCoord, name: string, value: number, behaviors: Behavior[] = []) {
        super(position, name, value, behaviors);
        this.type = "defense";
    }

    onFire(callback: FireListener) {
        this.fireListeners.push(callback);
    }

    fire(dryrun: boolean, propagate = true) {
        if(!dryrun && propagate) {
            for(const cb of this.fireListeners) {
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
    constructor(position: HexaCoord, name: string, value: number, behaviors: Behavior[] = []) {
        super(position, name, value, behaviors);
        this.type = "command";
    }

    newInstance(coord: HexaCoord): Part {
        return new CommandPart(coord, this.name, this.value, this.behaviors);
    }
}

export class SciencePart extends Part {
    constructor(position: HexaCoord, name: string, value: number, behaviors: Behavior[] = []) {
        super(position, name, value, behaviors);
        this.type = "science";
    }

    newInstance(coord: HexaCoord): Part {
        return new SciencePart(coord, this.name, this.value, this.behaviors);
    }
}

export class LifePart extends Part {
    constructor(position: HexaCoord, name: string, value: number, behaviors: Behavior[] = []) {
        super(position, name, value, behaviors);
        this.type = "life";
    }

    newInstance(coord: HexaCoord): Part {
        return new LifePart(coord, this.name, this.value, this.behaviors);
    }
}

export class EngineeringPart extends Part {
    constructor(position: HexaCoord, name: string, value: number, behaviors: Behavior[] = []) {
        super(position, name, value, behaviors);
        this.type = "engineering";
    }

    newInstance(coord: HexaCoord): Part {
        return new EngineeringPart(coord, this.name, this.value, this.behaviors);
    }
}