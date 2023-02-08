const importantLanguages = ["de", "en", "fr", "it", "pt", "es"]
const languageCodes = new Map(Object.entries({
    "af": "Afrikaans",
    "am": "Amharisch",
    "ar": "Arabisch",
    "ast": "Asturisch",
    "az": "Aserbaidschanisch",
    "ba": "Baschkirisch",
    "be": "Belarussisch",
    "bg": "Bulgarisch",
    "bn": "Bengalisch",
    "br": "Bretonisch",
    "bs": "Bosnisch",
    "ca": "Katalanisch",
    "ceb": "Cebuano",
    "cs": "Tschechisch",
    "cy": "Walisisch",
    "da": "Dänisch",
    "de": "Deutsch",
    "el": "Griechisch",
    "en": "Englisch",
    "es": "Spanisch",
    "et": "Estnisch",
    "fa": "Persisch",
    "ff": "Fulfulde",
    "fi": "Finnisch",
    "fr": "Französisch",
    "fy": "Westfriesisch",
    "ga": "Irisch",
    "gd": "Schottisch-gälisch",
    "gl": "Galicisch",
    "gu": "Gujarati",
    "ha": "Hausa",
    "he": "Hebräisch",
    "hi": "Hindi",
    "hr": "Kroatisch",
    "ht": "Haitianisch",
    "hu": "Ungarisch",
    "hy": "Armenisch",
    "id": "Indonesisch",
    "ig": "Igbo",
    "ilo": "Ilokano",
    "is": "Isländisch",
    "it": "Italienisch",
    "ja": "Japanisch",
    "jv": "Javanisch",
    "ka": "Georgisch",
    "kk": "Kasachisch",
    "km": "Khmer",
    "kn": "Kannada",
    "ko": "Koreanisch",
    "lb": "Luxemburgisch",
    "lg": "Luganda",
    "ln": "Lingála",
    "lo": "Laotisch",
    "lt": "Litauisch",
    "lv": "Lettisch",
    "mg": "Malagasy",
    "mk": "Mazedonisch",
    "ml": "Malayalam",
    "mn": "Mongolisch",
    "mr": "Marathi",
    "ms": "Malaiisch",
    "my": "Birmanisch",
    "ne": "Nepali",
    "nl": "Niederländisch",
    "no": "Norwegisch",
    "ns": "Nord-Sotho",
    "oc": "Okzitanisch",
    "or": "Oriya",
    "pa": "Panjabi",
    "pl": "Polnisch",
    "ps": "Paschtunisch",
    "pt": "Portugiesisch",
    "ro": "Rumänisch",
    "ru": "Russisch",
    "sd": "Sindhi",
    "si": "Singhalesisch",
    "sk": "Slowakisch",
    "sl": "Slowenisch",
    "so": "Somali",
    "sq": "Albanisch",
    "sr": "Serbisch",
    "ss": "Siswati",
    "su": "Sundanesisch",
    "sv": "Schwedisch",
    "sw": "Swahili",
    "ta": "Tamil",
    "th": "Thai",
    "tl": "Tagalog",
    "tn": "Setswana",
    "tr": "Türkisch",
    "uk": "Ukrainisch",
    "ur": "Urdu",
    "uz": "Usbekisch",
    "vi": "Vietnamesisch",
    "wo": "Wolof",
    "xh": "isiXhosa",
    "yi": "Jiddisch",
    "yo": "Yoruba",
    "zh": "Chinesisch",
    "zu": "isiZulu",
}))

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
    for (const importantLanguage of importantLanguages) {
        addOptionToSelect(select, importantLanguage, languageCodes.get(importantLanguage))
    }

    // https://stackoverflow.com/questions/899148/html-select-option-separator
    const divider = document.createElement('option')
    divider.disabled = true
    divider.innerText = "──────────"
    select.appendChild(divider)

    const sortedLanguages = [...languageCodes.entries()].sort((a, b) => a[1].localeCompare(b[1]))
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

function getSourceLanguage(){
    return sourceLanguageSelect.value
}

function getDestinationLanguage(){
    return destinationLanguageSelect.value
}

// onInput is called after every key press. The currently edited sentence is therefore constantly changing and shouldn't
// be translated. The current sentence is only translated if the user stops typing.
function onInput() {
    const sourceLang = getSourceLanguage()
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
    const spans = []

    const sentenceEntries = getInputSentences();

    let insertLoadingSpan = true;
    for (const sentenceEntry of sentenceEntries) {
        const span = document.createElement('span')
        const translation = getCachedSentence(sentenceEntry.sentence, getSourceLanguage(), getDestinationLanguage())
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
