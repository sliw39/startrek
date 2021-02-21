import { IPoint, Point } from "../framework/geometry";
import _, { identity } from "lodash";

export const G = 6.67430*Math.pow(10,-11)
const PI = Math.PI


export interface Coordinate extends IPoint {
    x: number;
    y: number;
    unit: DistanceUnit;
    parent?: Coordinate;
    distanceToParent?: Distance;
}
export function coord(point: IPoint, unit: DistanceUnit = "al", parent?: Coordinate, distanceToParent?: Distance) {
    return {
        ...point,
        unit,
        parent,
        distanceToParent
    }
} 

export interface Instant {
    velocity: number;
    coordinates: Coordinate;
}

export abstract class PhysicalQuantity<UNIT extends string> {
    constructor(protected value: number, public unit: UNIT) {}

    protected static parse(data: any, clazz: any): PhysicalQuantity<any> {
        let groups = /(-?[0-9]+(\.[0-9]+)?(e-?[0-9]+)?)\s*(\w+)/g.exec(data);
        if(groups) {
            return new clazz(parseFloat(groups[0]), groups[groups.length-1] as any);
        } else {
            throw `invalid ${clazz.constructor.name} ${data}`;
        }
    }

    serialize(): string {
        return this.value + this.unit;
    }

    print() {
        return this.get() + this.unit;
    }

    abstract allUnits(): UNIT[];
    abstract newInstance(value: number, unit?: UNIT): PhysicalQuantity<UNIT>;
    abstract get(unit?: UNIT): number;
}

export type MassUnit = "g" | "kg" | "ton" | "kton" | "moon" | "earth" | "jupiter" | "sun";
export class Mass extends PhysicalQuantity<MassUnit> {
    private stdValue: number;
    private readonly exp: number;
    private static MOON_RAD = 7.347;
    private static EARTH_RAD = 5.972;
    private static JUP_RAD = 1.898;
    private static SUN_RAD = 1.989;
  
    static parse(data: string): Mass {
        return PhysicalQuantity.parse(data, Mass) as Mass;
    }

    static zero(unit: MassUnit = "kg") {
        return new Mass(0, unit);
    }

    static sun(factor = 1) {
        return new Mass(1*factor, "sun")
    }

    static earth(factor = 1) {
        return new Mass(1*factor, "earth")
    }

    static moon(factor = 1) {
        return new Mass(1*factor, "moon")
    }

    static jupiter(factor = 1) {
        return new Mass(1*factor, "jupiter")
    }

    constructor(value: number, unit: MassUnit = "kg") {
        super(value, unit);
        switch(unit) {
            case "g":
                this.stdValue = this.value;
                this.exp = -3;
                break;
            case "ton":
                this.stdValue = this.value;
                this.exp = 3;
                break;
            case "kton":
                this.stdValue = this.value;
                this.exp = 6;
                break;
            case "moon":
                this.stdValue = this.value * Mass.MOON_RAD;
                this.exp = 22;
                break;
            case "earth":
                this.stdValue = this.value * Mass.EARTH_RAD;
                this.exp = 24;
                break;
            case "jupiter":
                this.stdValue = this.value * Mass.JUP_RAD;
                this.exp = 27;
                break;
            case "sun":
                this.stdValue = this.value * Mass.SUN_RAD;
                this.exp = 30;
                break;
            default:
                this.stdValue = this.value;
                this.exp = 0;
        }
    }

    allUnits() {
        return ["g", "kg", "ton", "kton", "moon", "earth", "jupiter", "sun"] as MassUnit[];
    }

    get(unit: MassUnit = this.unit) {
        switch(unit) {
            case "g":
                return this.stdValue * Math.pow(10, this.exp + 3);
            case "ton":
                return this.stdValue * Math.pow(10, this.exp - 3);
            case "kton":
                return this.stdValue * Math.pow(10, this.exp - 6);
            case "moon":
                return (this.stdValue / Mass.MOON_RAD) * Math.pow(10, this.exp - 22);
            case "earth":
                return (this.stdValue / Mass.EARTH_RAD) * Math.pow(10, this.exp - 24);
            case "jupiter":
                return (this.stdValue / Mass.JUP_RAD) * Math.pow(10, this.exp - 27);
            case "sun":
                return (this.stdValue / Mass.SUN_RAD) * Math.pow(10, this.exp - 30);
            default:
                return this.stdValue * Math.pow(10, this.exp);
        }
    }

