

export const DefaultSettings = {
    warpFactor1: 1,
    warpFactor2: 15,
    warpFactor3: 57,
    warpFactor4: 150,
    warpFactor5: 370,
    warpFactor6: 720,
    warpFactor7: 1500,
    warpFactor8: 2840,
    warpFactor9: 5600,
};

export type Settings = typeof DefaultSettings;
export type SettingsKeys = keyof Settings;

export let CurrentSettings: Settings = {...DefaultSettings};
export function patchSettings(settings: {[key in SettingsKeys]?: typeof DefaultSettings[key]}) {
    for(let key in settings) {
        (CurrentSettings as any)[key] = (settings as any)[key];
    }
}