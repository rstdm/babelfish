import {detectLanguage, splitText} from "./language.js";
import {getCachedSentence, translateSentence} from "./translate.js";
import {populateLanguageSelect} from "./select.js";
import {debounce} from "./debounce.js";

const sourceLanguageSelect = document.getElementById("source-language-select")
const destinationLanguageSelect = document.getElementById("destination-language-select")
const textInput = document.getElementById("text-input")
const translationOutput = document.getElementById("translation-output")

sourceLanguageSelect.onchange = onChange
destinationLanguageSelect.onchange = onChange

populateLanguageSelect(sourceLanguageSelect)
populateLanguageSelect(destinationLanguageSelect)

textInput.oninput = onInput;
textInput.onchange = onChange;

// onInput is called after every key press. The currently edited sentence is therefore constantly changing and shouldn't
// be translated. The current sentence is only translated if the user stops typing.
function onInput() {
    const sourceLang = getSourceLanguage()
    if (sourceLang === "") {
        displayLanguageSelectHint()
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
        displayLanguageSelectHint()
        return
    }

    const destLang = getDestinationLanguage()
    const inputSentenceEntries = getInputSentences();
    for (const sentenceEntry of inputSentenceEntries) {
        translateSentence(sentenceEntry.sentence, sourceLang, destLang)
    }
    updateOutput()
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

function getDestinationLanguage() {
    return destinationLanguageSelect.value
}

function getInputSentences() {
    const text = textInput.value;
    let cursorLocation = textInput.selectionStart;

    return splitText(text, cursorLocation)
}

function updateOutput() {
    const sourceLang = getSourceLanguage()
    if (sourceLang === "") {
        displayLanguageSelectHint()
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

    // remove old spans
    removeAllChildren(translationOutput)

    // insert new spans
    spans.forEach(span => translationOutput.appendChild(span))

}

function removeAllChildren(element) {
    while (element.lastElementChild) {
        element.removeChild(element.lastElementChild);
    }
}

function displayLanguageSelectHint(){
    removeAllChildren(translationOutput)

    // This message should only be displayed if the user already entered some text
    if (textInput.value.length == 0){
        return;
    }

    const span = document.createElement('span')
    span.innerHTML = " <i>Bitte wählen Sie die Sprache aus, in der Sie ihren Text verfasst haben. Alternativ können " +
        "Sie noch mehr Text eingeben. Die Sprache wird dann automatisch erkannt.</i>"
    translationOutput.appendChild(span)
}


export {updateOutput}