    add(mass: Mass|number, unit?: MassUnit) {
        if(typeof mass === "number") {
            mass = new Mass(mass, unit);
        }
        this.stdValue += mass.get("kg");
    }

    newInstance(value: number, unit?: MassUnit): Mass {
        return new Mass(value, unit);
    }

    get g() { return this.get("g"); }
    get kg() { return this.get("kg"); }
    get t() { return this.get("ton"); }
    get kt() { return this.get("kton"); }
    get moon() { return this.get("moon"); }
    get earth() { return this.get("earth"); }
    get jupiter() { return this.get("jupiter"); }
    get sun() { return this.get("sun"); }
}

export type DistanceUnit = "km" | "mkm" | "ua" | "al";
export class Distance extends PhysicalQuantity<DistanceUnit> {
    private stdValue: number;
    private readonly exp: number;
    private static UA_RAD = 1.496;
    private static AL_RAD = 9.5;

    static parse(data: string) {
        return PhysicalQuantity.parse(data, Distance) as Distance;
    }

    static zero(unit: DistanceUnit = "al") {
        return new Distance(0, unit);
    }

    static sunRadius(factor = 1) {
        return new Distance(.7 * factor, "mkm");
    }

    static fromCoordinates(c1: Coordinate, c2: Coordinate) {
        let ref = c2;
        if(c1.unit !== c2.unit) {
            ref = {
                unit: c1.unit,
                x: new Distance(c2.x, c2.unit).get(c1.unit),
                y: new Distance(c2.y, c2.unit).get(c1.unit)
            }
        }
        return new Distance(Math.abs(c2.x - c1.x) + Math.abs(c2.y - c1.y), c1.unit);
    }

    constructor(value: number, unit: DistanceUnit = "km") {
        super(value, unit);
        switch(unit) {
            case "mkm":
                this.stdValue = this.value;
                this.exp = 6;
                break;
            case "ua":
                this.stdValue = this.value * Distance.UA_RAD;
                this.exp = 8;
                break;
            case "al":
                this.stdValue = this.value * Distance.AL_RAD;
                this.exp = 12;
                break;
            default:
                this.stdValue = this.value;
                this.exp = 0;
        }
    }

    allUnits() {
        return ["km", "mkm", "ua", "al"] as DistanceUnit[]
    }

    get(unit: DistanceUnit = this.unit) {
        switch(unit) {
            case "mkm":
                return this.stdValue * Math.pow(10, this.exp - 6);
            case "ua":
                return (this.stdValue / Distance.UA_RAD) * Math.pow(10, this.exp - 8);
            case "al":
                return (this.stdValue / Distance.AL_RAD) * Math.pow(10, this.exp - 12);
            default:
                return this.stdValue * Math.pow(10, this.exp);
        }
    }

    add(dist: Distance|number, unit?: DistanceUnit) {
        if(typeof dist === "number") {
            dist = new Distance(dist, unit);
        }
        this.stdValue += dist.get("km");
    }

    newInstance(value: number, unit?: DistanceUnit): Distance {
        return new Distance(value, unit);
    }

    get km() { return this.get("km"); }
    get mkm() { return this.get("mkm"); }
    get ua() { return this.get("ua"); }
    get al() { return this.get("al"); }
}

export type TemperatureUnit = "K" | "C" | "F";
export class Temperature extends PhysicalQuantity<TemperatureUnit> {
    private stdValue: number;
    private static C_RAD = 273.15;
    private static F_RAD = 459.67;

    static parse(data: string) {
        return PhysicalQuantity.parse(data, Temperature) as Temperature;
    }

    static k(value: number) { return new Temperature(value, "K"); }
    static c(value: number) { return new Temperature(value, "C"); }
    static f(value: number) { return new Temperature(value, "F"); }

    static zero(unit: TemperatureUnit = "K") {
        return new Temperature(0, unit);
    }

    static sun() {
        return Temperature.k(5500);
    }

    constructor(value: number, unit: TemperatureUnit = "K") {
        super(value, unit);
        switch(unit) {
            case "K":
                this.stdValue = this.value;
                break;
            case "C":
                this.stdValue = this.value - Temperature.C_RAD;
                break;
            case "F":
                this.stdValue = this.value - Temperature.F_RAD;
                break;
        }
    }

