import {franc} from 'https://esm.sh/franc@6?bundle'
import langs from "https://esm.sh/langs@2"

const importantLanguages = ["de", "en", "fr", "it", "pt", "es"]
const supportedLanguages = ["af", "am", "ar", "ast", "az", "ba", "be", "bg", "bn", "br", "bs", "ca", "ceb", "cs", "cy",
    "da", "de", "el", "en", "es", "et", "fa", "ff", "fi", "fr", "fy", "ga", "gd", "gl", "gu", "ha", "he", "hi", "hr",
    "ht", "hu", "hy", "id", "ig", "ilo", "is", "it", "ja", "jv", "ka", "kk", "km", "kn", "ko", "lb", "lg", "ln", "lo",
    "lt", "lv", "mg", "mk", "ml", "mn", "mr", "ms", "my", "ne", "nl", "no", "ns", "oc", "or", "pa", "pl", "ps", "pt",
    "ro", "ru", "sd", "si", "sk", "sl", "so", "sq", "sr", "ss", "su", "sv", "sw", "ta", "th", "tl", "tn", "tr", "uk",
    "ur", "uz", "vi", "wo", "xh", "yi", "yo", "zh", "zu"]

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

function detectLanguage(text){
    if (text.length < 20) {
        return ""
    }

    // the backend uses mostly ISO 639-1 language codes (e.g. "de"). ISO 639-2 language codes (e.g. "deu") are only used
    // if the language doesn't have a ISO 639-1 language code
    const allowed3CharLanguages = [];
    for (const supportedLanguage of supportedLanguages) {
        if (supportedLanguage.length === 3) {
            allowed3CharLanguages.push(supportedLanguage) // this is already a ISO 639-2 language code
            continue
        }

        if (supportedLanguage === "ns") { // the entry for Northern Sotho is missing in the library
            allowed3CharLanguages.push("nso")
            continue
        }

        const langEntry = langs.where("1", supportedLanguage); // where "1", filters by ISO 639-1 language code
        allowed3CharLanguages.push(langEntry["2"]) // "2" selects the ISO 639-2 language code
    }

    const options = {
        only: allowed3CharLanguages,
    }
    const detected3CharLanguage = franc(text, options)
    if (detected3CharLanguage === "und"){ // "und" === undetermined
        return ""
    }

    if (detected3CharLanguage in supportedLanguages){ // this language doesn't have a ISO 639-1 language code
        return detected3CharLanguage
    }

    const detectedLanguageEntry = langs.where("2", detected3CharLanguage) // "2" selects the ISO 639-2 language code
    if (detectedLanguageEntry === undefined) {
        return "" // the language code conversion library doesn't know this language code
    }

    return detectedLanguageEntry["1"] // "1" selects the ISO 639-1 language code
}

export {importantLanguages, supportedLanguages, splitText, detectLanguage}