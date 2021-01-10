
export class Point implements IPoint {
    constructor(public x: number, public y: number) {}

    static fromObject(obj: IPoint) {
        if(obj instanceof Point) {
            return obj;
        } else {
            return new Point(obj.x, obj.y);
        }
    }

    translated(vector: Vector) {
        return vector.apply(this);
    }
}

export interface IPoint {
    x: number;
    y: number;
}

export class Vector {
    constructor(public xend: number, public yend: number) {}

    static betweenPoints(p1: IPoint, p2: IPoint) {
        return new Vector(p2.x-p1.x, p2.y-p1.y);
    }

    static originToPoint(point: IPoint) {
        return new Vector(point.x, point.y);
    }

    static pointToOrigin(point: IPoint) {
        return new Vector(-point.x, -point.y);
    }
    
    apply(point: IPoint): Point {
        return new Point(
            point.x + this.xend,
            point.y + this.yend
        );
    }

    add(vector: Vector): Vector {
        return new Vector(this.xend + vector.xend, this.yend + vector.yend);
    }

    reversed() {
        return Vector.pointToOrigin(new Point(this.xend, this.yend));
    }
    
    get length() {
        return Math.sqrt(this.xend*this.xend + this.yend*this.yend);
    }
    
    scaled(factor: number) {
        return new Vector(this.xend*factor, this.yend*factor);
    }
}

export class Rectangle {
    constructor(public x0: number, public x1: number, public y0: number, public y1: number) {
    }

    static fromCenter(center: IPoint, width: number, height: number) {
        return new Rectangle(
            center.x - (width/2),
            center.x + (width/2),
            center.y - (height/2),
            center.y + (height/2)
        );
    }

    scaled(factor: number) {
        return Rectangle.fromCenter(this.center, this.witdh * factor, this.height * factor);
    }

    translated(vector: Vector) {
        return Rectangle.fromCenter(this.center.translated(vector), this.witdh, this.height);
    }

    include(p: IPoint) {
        return p.x >= this.x0 && p.x <= this.x1 && p.y >= this.y0 && p.y <= this.y1;
    }

    get center() {
        return new Point(
            (this.x1 - this.x0) / 2 + this.x0,
            (this.y1 - this.y0) / 2 + this.y0 
        );
    }

    get witdh() {
        return this.x1 - this.x0;
    }

    get height() {
        return this.y1 - this.y0;
    }
}

export class Segment {
    public p1: Point;
    public p2: Point;

    constructor(p1: IPoint, p2: IPoint) {
        this.p1 = Point.fromObject(p1);
        this.p2 = Point.fromObject(p2);
    }

    get length() {
        return Math.abs(this.p2.x - this.p1.x) + Math.abs(this.p2.y - this.p1.y);
    }

    toVector() {
        return Vector.betweenPoints(this.p1, this.p2);
    }
}