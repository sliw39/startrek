export interface HexaCoord {
    diag() : Diag;
    cube() : Cube;
    grid() : Grid;
}

/**      
 *      ___
 *  r  /   \
 *     \___/
 *           q
 */
export class Diag implements HexaCoord {
    constructor(public readonly r: number, public readonly q: number) {}
    diag() { return this; }
    cube() { return new Cube(this.q, -this.q-this.r, this.r); }
    grid() { return this.cube().grid(); }
    
}

/**       x
 *       ___
 *      /   \
 *      \___/
 *   y         z
 */
export class Cube implements HexaCoord {
    constructor(public readonly x: number, public readonly y: number, public readonly z: number) {}
    cube() { return this; }
    diag() { return new Diag(this.x, this.z); }
    grid() { return new Grid(this.z + (this.x + (this.x&1)) / 2, this.x) }
}

/**        y
 *        ___
 *   x   /   \
 *       \___/
 */
export class Grid implements HexaCoord {
    constructor(public readonly x: number, public readonly y: number) {}
    grid() { return this; }
    diag() { return this.cube().diag(); }
    cube() {
        var z = this.x - (this.y + (this.y&1)) / 2
        return new Cube(this.y, -this.y - z, z)
    }

}

export namespace HexaCalc {
    export function neighbors(cell: HexaCoord) {
        const cube = cell.cube();
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
        const a = cell1.cube();
        const b = cell2.cube();
        return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
    }
}