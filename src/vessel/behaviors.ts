import { TrekEvent } from "../framework/event";
import { HexaCalc } from "./hexagon";
import {
  Behavior,
  DefensePart,
  EnergyPart,
  ifRunning,
  Part,
  PartState,
  StateChangeEvent,
  ValueChangeEvent,
} from "./vessel";

export const BEHAVIORS: { [key: string]: Behavior } = {};

export function registerBehavior(behavior: Behavior) {
  BEHAVIORS[behavior.name] = behavior;
}

export function resolveBehaviors(behaviors: string[] = []) {
  return behaviors.map((b) => BEHAVIORS[b]).filter((b) => b !== undefined);
}

registerBehavior({
  name: "on-destroy-damage-neightbors",
  install(part: Part) {
    part.event.on<StateChangeEvent>("afterStateChange", (evt) => {
      if (evt.data?.state === "DESTROYED") {
        for (let c of HexaCalc.neighbors(part.position)) {
          part.parent?.get(c)?.damage(1);
        }
      }
    });
  },
});

function absorbDamage(part: Part, evt: TrekEvent<ValueChangeEvent>) {
  ifRunning(part, () => {
    let maxCapacity = part.currentValue;
    let damageToAbsorb = evt.data.oldValue - evt.data.value;

    if (damageToAbsorb <= maxCapacity) {
      evt.data.value = evt.data.oldValue;
      part.define(maxCapacity - damageToAbsorb);
      evt.stop();
    } else {
      evt.data.value += maxCapacity;
      part.state = "OFFLINE";
      part.define(0);
    }
  });
}

registerBehavior({
  name: "absorb-direct-neighbors-damage",
  install(part: Part) {
    for (let c of HexaCalc.neighbors(part.position)) {
      part.parent?.get(c)?.event.on<ValueChangeEvent>("beforeDamage", (evt) => {
        absorbDamage(part, evt);
      });
    }
  },
});

registerBehavior({
  name: "absorb-2-neighbors-damage",
  install(part: Part) {
    HexaCalc.propagate(part.position, (cell, circle, distance) => {
      if (distance > 2) {
        return "STOP";
      }
      part.parent
        ?.get(cell)
        ?.event.on<ValueChangeEvent>("beforeDamage", (evt) => {
          absorbDamage(part, evt);
        });
      return "NEXT";
    });
  },
});

registerBehavior({
  name: "dammage-after-fire",
  install(part: Part) {
    if (part instanceof DefensePart) {
      part.onFire((value) => part.damage(value, false));
    }
  },
});

registerBehavior({
  name: "energy-depleted",
  install(part: Part) {
    if (part instanceof EnergyPart) {
      part.event.on<StateChangeEvent>("afterStateChange", (evt) => {
        if (["DESTROYED", "OFFLINE"].indexOf(evt.data.state) !== -1) {
          let energy = part.energy;
          let ttl = 3;
          while (ttl-- > 0 && energy > 0) {
            HexaCalc.propagate(part.position, (cell) => {
              let x = part.parent?.get(cell);
              if (x && (x.currentValue ?? 0) > 0) {
                x.define(x.currentValue - 1);
              }
              return energy-- > 0 ? "NEXT" : "STOP";
            });
          }
        }
      });
    }
  },
});

registerBehavior({
  name: "ignore-1-damage",
  install(part: Part) {
    // HexaCalc.propagate(part.position, cell => {
    // part.parent?.get(cell)?.onDamage((n,o,p) => {
    // ifRunning(part, () => {
    // p.repair(Math.min(1, Math.abs(o-n)), false);
    // });
    // });
    // return "NEXT";
    // });
  },
});
