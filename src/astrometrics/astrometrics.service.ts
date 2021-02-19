import { CelestialObject, parseCelestrial, System } from "../map/objects.model";
import { db } from "../db";

function mapUid(doc: firebase.firestore.DocumentSnapshot): firebase.firestore.DocumentData | undefined {
  let data: any = doc.data()
  if (data && !data._uid) {
    data._uid = doc.id;
  }
  return data;
}

export namespace SystemIo {
  export async function upsert(system: System) {
    let objects = system.objects;
    let data = system.serialize() as any;
    let promises: Promise<any>[] = [];
    for (let obj of objects) {
      promises.push(CelestrialIo.upsert(obj));
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
    if(!id) return undefined;
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

  async function readSnapshots(result: firebase.firestore.QuerySnapshot, deep: boolean, query: string|null = null) {
    if (deep) {
      let promises: Promise<System | undefined>[] = []
      for (let doc of result.docs) {
        if(doc.exists) {
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

  async function parseDocument(doc: firebase.firestore.DocumentSnapshot, query: string|null = null) {
    let data = mapUid(doc);
    if (!data || data && query && !arrayContains(data.names, query)) {
      return undefined;
    }
    data.objects = await CelestrialIo.list(...data.objects);
    return System.parse(data);
  }

  function arrayContains(array: string[], filter: string) {
    for (let word of array) {
      if (word.indexOf(filter) !== -1) {
        return true;
      }
    }
    return false;
  }

}

export namespace CelestrialIo {

  export async function upsert(celestrial: CelestialObject) {
    if (celestrial._uid) {
      await db.collection("celestrial").doc(celestrial._uid).update(celestrial.serialize());
    } else {
      let data: any = celestrial.serialize();
      delete data._uid
      let result = await db.collection("celestrial").add(data)
      celestrial._uid = result.id;
    }
  }

  export async function list(...ids: string[]) {
    if (ids.length === 0) { return []; }
    let promises: Promise<CelestialObject | undefined>[] = []
    for (let id of ids) {
      promises.push(CelestrialIo.get(id));
    }
    return (await Promise.all(promises)).filter(e => e !== undefined) as CelestialObject[];
  }

  export async function get(id: string) {
    let doc = await db.collection("celestrial").doc(id).get();
    return doc.exists ? parseCelestrial(mapUid(doc)) : undefined;
  }

  export async function remove(uid: string) {
    await db.collection("celestrial").doc(uid).delete();
  }

  export async function find(query: string) {
    return (await db.collection("celestrial").where("names", "array-contains", query).get()).docs.map(doc => parseCelestrial(mapUid(doc)));
  }

  export async function getChildren(parentUid: string) {
    if(!parentUid) {
      return []
    }
    return (await db.collection("celestrial").where("_parent", "==", parentUid).orderBy("orbital.semiMajorAxis").get()).docs.map(doc => parseCelestrial(mapUid(doc)));
  }
}
