const importantLanguages = ["deu", "eng", "fra", "ita", "por", "spa"]
const supportedLanguages = ["afr", "ang_Latn", "arg", "asm", "ast", "bel", "bel_Latn", "ben",
    "bos_Latn", "bre", "bul", "bul_Latn", "cat", "ces", "cor", "csb_Latn", "cym", "dan", "deu",
    "ell", "eng", "fao", "fra", "fry", "gla", "gle",
    "glg", "glv", "guj", "hat", "hin", "hrv", "hsb", "hye",
    "ind", "isl", "ita", "kur_Arab", "kur_Latn",
    "lat_Latn", "lav", "lit", "ltg", "ltz", "mai", "mar", "mfe", "min", "mkd",
    "mwl", "nds", "nld", "nno", "nob", "oci", "ori", "oss", "pan_Guru",
    "pap", "pes", "pol", "por", "pus", "rom",
    "ron", "rus", "rus_Latn", "san_Deva", "sin", "slv", "snd_Arab", "spa", "sqi",
    "srp_Cyrl", "srp_Latn", "swe", "tgk_Cyrl", "ukr", "urd", "wln", "yid",
    "zlm_Latn"]

function splitText(text, cursorLocation) {
    const re = new RegExp("[^.!?]+[.!?]?|[.!?]", "dg"); // text.split(/([.!?]) /g) would remove the delimiter

    const result = []
    let match;
    while (match = re.exec(text)) {
        const sentence = match[0];
        if (sentence === "") {
            continue
        }

        const sentenceStart = match.indices[0][0];
        const sentenceEnd = match.indices[0][1];

        let sentenceEdited = false;
        if (cursorLocation !== null) {
            sentenceEdited = cursorLocation > sentenceStart && cursorLocation <= sentenceEnd
        }

        const entry = {
            'sentence': sentence,
            'edited': sentenceEdited,
        }
        result.push(entry)
    }

    return result
}

export {importantLanguages, supportedLanguages, splitText}