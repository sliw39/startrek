import { DefensePart, isRunning, Part, Vessel } from "../vessel/vessel";
import { VesselLibrary } from "../vessel/vessel-library.service";

class Team {
    static idx = 0;
    constructor(
        public name: string, 
        public vessels: FullVessel[] = []) {
            vessels.forEach(v => {
                v.team = this;
                if(!v.vessel.name) {
                    v.vessel.name = v.vessel.class + "-" + v.vessel.designation + "#" + (Team.idx++)
                }
            });
        }

    isKo(): boolean {
        for(let v of this.vessels) {
            if(!v.vessel.isKo()) {
                return false;
            }
        }
        return true;
    }
}

interface Roll {
    attribute: number;
    skill: number;
}

interface Crew {
    pilot: Roll;
    engineer: Roll;
    tactical: Roll;
}

interface Attack {
    attacker: Roll;
    source: {
        vessel: FullVessel;
        weapon: DefensePart;
    }
    target: {
        vessel: FullVessel;
        part: Part;
    }
}

interface Damages {
    attack: Attack;
    value?: number;
    state: "TOUCH" | "MISSED" | "AVOID";
}

interface FullVessel {
    team?: Team;
    vessel: Vessel;
    crew: Crew;
    executor: Executor;
}

interface Executor {
    phase1_escapeManoeuver(teams: Team[], vessel: FullVessel): Promise<boolean>;
    phase2_planAttacks(teams: Team[], vessel: FullVessel): Promise<Attack[]>;
    phase3_applyDamages(attacks: Damages): Promise<void>;
    phase4_redispatchEnergy(teams: Team[], vessel: FullVessel): Promise<void>;
}

class DumbAIExecutor implements Executor {
    phase1_escapeManoeuver(teams: Team[], vessel: FullVessel): Promise<boolean> {
        return Promise.resolve(Math.random() > .5);
    }
    phase2_planAttacks(teams: Team[], vessel: FullVessel): Promise<Attack[]> {
        function randomPick<T>(arr: T[]): T {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        //pick another team
        let targetTeam = randomPick(teams.filter(t => vessel.team && !t.isKo() && t.name !== vessel.team.name));
    
        //pick a vessel
        let targetVessel = randomPick(targetTeam.vessels.filter(v => !v.vessel.isKo()));

        //attack at random with everything online
        let atks: Attack[] = [];
        for(let weapon of vessel.vessel.cells.filter(c => c instanceof DefensePart && c.purpose === "ATK") as DefensePart[]) {
            atks.push({
                attacker: vessel.crew.tactical,
                source: { vessel, weapon },
                target: { vessel: targetVessel, part: randomPick(targetVessel.vessel.cells.filter(c => isRunning(c))) }
            })
        }

        return Promise.resolve(atks);
    }
    phase3_applyDamages(atk: Damages): Promise<void> {
        if(atk.state === "MISSED") {
            console.info(`${atk.attack.source.vessel.vessel.name} miss ${atk.attack.target.vessel.vessel.name}`);
        } else if(atk.state === "AVOID") {
            console.info(`${atk.attack.target.vessel.vessel.name} avoids ${atk.attack.source.vessel.vessel.name}`);
        } else {
            console.warn(`${atk.attack.source.vessel.vessel.name} hits ${atk.attack.target.vessel.vessel.name} with a ${atk.attack.source.weapon.name}, dealing ${atk.value ?? 0} damages`);
            atk.attack.target.part.damage(atk.value ?? 0);
        }

        return Promise.resolve();
    }
    phase4_redispatchEnergy(teams: Team[], vessel: FullVessel): Promise<void> {
        return Promise.resolve();
    }

}

export function roll(spec: Roll = {attribute: 2, skill: 10}): number {
    let successes = 0;
    for(let i=0; i<spec.attribute; i++) {
        let result = Math.ceil(Math.random()*20);
        if(result === 1) {
            successes += 2;
        } else if(result === 20) {
            successes -= 2;
        } else if(result <= spec.skill) {
            successes++;
        }
    }
    return Math.max(0, successes);
}

type BattleManagerEvent = "turn" | "attack";
class BattleManager {
    teams: Team[] = [];
    private listeners: {[event in BattleManagerEvent]?: (() => void)[]} = {};

    createAndAddTeam(name: string, ...vessels: FullVessel[]) {
        return this.addTeam(new Team(name, vessels));
    }

    addTeam(team: Team) {
        this.teams.push(team);
        return this;
    }

