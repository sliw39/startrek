import {
  CommandPart,
  DefensePart,
  EnergyPart,
  EngineeringPart,
  LifePart,
  Part,
  PartDesc,
  SciencePart,
  Vessel,
  VesselDesc,
} from "./vessel";
import { db } from "../db";
import { HexaCalc, HexaCoord, O } from "./hexagon";
import { resolveBehaviors } from "./behaviors";

export namespace PartLibrary {
  let ALL_PARTS: PartDesc[] = [];
  let loaded = false;

  export async function loadAll() {
    if (!loaded) {
      let query = await db.collection("vesselparts").get();
      ALL_PARTS = query.docs
        .filter((d) => d.exists)
        .map((d) => d.data()) as PartDesc[];
    }
    return ALL_PARTS;
  }

  export async function loadAndParsePart(name: string, coord: HexaCoord) {
    let parts = await loadAll();
    let part = parts[parts.map((p) => p.name).indexOf(name)];
    return parsePart(part, coord);
  }

  export function parsePart(data: PartDesc, coord: HexaCoord = O): Part {
    switch (data.type) {
      case "command":
        return new CommandPart(
          coord,
          data.name,
          data.value,
          resolveBehaviors(data.behaviors)
        );
      case "defense":
        let defp = new DefensePart(
          coord,
          data.name,
          data.value,
          resolveBehaviors(data.behaviors)
        );
        defp.purpose = data.purpose ?? "DEF";
        return defp;
      case "engineering":
        return new EngineeringPart(
          coord,
          data.name,
          data.value,
          resolveBehaviors(data.behaviors)
        );
      case "life":
        return new LifePart(
          coord,
          data.name,
          data.value,
          resolveBehaviors(data.behaviors)
        );
      case "science":
        return new SciencePart(
          coord,
          data.name,
          data.value,
          resolveBehaviors(data.behaviors)
        );
      case "energy":
        let ep = new EnergyPart(
          coord,
          data.name,
          data.value,
          resolveBehaviors(data.behaviors)
        );
        ep.energy = data.energy;
        ep.stock = data.stock;
        return ep;
    }
  }
}

export namespace VesselLibrary {
  const ALL_CLASSES: Vessel[] = [];

  interface ClassData extends VesselDesc {
    cells: {
      coord: string;
      name: string;
    }[];
  }

  export async function saveClass(vessel: Vessel) {
    let data: ClassData = {
      name: vessel.name,
      designation: vessel.designation,
      class: vessel.class,
      faction: vessel.faction,
      cells: vessel.cells.map((c) => {
        return { coord: c.position.hash, name: c.name };
      }),
    };
    if (vessel._uid) {
      await db
        .collection("vesselclass")
        .doc(vessel._uid)
        .update(data);
    } else {
      let result = await db.collection("vesselclass").add(data);
      vessel._uid = result.id;
    }
  }

  export async function deleteClass(ship: Vessel) {
    if (ship._uid) {
      await db
        .collection("vesselclass")
        .doc(ship._uid)
        .delete();
      let idx = ALL_CLASSES.findIndex((v) => v._uid === ship._uid);
      if (idx !== -1) {
        ALL_CLASSES.splice(idx, 1);
      }
    }
  }

  async function parseClass(id: string, data: ClassData) {
    let vessel = new Vessel();
    vessel._uid = id;
    for (let key in data) {
      if (key in vessel && ["cells"].indexOf(key) === -1) {
        vessel[key as keyof VesselDesc] = (data as any)[key];
      }
    }
    for (let cell of data.cells ?? []) {
      let part = await PartLibrary.loadAndParsePart(
        cell.name,
        HexaCalc.fromHash(cell.coord)
      );
      part.attachParent(vessel);
      vessel.addCell(part);
    }
    return vessel;
  }

  export async function loadClass(desc: VesselDesc) {
    for (let d of ALL_CLASSES) {
      if (
        d.faction == desc.faction &&
        d.designation == desc.designation &&
        d.class == desc.class &&
        (desc.name ? d.name == desc.name : true)
      ) {
        return d;
      }
    }

    let query = db
      .collection("vesselclass")
      .where("faction", "==", desc.faction)
      .where("designation", "==", desc.designation)
      .where("class", "==", desc.class);
    if (desc.name) {
      query = query.where("name", "==", desc.name);
    }

    let docs = (await query.limit(1).get()).docs;
    let vessel =
      docs.length === 1
        ? parseClass(docs[0].id, docs[0].data() as ClassData)
        : null;
    if (vessel) {
      ALL_CLASSES.push(await vessel);
    }
    return vessel;
  }

  export async function listClasses() {
    return (await db.collection("vesselclass").get()).docs.map((d) => {
      return {
        class: d.get("class"),
        designation: d.get("designation"),
        faction: d.get("faction"),
        name: d.get("name"),
      } as VesselDesc;
    });
  }
}
