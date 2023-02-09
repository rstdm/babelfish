import {franc, francAll} from 'https://esm.sh/franc@6?bundle'
import langs from "https://esm.sh/langs@2"

const importantLanguages = ["de", "en", "fr", "it", "pt", "es"]
const supportedLanguages = ["af", "am", "ar", "ast", "az", "ba", "be", "bg", "bn", "br", "bs", "ca", "ceb", "cs", "cy",
    "da", "de", "el", "en", "es", "et", "fa", "ff", "fi", "fr", "fy", "ga", "gd", "gl", "gu", "ha", "he", "hi", "hr",
    "ht", "hu", "hy", "id", "ig", "ilo", "is", "it", "ja", "jv", "ka", "kk", "km", "kn", "ko", "lb", "lg", "ln", "lo",
    "lt", "lv", "mg", "mk", "ml", "mn", "mr", "ms", "my", "ne", "nl", "no", "ns", "oc", "or", "pa", "pl", "ps", "pt",
    "ro", "ru", "sd", "si", "sk", "sl", "so", "sq", "sr", "ss", "su", "sv", "sw", "ta", "th", "tl", "tn", "tr", "uk",
    "ur", "uz", "vi", "wo", "xh", "yi", "yo", "zh", "zu"]

let cachedSentences = new Map();

const sourceLanguageSelect = document.getElementById("source-language-select")
const destinationLanguageSelect = document.getElementById("destination-language-select")
populateLanguageSelect(sourceLanguageSelect)
populateLanguageSelect(destinationLanguageSelect)
sourceLanguageSelect.onchange = onChange
destinationLanguageSelect.onchange = onChange

const textInput = document.getElementById("text-input")
textInput.oninput = onInput;
textInput.onchange = onChange;

const translationOutput = document.getElementById("translation-output")

function populateLanguageSelect(select) {
    const names = new Intl.DisplayNames("de", {
        type: "language",
        languageDisplay: "standard",
    });

    for (const importantLanguage of importantLanguages) {
        const languageName = names.of(importantLanguage);
        addOptionToSelect(select, importantLanguage, languageName)
    }

    // https://stackoverflow.com/questions/899148/html-select-option-separator
    const divider = document.createElement('option')
    divider.disabled = true
    divider.innerText = "──────────"
    select.appendChild(divider)

    let sortedLanguages = [];
    for (const supportedLanguage of supportedLanguages) {
        const languageName = names.of(supportedLanguage);
        const entry = [supportedLanguage, languageName]
        sortedLanguages.push(entry)
    }

    // sort by name
    sortedLanguages = sortedLanguages.sort((a, b) => a[1].localeCompare(b[1]))
    for (const entry of sortedLanguages) {
        addOptionToSelect(select, entry[0], entry[1])
    }
}

function addOptionToSelect(select, value, text) {
    const option = document.createElement('option')
    option.innerText = text
    option.value = value

    select.appendChild(option)
}

function getSourceLanguage() {
    const sourceLang = sourceLanguageSelect.value
    if (sourceLang !== "") {
        return sourceLang
    }

    const detectedLang = detectLanguage(textInput.value)
    if (detectedLang === "") {
        return ""
    }

    sourceLanguageSelect.value = detectedLang
    return detectedLang
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

function getDestinationLanguage() {
    return destinationLanguageSelect.value
}

// onInput is called after every key press. The currently edited sentence is therefore constantly changing and shouldn't
// be translated. The current sentence is only translated if the user stops typing.
function onInput() {
    const sourceLang = getSourceLanguage()
    if (sourceLang === "") {
        return
    }

    const destLang = getDestinationLanguage()
    const inputSentenceEntries = getInputSentences();
    for (const sentenceEntry of inputSentenceEntries) {
        if (!sentenceEntry.edited) {
            translateSentence(sentenceEntry.sentence, sourceLang, destLang)
            continue
        }

        debounce(function () {
            translateSentence(sentenceEntry.sentence, sourceLang, destLang)
        }, 2000)
    }
    updateOutput()
}

// onChange is called if the user is done editing. This happens 1) if the user selects a language or 2) if the cursor
// leaves the text input. In any case the whole text should be translated.
function onChange() {
    const sourceLang = getSourceLanguage()
    if (sourceLang === "") {
        return
    }

    const destLang = getDestinationLanguage()
    const inputSentenceEntries = getInputSentences();
    for (const sentenceEntry of inputSentenceEntries) {
        translateSentence(sentenceEntry.sentence, sourceLang, destLang)
    }
    updateOutput()
}

function getInputSentences() {
    const text = textInput.value;
    const cursorLocation = textInput.selectionStart;

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

        const sentenceEdited = cursorLocation > sentenceStart && cursorLocation <= sentenceEnd

        const entry = {
            'sentence': sentence,
            'edited': sentenceEdited,
        }
        result.push(entry)
    }

    return result
}

