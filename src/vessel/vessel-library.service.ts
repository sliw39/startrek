import { CommandPart, DefensePart, EnergyPart, EngineeringPart, LifePart, Part, PartDesc, SciencePart } from "./vessel";
import { db } from "../db";
import { HexaCoord, O } from "./hexagon";
import { resolveBehaviors } from "./behaviors";

export namespace PartLibrary {
    let ALL_PARTS: PartDesc[] = [];
    let loaded = false;
    
    export async function loadAll() {
        if(!loaded) {
            let query = await db.collection("vesselparts").get();
            ALL_PARTS = query.docs.filter(d => d.exists).map(d => d.data()) as PartDesc[];
        }
        return ALL_PARTS;
    }

    export async function loadAndParsePart(name: string, coord: HexaCoord) {
        let parts = await loadAll();
        let part = parts[parts.map(p => p.name).indexOf(name)];
        return parsePart(part, coord);
    }

    export function parsePart(data: PartDesc, coord: HexaCoord = O): Part {
        switch(data.type) {
            case "command":
                return new CommandPart(coord, data.name, data.value, resolveBehaviors(data.behaviors));
            case "defense":
                return new DefensePart(coord, data.name, data.value, resolveBehaviors(data.behaviors));
            case "engineering":
                return new EngineeringPart(coord, data.name, data.value, resolveBehaviors(data.behaviors));
            case "life":
                return new LifePart(coord, data.name, data.value, resolveBehaviors(data.behaviors));
            case "science":
                return new SciencePart(coord, data.name, data.value, resolveBehaviors(data.behaviors));
            case "energy":
                let ep = new EnergyPart(coord, data.name, data.value, resolveBehaviors(data.behaviors));
                ep.energy = data.energy;
                ep.stock = data.stock;
                return ep;
        }
    }
}