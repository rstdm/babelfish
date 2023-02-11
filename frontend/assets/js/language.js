const importantLanguages = ["deu", "eng", "fra", "ita", "por", "spa"]
const supportedLanguages = ["afr", "afr_Arab", "aln", "ang_Latn", "arg", "asm", "ast", "awa", "bel", "bel_Latn", "ben",
    "bho", "bjn", "bos_Latn", "bre", "bul", "bul_Latn", "cat", "ces", "cor", "cos", "csb_Latn", "cym", "dan", "deu",
    "dsb", "egl", "ell", "eng", "enm_Latn", "ext", "fao", "fra", "frm_Latn", "frr", "fry", "gcf_Latn", "gla", "gle",
    "glg", "glv", "gom", "gos", "got_Goth", "grc_Grek", "gsw", "guj", "hat", "hif_Latn", "hin", "hrv", "hsb", "hye",
    "hye_Latn", "ind", "isl", "ita", "jdt_Cyrl", "ksh", "kur_Arab", "kur_Latn", "lad", "lad_Latn", "lat_Grek",
    "lat_Latn", "lav", "lij", "lit", "lld_Latn", "lmo", "ltg", "ltz", "mai", "mar", "max_Latn", "mfe", "min", "mkd",
    "mwl", "nds", "nld", "nno", "nob", "nob_Hebr", "non_Latn", "npi", "oci", "ori", "orv_Cyrl", "oss", "pan_Guru",
    "pap", "pcd", "pdc", "pes", "pes_Latn", "pes_Thaa", "pms", "pnb", "pol", "por", "prg_Latn", "pus", "roh", "rom",
    "ron", "rue", "rus", "rus_Latn", "san_Deva", "scn", "sco", "sgs", "sin", "slv", "snd_Arab", "spa", "sqi", "srd",
    "srp_Cyrl", "srp_Latn", "stq", "swe", "swg", "tgk_Cyrl", "tly_Latn", "tmw_Latn", "ukr", "urd", "vec", "wln", "yid",
    "zlm_Latn", "zsm_Latn", "zza"]

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