function updateOutput() {
    const sourceLang = getSourceLanguage()
    if (sourceLang === "") {
        return
    }

    const destLang = getDestinationLanguage()

    const spans = []

    const sentenceEntries = getInputSentences();

    let insertLoadingSpan = true;
    for (const sentenceEntry of sentenceEntries) {
        const span = document.createElement('span')
        const translation = getCachedSentence(sentenceEntry.sentence, sourceLang, destLang)
        if (translation === undefined || translation === null) {
            if (insertLoadingSpan) {
                span.innerHTML = " <i>Lädt...</i>"
                insertLoadingSpan = false;
            }
        } else {
            span.innerText = translation
            insertLoadingSpan = true;
        }

        spans.push(span)
    }

    while (translationOutput.lastElementChild) {
        translationOutput.removeChild(translationOutput.lastElementChild);
    }
    spans.forEach(span => translationOutput.appendChild(span))

}

function getCachedSentence(srcSentence, srcLang, dstLang) {
    const lookupKey = `${srcLang}-${dstLang}`
    const cacheEntry = cachedSentences.get(srcSentence) || new Map()

    return cacheEntry.get(lookupKey)
}

function setCachedSentence(srcSentence, dstSentence, srcLang, dstLang) {
    const lookupKey = `${srcLang}-${dstLang}`
    const cacheEntry = cachedSentences.get(srcSentence) || new Map()
    cacheEntry.set(lookupKey, dstSentence)
    cachedSentences.set(srcSentence, cacheEntry)
}

async function translateSentence(sentence, srcLang, dstLang) {
    const cachedTranslatedSentence = getCachedSentence(sentence, srcLang, dstLang)
    if (cachedTranslatedSentence !== undefined) {
        return
    }
    setCachedSentence(sentence, null, srcLang, dstLang)

    const requestBody = {
        sourceLanguage: srcLang,
        destinationLanguage: dstLang,
        sourceText: sentence,
    }

    const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
    });

    if (response.status !== 200) {
        const errorMessage = "Failed to retrieve translation from the server. URL: " + response.url +
            " Status: " + response.status + " Response Body: " + await response.text();
        throw new Error(errorMessage)
    }
    const responseBody = await response.json()
    let translatedSentence = responseBody.translatedText;

    // the translation removes whitespace (which included linebreaks). We cannot magically add linebreaks within the sentence,
    // but we can at least add it at the beginning and at the end of sentences.
    let leadingWhitespace = sentence.match("^\\s*")
    let trailingWhitespace = sentence.match("\\s*$")
    translatedSentence = leadingWhitespace + translatedSentence + trailingWhitespace;

    setCachedSentence(sentence, translatedSentence, srcLang, dstLang)
    updateOutput();
}

// simplified version of
var timeout;

function debounce(func, wait) {
    // 'private' variable for instance
    // The returned function will be able to reference this due to closure.
    // Each call to the returned function will share this common timer.


    // This is the basic debounce behaviour where you can call this
    //   function several times, but it will only execute once
    //   (before or after imposing a delay).
    //   Each time the returned function is called, the timer starts over.
    clearTimeout(timeout);

    // Set the new timeout
    timeout = setTimeout(function () {

        // Inside the timeout function, clear the timeout variable
        // which will let the next execution run when in 'immediate' mode
        timeout = null;

        // Call the original function with apply
        // apply lets you define the 'this' object as well as the arguments
        //    (both captured before setTimeout)
        func();
    }, wait);

}