    allUnits() {
        return ["K", "C", "F"] as TemperatureUnit[];
    }

    get(unit: TemperatureUnit = this.unit) {
        switch(unit) {
            case "K":
                return this.stdValue;
            case "C":
                return this.stdValue + Temperature.C_RAD;
            case "F":
                return this.stdValue + Temperature.F_RAD;
        }
    }

    newInstance(value: number, unit?: TemperatureUnit): Temperature {
        return new Temperature(value, unit);
    }

    get k() { return this.get("K"); }
    get c() { return this.get("C"); }
    get f() { return this.get("F"); }
}

export type TimeUnit = "ms" | "s" | "m" | "h" | "d" | "w" | "y";
export class Time extends PhysicalQuantity<TimeUnit> {
    private stdValue: number;

    static zero(unit: TimeUnit = "d") {
        return new Time(0, unit);
    }

    static parse(data: string) {
        return PhysicalQuantity.parse(data, Time) as Time;
    }

    constructor(value: number, unit: TimeUnit = "d") {
        super(value, unit);
        switch(unit) {
            case "ms":
                this.stdValue = this.value / 1000;
                break;
            case "s":
                this.stdValue = this.value;
                break;
            case "m":
                this.stdValue = this.value * 60;
                break;
            case "h":
                this.stdValue = this.value * 3600;
                break;
            case "d":
                this.stdValue = this.value * 3600 * 24;
                break;
            case "w":
                this.stdValue = this.value * 3600 * 24 * 7;
                break;
            case "y":
                this.stdValue = this.value * 3600 * 24 * 7 * 365;
                break;
        }
    }

    allUnits() {
        return ["ms", "s", "m", "h", "d", "w", "y"] as TimeUnit[]
    }

    get(unit: TimeUnit = this.unit) {
        switch(unit) {
            case "ms":
                return this.stdValue * 1000;
            case "s":
                return this.stdValue;
            case "m":
                return this.stdValue / 60;
            case "h":
                return this.stdValue / 3600;
            case "d":
                return this.stdValue / 24 / 3600;
            case "w":
                return this.stdValue / 7 / 24 / 3600;
            case "y":
                return this.stdValue / 365 / 7 / 24 / 3600;
        }
    }

    newInstance(value: number, unit?: TimeUnit): Time {
        return new Time(value, unit);
    }

    get ms() { return this.get("ms"); }
    get s() { return this.get("s"); }
    get m() { return this.get("m"); }
    get h() { return this.get("h"); }
    get d() { return this.get("d"); }
    get w() { return this.get("w"); }
    get y() { return this.get("y"); }
}

export class Appearance {
    static parse(data: any) {
        if(!data) { return undefined; }
        return new Appearance(data.brightness || 0, data.oclass, data.colors);
    }
    serialize() {
        return _.pickBy(Object.assign({}, this), _.identity);
    }

    constructor(public brightness: number, public oclass?: string, public colors: string[] = []) {}
}

export class PhysicalProperties {
    static parse(data: any) {
        return new PhysicalProperties(Distance.parse(data.radius), Mass.parse(data.mass), Temperature.parse(data.temperature));
    }
    serialize() {
        return _.pickBy({
            radius: this.radius?.serialize(),
            mass: this.mass?.serialize(),
            temperature: this.temperature?.serialize()
        }, _.identity);
    }

    constructor(public radius = Distance.zero("km"), public mass = Mass.zero("earth"), public temperature = Temperature.zero()) {}
}

export class OrbitalProperties {
    static parse(data: any) {
        if(!data) { return undefined; }
        return new OrbitalProperties(Distance.parse(data.semiMajorAxis) || Distance.zero("ua"), data.excentricity, Time.parse(data.period) || Time.zero("d"), data.tilt);
    }
    serialize() {
        return _.pickBy({
            semiMajorAxis: this.semiMajorAxis?.serialize(),
            excentricity: this.excentricity || 0,
            period: this.period?.serialize(),
            tilt: this.tilt || 0
        }, _.identity)
    }

    static origin() {
        return new OrbitalProperties(Distance.zero("ua"), 0, Time.zero(), 0);
    }

