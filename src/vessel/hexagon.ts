
export interface HexaCoord {
    diag : Diag;
    cube : Cube;
    grid : Grid;
    hash : string;
}

/**      
 *      ___
 *  r  /   \
 *     \___/
 *           q
 */
export class Diag implements HexaCoord {
    constructor(public readonly r: number, public readonly q: number) {}
    get diag() { return this; }
    get cube() { return new Cube(this.q, -this.q-this.r, this.r); }
    get grid() { return this.cube.grid; }
    get hash() { return `d${this.q}$${this.r}`; }
    
}

/**       x
 *       ___
 *      /   \
 *      \___/
 *   y         z
 */
export class Cube implements HexaCoord {
    constructor(public readonly x: number, public readonly y: number, public readonly z: number) {}
    get cube() { return this; }
    get diag() { return new Diag(this.x, this.z); }
    get grid() { return new Grid(this.z + (this.x + (this.x&1)) / 2, this.x) }
    get hash() { return `c${this.x}$${this.y}$${this.z}`; }
}

/**        y
 *        ___
 *   x   /   \
 *       \___/
 */
export class Grid implements HexaCoord {
    constructor(public readonly x: number, public readonly y: number) {}
    get grid() { return this; }
    get diag() { return this.cube.diag; }
    get cube() {
        var z = this.x - (this.y + (this.y&1)) / 2
        return new Cube(this.y, -this.y - z, z)
    }
    get hash() { return `g${this.x}$${this.y}`; }

}

export namespace HexaCalc {
    export function neighbors(cell: HexaCoord) {
        const cube = cell.cube;
        return [
            new Cube(cube.x, cube.y+1, cube.z-1),
            new Cube(cube.x+1, cube.y, cube.z-1),
            new Cube(cube.x+1, cube.y-1, cube.z),
            new Cube(cube.x, cube.y-1, cube.z+1),
            new Cube(cube.x-1, cube.y, cube.z+1),
            new Cube(cube.x-1, cube.y+1, cube.z),
        ]
    }

    export function distance(cell1: HexaCoord, cell2: HexaCoord) {
        const a = cell1.cube;
        const b = cell2.cube;
        return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
    }


    export function fromHash(str: string) : HexaCoord {
        switch(str[0]) {
            case "d": 
                let d = str.match(/d([0-9]+)$([0-9]+)/);
                if(d == null || d.length !== 2) throw `Invalid expression ${str}`;
                return new Diag(parseInt(d[0]), parseInt(d[1]));
            case "g": 
                let g = str.match(/g([0-9]+)$([0-9]+)/);
                if(g == null || g.length !== 3) throw `Invalid expression ${str}`;
                return new Grid(parseInt(g[0]), parseInt(g[1]));
            case "c": 
                let c = str.match(/c([0-9]+)$([0-9]+)$([0-9]+)/);
                if(c == null || c.length !== 3) throw `Invalid expression ${str}`;
                return new Cube(parseInt(c[0]), parseInt(c[1]), parseInt(c[2]));
            default:
                throw `Invalid expression ${str}`
        }
    }

    export function propagate(center: HexaCoord, consumer: (cell: HexaCoord, circle: HexaCoord[], i: number) => "NEXT" | "UP" | "STOP", mode: "AUTO" | "MANUAL" = "AUTO") {
        let distance = 1;
        while(true) {
            let circle: HexaCoord[] = [];
            for(let i=-distance; i<=distance; i++) {
                for(let j=-distance; j<=distance; j++) {
                    for(let k=-distance; k<=distance; k++) {
                        let c = new Cube(i, j, k);
                        if(HexaCalc.distance(center, c) === distance) {
                            circle.push(c);
                        } 
                    }
                }    
            }

            let i = 0;
            let result: "NEXT" | "UP" | "STOP";
            do {
                result = consumer(circle[i%circle.length], circle, i);
                i++
            } while(result === "NEXT" || (mode === "AUTO" && i%circle.length === 0));

            if(result === "STOP" || distance === 20) {
                return;
            }
            distance++;
        }
    }
}