    addListener(event: BattleManagerEvent, listener: () => void) {
        if(!(event in this.listeners)) {
            this.listeners[event] = [];
        }
        this.listeners[event]?.push(listener);
    }

    async run(stopCondition: (turn: number) => Promise<boolean> = () => Promise.resolve(this.teams.filter(t => !t.isKo()).length < 2)) {
        let turn = 0;
        while(!(await stopCondition(turn))) {
            this.dispatch("turn");
            console.info("TURN" + (turn++));

            let manoeuvers = new WeakMap<FullVessel, number>();
            await this.forEachVessel(async (team, v) => {
                if(await v.executor.phase1_escapeManoeuver(this.teams, v)) {
                    manoeuvers.set(v, roll(v.crew.pilot));
                } else {
                    manoeuvers.set(v, 0);
                }
            });

            let attacks: Attack[] = [];
            (await this.forEachVessel(async (team, v) => {
                return v.executor.phase2_planAttacks(this.teams, v);
            })).forEach(grp => attacks.push(...grp));
            
            let damages: Damages[] = [];
            for(let attack of attacks) {
                let pwr = roll(attack.attacker);
                let dmg: Damages;

                if(pwr === 0) {
                    dmg = {attack, state: "MISSED"};
                } else if(pwr <= (manoeuvers.get(attack.target.vessel) ?? 0)) {
                    dmg = {attack, state: "AVOID"};
                } else {
                    dmg = {
                        attack,
                        value: attack.source.weapon.fire(false),
                        state: "TOUCH"
                    }
                }

                damages.push(dmg);
                this.dispatch("attack", dmg);
            }

            for(let damage of damages) {
                damage.attack.target.vessel.executor.phase3_applyDamages(damage);
            }

            await this.forEachVessel(async (team, v) => {
                v.executor.phase4_redispatchEnergy(this.teams, v);
            });
        }

        console.info("===========================")
        let result: any = {}
        for(let team of this.teams) {
            result[team.name] = (team.isKo() ? "DEFEAT" : "VICTORY");
            console.info("TEAM " + team.name + " : " + (team.isKo() ? "DEFEAT" : "VICTORY"));
            for(let vessel of team.vessels.map(v =>v.vessel)) {
                console.info("   " + vessel.name + " : " + (vessel.isKo() ? "DEFEATED" : "OK"));
            }
        }
        return result;
    }

    
    private dispatch(event: BattleManagerEvent, data?: any) {
        for(let listener of (this.listeners[event] ?? [])) {
            listener();
        }
    }

    private async forEachVessel<T>(consumer: (team: Team, vessel: FullVessel) => Promise<T>) {
        let promises = [];
        for(let team of this.teams) {
            for(let party of team.vessels) {
                promises.push(consumer(team, party));
            }
        }
        return Promise.all(promises);
    } 
}



/** TEST CASES */

let bm = new BattleManager();
Promise.all([
    VesselLibrary.loadClass({class: "NX", faction: "humains", designation: "NX-01"}),
    VesselLibrary.loadClass({class: "Oiseau de guerre", faction: "romuliens", designation: "BW5"})
]).then(([nx1, bw1]) => {
    if(!(nx1 && bw1)) return;

    nx1.installAllBehaviors();
    bw1.installAllBehaviors();

    bm.createAndAddTeam("Federation", {
        executor: new DumbAIExecutor(),
        vessel: nx1,
        crew: {
            pilot: { skill: 13, attribute: 2 },
            tactical: { skill: 8, attribute: 4 },
            engineer: { skill: 10, attribute: 2 }
        }
    });
    bm.createAndAddTeam("Romulans", {
        executor: new DumbAIExecutor(),
        vessel: bw1,
        crew: {
            pilot: { skill: 7, attribute: 3 },
            tactical: { skill: 15, attribute: 2 },
            engineer: { skill: 10, attribute: 2 }
        }
    });


    let stats = [];
    for(let i=0; i<1; i++) {
        stats.push(bm.run());
        bm.teams.forEach(t => t.vessels.forEach(v => v.vessel.repairAll()));
    }
    Promise.all(stats).then((res) => {
        let data: any = {}
        for(let r of res) {
            for(let team in r) {
                if(!(team in data)) {
                    data[team] = {
                        "VICTORY": 0,
                        "DEFEAT": 0
                    }
                }
                data[team][r[team]]++;     
            }
        }

        console.info(data);
    })
})