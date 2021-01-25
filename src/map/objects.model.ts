import { IPoint, Point } from "../framework/geometry";

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

export type MassUnit = "g" | "kg" | "ton" | "kton" | "moon" | "earth" | "jupiter" | "sun";
export class Mass {
    private stdValue: number;
    private readonly exp: number;
    private static MOON_RAD = 7.347;
    private static EARTH_RAD = 5.972;
    private static JUP_RAD = 1.898;
    private static SUN_RAD = 1.989;

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

    constructor(private value: number, public unit: MassUnit = "kg") {
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
                this.exp = 1;
        }
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
                return this.stdValue / (Mass.MOON_RAD * Math.pow(10, this.exp - 22));
            case "earth":
                return this.stdValue / (Mass.EARTH_RAD * Math.pow(10, this.exp - 24));
            case "jupiter":
                return this.stdValue / (Mass.JUP_RAD * Math.pow(10, this.exp - 27));
            case "sun":
                return this.stdValue / (Mass.SUN_RAD * Math.pow(10, this.exp - 30));
            default:
                return this.stdValue;
        }
    }

    add(mass: Mass|number, unit?: MassUnit) {
        if(typeof mass === "number") {
            mass = new Mass(mass, unit);
        }
        this.stdValue += mass.get("kg");
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
export class Distance {
    private stdValue: number;
    private readonly exp: number;
    private static UA_RAD = 1.496;
    private static AL_RAD = 9.5;

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

    constructor(private value: number, public unit: DistanceUnit = "km") {
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
                this.exp = 1;
        }
    }

    get(unit: DistanceUnit = this.unit) {
        switch(unit) {
            case "mkm":
                return this.stdValue * Math.pow(10, this.exp - 6);
            case "ua":
                return this.stdValue / (Distance.UA_RAD * Math.pow(10, this.exp - 8));
            case "al":
                return this.stdValue / (Distance.AL_RAD * Math.pow(10, this.exp - 12));
            default:
                return this.stdValue;
        }
    }

    add(dist: Distance|number, unit?: DistanceUnit) {
        if(typeof dist === "number") {
            dist = new Distance(dist, unit);
        }
        this.stdValue += dist.get("km");
    }

    get km() { return this.get("mkm") * 1000; }
    get mkm() { return this.get("mkm"); }
    get ua() { return this.get("ua"); }
    get al() { return this.get("al"); }

    print() {
        return this.get() + this.unit;
    }
}

export type TemperatureUnit = "K" | "C" | "F";
export class Temperature {
    private stdValue: number;
    private static C_RAD = 273.15;
    private static F_RAD = 459.67;

    static k(value: number) { return new Temperature(value, "K"); }
    static c(value: number) { return new Temperature(value, "C"); }
    static f(value: number) { return new Temperature(value, "F"); }

    static zero(unit: TemperatureUnit = "K") {
        return new Temperature(0, unit);
    }

    static sun() {
        return Temperature.k(5500);
    }

    constructor(private value: number, public unit: TemperatureUnit = "K") {
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

    get k() { return this.get("K"); }
    get c() { return this.get("C"); }
    get f() { return this.get("F"); }

    print() {
        return this.get() + this.unit;
    }
}

export type TimeUnit = "ms" | "s" | "m" | "h" | "d" | "w" | "y";
export class Time {
    private stdValue: number;

    static zero(unit: TimeUnit = "d") {
        return new Time(0, unit);
    }

    constructor(private value: number, public unit: TimeUnit) {
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

    get(unit: TimeUnit = this.unit) {
        switch(unit) {
            case "ms":
                this.stdValue = this.value * 1000;
                break;
            case "s":
                this.stdValue = this.value;
                break;
            case "m":
                this.stdValue = this.value / 60;
                break;
            case "h":
                this.stdValue = this.value / 3600;
                break;
            case "d":
                this.stdValue = this.value / 24 / 3600;
                break;
            case "w":
                this.stdValue = this.value / 7 / 24 / 3600;
                break;
            case "y":
                this.stdValue = this.value / 365 / 7 / 24 / 3600;
                break;
        }
    }

    get ms() { return this.get("ms"); }
    get s() { return this.get("s"); }
    get m() { return this.get("m"); }
    get h() { return this.get("h"); }
    get d() { return this.get("d"); }
    get w() { return this.get("w"); }
    get y() { return this.get("y"); }

    print() {
        return this.get() + this.unit;
    }
}

export class Appearance {
    constructor(public brightness: number, public oclass?: string, public colors: string[] = []) {}
}

export class PhysicalProperties {
    constructor(public radius = Distance.zero(), public mass = Mass.zero(), public temperature = Temperature.zero()) {}
}

export class OrbitalProperties {

    static origin() {
        return new OrbitalProperties(Distance.zero(), 0, Time.zero(), 0);
    }

    constructor(
        public semiMajorAxis: Distance,
        public excentricity: number,
        public period: Time,
        public tilt: number
    ) {}

}

export class System {
    public readonly mass: Mass;
    public readonly temperature: number;
    public readonly brightness: number;
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
    constructor(public names: string[], public orbital = OrbitalProperties.origin(), public physical: PhysicalProperties, public appearance: Appearance) {}
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
