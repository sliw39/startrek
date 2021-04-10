import { HexaCalc } from "./hexagon";
import { Behavior, DefensePart, EnergyPart, Part, PartState } from "./vessel";

export const BEHAVIORS: {[key: string]: Behavior} = {};

export function registerBehavior(behavior: Behavior) {
    BEHAVIORS[behavior.name] = behavior;
}

registerBehavior({
    name: 'on-destroy-kill-damage-neightbors',
    install(part: Part) {
        part.onStateChanged((newState) => {
            if(newState === "DESTROYED") {
                for(let c of HexaCalc.neighbors(part.position)) {
                    part.parent?.get(c).damage(1);
                }
            } 
        })
    }
});

registerBehavior({
    name: 'absorb-direct-neighbors-damage',
    install(part: Part) {
        for(let c of HexaCalc.neighbors(part.position)) {
            part.parent?.get(c).onDamage((n, o, p) => {
                let value = o-n;
                if(value > part.currentValue) {
                    p.repair(value - part.currentValue, false)
                    part.damage(part.currentValue, false);
                } else {
                    p.repair(value, false);
                    part.damage(value, false);
                }
            });
        }
    }
});

registerBehavior({
    name: 'dammage-after-fire',
    install(part: Part) {
        if(part instanceof DefensePart) {
            part.onFire(value => part.damage(value, false));
        }
    }
});

registerBehavior({
    name: 'energy-depleted',
    install(part: Part) {
        if(part instanceof EnergyPart) {
            part.onStateChanged(value => {
                if(["DESTROYED", "OFFLINE"].indexOf(value) !== -1) {
                    let energy = part.energy;
                    let ttl = 3;
                    while(ttl-- > 0 && energy > 0) {
                        HexaCalc.propagate(part.position, cell => {
                            let x = part.parent?.get(cell);
                            if(x?.currentValue || 0 > 0) {
                                x?.damage(1);
                            }
                            return energy-- > 0 ? "NEXT" : "STOP";
                        });
                    } 
                }
            });
        }
    }
});