    constructor(
        public semiMajorAxis: Distance,
        public excentricity: number,
        public period: Time,
        public tilt: number
    ) {}

}

export class System {
    public _uid!: string;
    public readonly mass: Mass;
    public readonly temperature: number;
    public readonly brightness: number;

    static parse(data: any) {
        let objs: CelestialObject[] = []
        for(let obj of data.objects || []) {
            if(typeof obj === "string") {
                continue;
            }
            objs.push(obj instanceof CelestialObject ? obj : parseCelestrial(obj));
        }
        let system = new System(data.names || [], data.coordinate, objs);
        system._uid = data._uid;
        return system;
    }
    serialize() {
        let data: any[] = []
        for(let obj of this.objects) {
            data.push(obj.serialize());
        }
        return _.pickBy({
            _uid: this._uid,
            coordinate: _.pickBy(this.coordinate, _.identity),
            names: this.names,
            objects: data
        }, _.identity)
    }

    constructor(public names: string[], public coordinate: Coordinate, public objects: CelestialObject[]) {
        this.mass = new Mass(0);
        let temperatureSum = 0;
        this.brightness = 0
        for(let o of objects) {
            this.mass.add(o.physical.mass);
            temperatureSum += o.physical.temperature.k * o.appearance.brightness;
            this.brightness += o.appearance.brightness;
        }
        this.temperature = temperatureSum / this.brightness;
    }

    static defaultSystem() {
        return new System(["New Sys"], coord(Point.origin()), [ new Star(["Main Star"]) ]); 
    }
}

export class CelestialObject {
    public _uid!: string;
    public _parent!: string;
    constructor(public names: string[], public orbital = OrbitalProperties.origin(), public physical: PhysicalProperties, public appearance: Appearance) {}

    serialize() {
        return _.pickBy({
            _uid: this._uid,
            _type: this.constructor.name,
            _parent: this._parent,
            names: this.names,
            orbital: this.orbital?.serialize(),
            physical: this.physical?.serialize(),
            appearance: this.appearance?.serialize()
        }, _.identity)
    }
}

export class Star extends CelestialObject {
    constructor(names: string[], public physical = new PhysicalProperties(Distance.sunRadius(), Mass.sun(), Temperature.sun()), appearance = new Appearance(1), orbital = OrbitalProperties.origin()) { 
        super(names, orbital, physical, appearance); 
    }
}

export class Planet extends CelestialObject {
    constructor(names: string[], orbital: OrbitalProperties|undefined, public physical: PhysicalProperties, appearance: Appearance) {  super(names, orbital, physical, appearance); }
}

export class Moon extends CelestialObject {
    constructor(names: string[], orbital: OrbitalProperties|undefined, public physical: PhysicalProperties, appearance: Appearance) {  super(names, orbital, physical, appearance); }
}

export class Asteroid extends CelestialObject {
    constructor(names: string[], orbital: OrbitalProperties|undefined, public physical: PhysicalProperties, appearance: Appearance) {  super(names, orbital, physical, appearance); }
}

export function parseCelestrial(data: any) {
    let c: CelestialObject;
    switch(data._type) {
        case "Star":
            c = new Star(data.names || [], PhysicalProperties.parse(data.physical), Appearance.parse(data.appearance), OrbitalProperties.parse(data.orbital));
            break;
        case "Planet":
            c = new Planet(data.names || [], OrbitalProperties.parse(data.orbital), PhysicalProperties.parse(data.physical), Appearance.parse(data.appearance) || new Appearance(1));
            break;
        case "Moon":
            c = new Moon(data.names || [], OrbitalProperties.parse(data.orbital), PhysicalProperties.parse(data.physical), Appearance.parse(data.appearance) || new Appearance(1));
            break;
        case "Asteroid":
            c = new Asteroid(data.names || [], OrbitalProperties.parse(data.orbital), PhysicalProperties.parse(data.physical), Appearance.parse(data.appearance) || new Appearance(1));
            break;
        default:
            c = new CelestialObject(data.names || [], OrbitalProperties.parse(data.orbital), PhysicalProperties.parse(data.physical), Appearance.parse(data.appearance) || new Appearance(1));
            break;
    }
    c._uid = data._uid;
    c._parent = data._parent;
    return c;
}
