import { Distance } from "./objects.model";
import { CurrentSettings as S } from "./settings.model";

export function timeStr(distance: Distance, speed: number) {
    const WARPS = [S.warpFactor1, S.warpFactor2, S.warpFactor3, S.warpFactor4, S.warpFactor5, S.warpFactor6, S.warpFactor7, S.warpFactor8, S.warpFactor9]
    let t = distance.al / WARPS[speed-1];
    if(t >= 3) {
        return t.toFixed(1) + " ans";
    }
    t *= 12;
    if(t >= 2) {
        return t.toFixed(1) + " mois";
    }
    t = t/12*365;
    if(t >= 3) {
        return t.toFixed(1) + " jours";
    }
    t *= 24;
    if(t >= 3) {
        return t.toFixed(1) + " heures";
    }
    t *= 60;
    if(t >= 3) {
        return t.toFixed(1) + " minutes";
    }
    t *= 60;
    return t.toFixed(1) + " secondes";
}