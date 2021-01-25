import { CelestialObject, parseCelestrial, System } from "../map/objects.model";
import { db } from "../db";
import _ from "lodash";

export namespace SystemIo {
    export async function upsert(system: System) {
        let objects = system.objects;
        let data = system.serialize() as any;
        let promises: Promise<any>[] = [];
        for(let obj of objects) {
            promises.push(CelestrialIo.upsert(obj));
        }
        await Promise.all(promises);
        data.objects = _.map(objects, o => o._uid);

        if(system._uid) {
            await db.collection("system").doc(system._uid).update(data);
        } else {
            delete data._uid;
            let result = await db.collection("system").add(data);
            system._uid = result.id;
        }
    }

    export async function listAll() {
        let systems = await db.collection("system").get();
        let promises: Promise<System | undefined>[] = []
        for(let doc of systems.docs) {
            promises.push(parseDocument(doc));
        }
        return (await Promise.all(promises)).filter(e => e !== undefined) as System[];
    }

    export async function list(...ids: string[]) {
        let promises: Promise<System | undefined>[] = []
        for(let id of ids) {
            promises.push(SystemIo.get(id));
        }
        return (await Promise.all(promises)).filter(e => e !== undefined) as System[];
    }

    export async function get(id: string) {
        let doc = await db.collection("celestrial").doc(id).get()
        return parseDocument(doc);
    }

    async function parseDocument(doc: firebase.firestore.DocumentSnapshot) {
        let data = doc.data()
        if(!data) {
            return undefined;
        }
        data.objects = await CelestrialIo.list(...data.objects);
        return System.parse(data);
    }

}

export namespace CelestrialIo {
    export async function upsert(celestrial: CelestialObject) {
        if(celestrial._uid) {
            await db.collection("celestrial").doc(celestrial._uid).update(celestrial.serialize());
        } else {
            let data: any = celestrial.serialize();
            delete data._uid
            let result = await db.collection("celestrial").add(data)
            celestrial._uid = result.id;
        }
    }

    export async function list(...ids: string[]) {
        if(ids.length === 0) {return [];}
        let promises: Promise<CelestialObject | undefined>[] = []
        for(let id of ids) {
            promises.push(CelestrialIo.get(id));
        }
        return (await Promise.all(promises)).filter(e => e !== undefined) as CelestialObject[];
    }

    export async function get(id: string) {
        let doc = await db.collection("celestrial").doc(id).get();
        let data = doc.data();
        if(!data) {
            return undefined;
        }
        return parseCelestrial(data);
    }
}
