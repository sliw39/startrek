export const SPECIES = [ "humains", "vulcains", "andoriens", "lisiens", "satariens", "hologrammes", "klingons", "denobuliens", "romuliens", "borgs"];
export const HOMONYMS = {
    "humains": [ 'humains', 'humain', 'humans', 'human', 'homme', 'hommes', 'man', 'men', 'starfleet'],
    "vulcains": [ 'vulcains', 'vulcain', 'vulcans', 'vulcan' ],
    "andoriens": [ 'andoriens', 'andorans', 'andorians', 'andoran', 'andorian' ],
    "lisiens": [ 'lisiens', 'lisien', 'lisian', 'lisians' ],
    "satariens": [ 'satariens', 'satarien', 'satarans', 'sataran', 'satarian', 'satarians' ],
    "hologrammes": [ 'hologrammes', 'hologramme', 'holograms', 'hologram' ],
    "klingons": [ 'klingons', 'klingon' ],
    "denobuliens": [ 'denobuliens', 'denobulien', 'dénobuliens', 'dénobulien', 'denobulian', 'denobulians', 'denobulan', 'denobulans' ],
    "romuliens": [ 'romuliens', 'romulien', 'romulian', 'romulians', 'romulan', 'romulans' ],
    "borgs": ["borgs", "borg"],
    "fédération": ["fédération", "federation", "ufp", "united federation of planets"],
    "tholiens": ["tholiens", "tholien", "tholians", "tholian"]
}
export const FOLDED_HOMONYMS = (function() {
    let result: {[key: string]: string} = {};
    for(let key in HOMONYMS) {
        for(let homonym of (HOMONYMS as any)[key]) {
            result[homonym] = key;
        }
    }
    return result;
})();
export function foldHomonyms(specie: string) {
    return FOLDED_HOMONYMS[specie] ?? specie;
}
export const ALIANCES = {
    "fédération": ["humains", "andoriens"],
    "maquis": ["humains", "bajoriens"]
}
export const LOGO: {[key: string]: string} = {
    "humains": "static/starfleet.png",
    "andoriens": "static/andoran.png",
    "bajoriens": "static/bajoran.png",
    "borgs": "static/borg.png",
    "denobuliens": "static/denobulan.png",
    "ferengis": "static/ferengi.png",
    "kazons": "static/kazon.png",
    "klingons": "static/klingon.png",
    "maquis": "static/maquis.png",
    "romuliens": "static/romulian.png",
    "tholiens": "static/tholian.png",
    "fédération": "static/ufp.png",
    "vulcains": "static/vulcan.png",
}