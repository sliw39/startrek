import { IPoint } from "../framework/geometry";

export const G = 6.67430*Math.pow(10,-11)
const PI = Math.PI

export interface Coordinate extends IPoint {
    x: number;
    y: number;
    unit: DistanceUnit;
    parent?: Coordinate;
    distanceToParent?: Distance;
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

    constructor(private value: number, unit: MassUnit = "kg") {
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

    get(unit: MassUnit) {
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

    add(mass: Distance|number, unit?: DistanceUnit) {
        if(typeof mass === "number") {
            mass = new Distance(mass, unit);
        }
        this.stdValue += mass.get("km");
    }

    get km() { return this.get("mkm") * 1000; }
    get mkm() { return this.get("mkm"); }
    get ua() { return this.get("ua"); }
    get al() { return this.get("al"); }
}


export class OrbitalProperties {
    public readonly period: number;
    public readonly length: Distance;
    public readonly excentricity: number;
    public readonly periaster: Instant;
    public readonly apoaster: Instant;
    public readonly mu: number;
    private readonly asquared: number;
    private readonly bsquared: number;
    private readonly a: number;
    private readonly b: number;

    constructor(
        public majorAxis: Distance,
        public minorAxis: Distance,
        public mass: Mass,
        public parent: System | CelestialObject,
        public shift: number
    ) {
        const a = this.a = majorAxis.km/2;
        const b = this.b = minorAxis.km/2;
        this.asquared = a*a;
        this.bsquared = b*b;
        const acube = this.asquared*a;
        const pisquared = PI * PI
        this.mu = (G * (this.parent instanceof System ? this.parent : this.parent.orbital).mass.kg)
        this.period = Math.sqrt((4 * pisquared * acube) / this.mu);
        this.length = new Distance(PI * Math.sqrt(2*(this.asquared+this.bsquared)));
        this.excentricity = Math.sqrt((this.asquared - this.bsquared) / this.asquared);

        let r = new Distance(a * (1 - this.excentricity));
        this.periaster = {
            velocity: (this.mu / a) * (1 + this.excentricity) / (1 - this.excentricity),
            coordinates: {
                x: r.get(majorAxis.unit) * Math.cos(this.shift * 2 * PI),
                y: r.get(majorAxis.unit) * Math.sin(this.shift * 2 * PI),
                distanceToParent: r,
                unit: majorAxis.unit
            }
        }

        r = new Distance(a * (1 + this.excentricity));
        this.apoaster = {
            velocity: (this.mu / a) * (1 - this.excentricity) / (1 + this.excentricity),
            coordinates: {
                x: r.get(majorAxis.unit) * Math.cos(this.shift * 2 * PI),
                y: r.get(majorAxis.unit) * Math.sin(this.shift * 2 * PI),
                distanceToParent: r,
                unit: majorAxis.unit
            }
        }
    }

    instant(percent: number): Instant {
        let rpx = percent * 2 * PI
        let cos = (- Math.cos(rpx) + 1)/2
        let max = cos * (this.periaster.velocity-this.apoaster.velocity)

        let tantheta = Math.tan(rpx);
        let x = (this.a * this.b) / Math.sqrt(this.bsquared + this.asquared * tantheta * tantheta) * (-PI/2 < rpx && PI/2 > rpx ? 1 : -1)
        return {
            velocity: max + this.apoaster.velocity,
            coordinates: {
                x: new Distance(x).get(this.majorAxis.unit), y: new Distance(x * tantheta).get(this.majorAxis.unit),
                unit: this.majorAxis.unit
            }
        }
    }
}

export class System {
    public readonly mass: Mass;
    constructor(public names: string[], public coordinate: Coordinate, public objects: CelestialObject[]) {
        this.mass = new Mass(0);
        for(let o of objects) {
            this.mass.add(o.orbital.mass);
        }
    }
}

export class CelestialObject {
    constructor(public names: string[], public orbital: OrbitalProperties) {}
}

export class Star extends CelestialObject {
    constructor(names: string[], orbital: OrbitalProperties) { super(names, orbital); }
}

export class Planet extends CelestialObject {
    constructor(names: string[], orbital: OrbitalProperties) {  super(names, orbital); }
}

export class Moon extends CelestialObject {
    constructor(names: string[], orbital: OrbitalProperties) {  super(names, orbital); }
}

export class Asteroid extends CelestialObject {
    constructor(names: string[], orbital: OrbitalProperties) {  super(names, orbital); }
}
