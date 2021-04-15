import { CelestialObject, parseCelestial, System } from "../map/objects.model";
import { db } from "../db";

function mapUid(doc: firebase.default.firestore.DocumentSnapshot): firebase.default.firestore.DocumentData | undefined {
  let data: any = doc.data()
  if (data && !data._uid) {
    data._uid = doc.id;
  }
  return data;
}

function arrayContains(array: string[], filter: string) {
  for (let word of array) {
    if (new RegExp(`.*${filter}.*`, "gi").test(word)) {
      return true;
    }
  }
  return false;
}

export namespace SystemIo {
  export async function upsert(system: System) {
    let objects = system.objects;
    let data = system.serialize() as any;
    let promises: Promise<any>[] = [];
    for (let obj of objects) {
      promises.push(CelestialIo.upsert(obj));
    }
    await Promise.all(promises);
    data.objects = objects.map(o => o._uid);

    if (system._uid) {
      await db.collection("system").doc(system._uid).update(data);
    } else {
      delete data._uid;
      let result = await db.collection("system").add(data);
      system._uid = result.id;
    }
  }

  export async function listAll(deep = true) {
    let systems = await db.collection("system").get();
    return (await readSnapshots(systems, deep)).filter(e => e !== undefined) as System[];
  }

  export async function list(...ids: string[]) {
    let promises: Promise<System | undefined>[] = []
    for (let id of ids) {
      promises.push(SystemIo.get(id));
    }
    return (await Promise.all(promises)).filter(e => e !== undefined) as System[];
  }

  export async function get(id: string) {
    if (!id) return undefined;
    let doc = await db.collection("system").doc(id).get()
    return doc.exists ? parseDocument(doc) : undefined;
  }

  export async function exists(id: string) {
    return (await db.collection("system").doc(id).get()).exists;
  }

  export async function find(query: string, deep = false) {
    let systems = await db.collection("system").get();
    return (await readSnapshots(systems, deep, query)).filter(e => e !== undefined) as System[];
  }

  export async function findByDirectChild(childUid: string) {
    let systems = await db.collection("system").where("objects", "array-contains", childUid).get();
    return (await readSnapshots(systems, false)).filter(e => e !== undefined)[0];
  }

  async function readSnapshots(result: firebase.default.firestore.QuerySnapshot, deep: boolean, query: string | null = null) {
    if (deep) {
      let promises: Promise<System | undefined>[] = []
      for (let doc of result.docs) {
        if (doc.exists) {
          promises.push(parseDocument(doc, query));
        }
      }
      return (await Promise.all(promises)).filter(e => e !== undefined) as System[];
    } else {
      return result.docs.map(doc => {
        let data = mapUid(doc);
        if (!data || data && query && !arrayContains(data.names, query)) {
          return undefined;
        }
        return System.parse(data);
      });
    }
  }

  async function parseDocument(doc: firebase.default.firestore.DocumentSnapshot, query: string | null = null) {
    let data = mapUid(doc);
    if (!data || data && query && !arrayContains(data.names, query)) {
      return undefined;
    }
    data.objects = await CelestialIo.list(...data.objects);
    return System.parse(data);
  }

}

export namespace CelestialIo {

  export async function upsert(celestial: CelestialObject) {
    if (celestial._uid) {
      await db.collection("celestrial").doc(celestial._uid).update(celestial.serialize());
    } else {
      let data: any = celestial.serialize();
      delete data._uid
      let result = await db.collection("celestrial").add(data)
      celestial._uid = result.id;
    }
  }

  export async function list(...ids: string[]) {
    if (ids.length === 0) { return []; }
    let promises: Promise<CelestialObject | undefined>[] = []
    for (let id of ids) {
      promises.push(CelestialIo.get(id));
    }
    return (await Promise.all(promises)).filter(e => e !== undefined) as CelestialObject[];
  }

  export async function get(id: string) {
    let doc = await db.collection("celestrial").doc(id).get();
    return doc.exists ? parseCelestial(mapUid(doc)) : undefined;
  }

  export async function remove(uid: string) {
    await db.collection("celestrial").doc(uid).delete();
  }

  export async function find(query: string) {
    return (await db.collection("celestrial").get()).docs.filter(d => d.exists && arrayContains(d.data().names, query)).map(doc => parseCelestial(mapUid(doc)));
  }

  export async function getChildren(parentUid: string) {
    if (!parentUid) {
      return []
    }
    return (await db.collection("celestrial").where("_parent", "==", parentUid).orderBy("orbital.semiMajorAxis").get()).docs.map(doc => parseCelestial(mapUid(doc)));
  }

  export async function getSystem(celestial: CelestialObject): Promise<System | undefined> {
    if (celestial._parent) {
      if (await SystemIo.exists(celestial._parent)) {
        return SystemIo.get(celestial._parent);
      } else {
        return getSystem(await get(celestial._parent) as CelestialObject);
      }
    } else {
      return SystemIo.findByDirectChild(celestial._uid);
    }
  }
}
