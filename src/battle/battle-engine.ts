import { EventBus, EventBusImpl } from "../framework/event";
import { DefensePart, isRunning, Part, Vessel } from "../vessel/vessel";

export class Team {
  static idx = 0;
  constructor(public name: string, public vessels: FullVessel[] = []) {
    vessels.forEach((v) => {
      v.team = this;
      if (!v.vessel.name) {
        v.vessel.name =
          v.vessel.class + "-" + v.vessel.designation + "#" + Team.idx++;
      }
    });
  }

  isKo(): boolean {
    for (let v of this.vessels) {
      if (!v.vessel.isKo()) {
        return false;
      }
    }
    return true;
  }
}

export interface Roll {
  attribute: number;
  skill: number;
}

export interface Crew {
  pilot: Roll;
  engineer: Roll;
  tactical: Roll;
}

interface Attack {
  attacker: Roll;
  source: {
    vessel: FullVessel;
    weapon: DefensePart;
  };
  target: {
    vessel: FullVessel;
    part: Part;
  };
}

export interface Damages {
  attack: Attack;
  value?: number;
  state: "TOUCH" | "MISSED" | "AVOID";
}

export interface FullVessel {
  team?: Team;
  vessel: Vessel;
  crew: Crew;
  executor: Executor;
}

export interface Executor {
  phase1_escapeManoeuver(teams: Team[], vessel: FullVessel): Promise<boolean>;
  phase2_planAttacks(teams: Team[], vessel: FullVessel): Promise<Attack[]>;
  phase3_applyDamages(attacks: Damages): Promise<void>;
  phase4_redispatchEnergy(teams: Team[], vessel: FullVessel): Promise<void>;
}

export class DumbAIExecutor implements Executor {
  phase1_escapeManoeuver(teams: Team[], vessel: FullVessel): Promise<boolean> {
    return Promise.resolve(Math.random() > 0.5);
  }
  phase2_planAttacks(teams: Team[], vessel: FullVessel): Promise<Attack[]> {
    function randomPick<T>(arr: T[]): T {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    //pick another team
    let targetTeam = randomPick(
      teams.filter(
        (t) => vessel.team && !t.isKo() && t.name !== vessel.team.name
      )
    );

    //pick a vessel
    let targetVessel = randomPick(
      targetTeam.vessels.filter((v) => !v.vessel.isKo())
    );

    //attack at random with everything online
    let atks: Attack[] = [];
    for (let weapon of vessel.vessel.cells.filter(
      (c) => c instanceof DefensePart && c.purpose === "ATK"
    ) as DefensePart[]) {
      atks.push({
        attacker: vessel.crew.tactical,
        source: { vessel, weapon },
        target: {
          vessel: targetVessel,
          part: randomPick(
            targetVessel.vessel.cells.filter((c) => isRunning(c))
          ),
        },
      });
    }

    return Promise.resolve(atks);
  }
  phase3_applyDamages(atk: Damages): Promise<void> {
    if (atk.state === "MISSED") {
      console.info(
        `${atk.attack.source.vessel.vessel.name} miss ${atk.attack.target.vessel.vessel.name}`
      );
    } else if (atk.state === "AVOID") {
      console.info(
        `${atk.attack.target.vessel.vessel.name} avoids ${atk.attack.source.vessel.vessel.name}`
      );
    } else {
      console.warn(
        `${atk.attack.source.vessel.vessel.name} hits ${
          atk.attack.target.vessel.vessel.name
        } with a ${atk.attack.source.weapon.name}, dealing ${atk.value ??
          0} damages`
      );
      atk.attack.target.part.damage(atk.value ?? 0);
    }

    return Promise.resolve();
  }
  phase4_redispatchEnergy(teams: Team[], vessel: FullVessel): Promise<void> {
    return Promise.resolve();
  }
}

export function roll(spec: Roll = { attribute: 2, skill: 10 }): number {
  let successes = 0;
  for (let i = 0; i < spec.attribute; i++) {
    let result = Math.ceil(Math.random() * 20);
    if (result === 1) {
      successes += 2;
    } else if (result === 20) {
      successes -= 2;
    } else if (result <= spec.skill) {
      successes++;
    }
  }
  return Math.max(0, successes);
}

function listenEvent<T extends ConsummableEvent>(evt: T) {
  return {
    listener: new Promise<T>((resolve) => {
      evt.consume = function() {
        resolve(evt);
      };
    }),
    evt,
  };
}

interface ConsummableEvent {
  consume?: () => void;
}
export interface TurnEvent extends ConsummableEvent {
  turn: number;
  teams: Team[];
}
export interface AttackEvent extends ConsummableEvent {
  damage: Damages;
}
export interface EndEvent extends ConsummableEvent {
  team: {
    [teamName: string]: {
      result: "VICTORY" | "DEFEAT";
      ref: Team;
      vessels: {
        result: "VICTORY" | "DEFEAT";
        ref: Vessel;
      }[];
    };
  };
}
export type BattleManagerEvent = "turn" | "attack" | "end";
export class BattleManager {
  teams: Team[] = [];
  private _eventBus = new EventBusImpl<BattleManagerEvent>(
    "turn",
    "attack",
    "end"
  );

