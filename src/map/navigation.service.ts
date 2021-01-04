import { Distance } from "./objects.model";

export const WARP_1 = 1;
export const WARP_2 = 15;
export const WARP_3 = 57;
export const WARP_4 = 150;
export const WARP_5 = 370;
export const WARP_6 = 720;
export const WARP_7 = 1500;
export const WARP_8 = 2840;
export const WARP_9 = 5600;
const WARPS = [WARP_1, WARP_2, WARP_3, WARP_4, WARP_5, WARP_6, WARP_7, WARP_8, WARP_9]

export function timeStr(distance: Distance, speed: number) {
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