  get event(): EventBus<BattleManagerEvent> {
    return this._eventBus;
  }

  createAndAddTeam(name: string, ...vessels: FullVessel[]) {
    return this.addTeam(new Team(name, vessels));
  }

  addTeam(team: Team) {
    this.teams.push(team);
    return this;
  }

  async run(
    stopCondition: (turn: number) => Promise<boolean> = () =>
      Promise.resolve(this.teams.filter((t) => !t.isKo()).length < 2)
  ) {
    this.forEachVessel((t, v) => {
      v.vessel.installAllBehaviors();
      return Promise.resolve();
    });
    let turn = 0;
    while (!(await stopCondition(turn))) {
      console.info("TURN " + turn);
      let { listener, evt } = listenEvent<TurnEvent>({
        turn,
        teams: this.teams,
      });
      this._eventBus.trigger<TurnEvent>("turn", evt);
      await listener;
      turn++;

      console.info("  => escape manoeuvers");
      let manoeuvers = new WeakMap<FullVessel, number>();
      await this.forEachVessel(async (team, v) => {
        if (await v.executor.phase1_escapeManoeuver(this.teams, v)) {
          manoeuvers.set(v, roll(v.crew.pilot));
        } else {
          manoeuvers.set(v, 0);
        }
      });

      console.info("  => plan attacks");
      let attacks: Attack[] = [];
      (
        await this.forEachVessel(async (team, v) => {
          return v.executor.phase2_planAttacks(this.teams, v);
        })
      ).forEach((grp) => attacks.push(...grp));

      let damages: Damages[] = [];
      for (let attack of attacks) {
        let pwr = roll(attack.attacker);
        let dmg: Damages;

        if (pwr === 0) {
          dmg = { attack, state: "MISSED" };
        } else if (pwr <= (manoeuvers.get(attack.target.vessel) ?? 0)) {
          dmg = { attack, state: "AVOID" };
        } else {
          dmg = {
            attack,
            value: attack.source.weapon.fire(false),
            state: "TOUCH",
          };
        }

        damages.push(dmg);
      }

      console.info("  => apply damages");
      for (let damage of damages) {
        let { listener, evt } = listenEvent<AttackEvent>({ damage });
        this._eventBus.trigger("attack", evt);
        await damage.attack.target.vessel.executor.phase3_applyDamages(damage);
        await listener;
      }

      console.info("  => redispatch energy");
      await this.forEachVessel(async (team, v) => {
        v.executor.phase4_redispatchEnergy(this.teams, v);
      });
    }

    let { listener, evt } = listenEvent<EndEvent>({
      team: {},
    });
    for (let team of this.teams) {
      evt.team[team.name] = {
        ref: team,
        result: team.isKo() ? "DEFEAT" : "VICTORY",
        vessels: team.vessels.map((v) => {
          return {
            result: v.vessel.isKo() ? "DEFEAT" : "VICTORY",
            ref: v.vessel,
          };
        }),
      };
    }

    this._eventBus.trigger("end", evt);
    await listener;
    return evt;
  }

  private async forEachVessel<T>(
    consumer: (team: Team, vessel: FullVessel) => Promise<T>
  ) {
    let promises = [];
    for (let team of this.teams) {
      for (let party of team.vessels) {
        promises.push(consumer(team, party));
      }
    }
    return Promise.all(promises);
  }
}
