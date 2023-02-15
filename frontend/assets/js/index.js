import {splitText} from "./language.js";
import {getCachedSentence, translateSentence} from "./translate.js";
import {populateLanguageSelect} from "./select.js";
import {debounce} from "./debounce.js";

const destinationLanguageSelect = document.getElementById("destination-language-select")
const textInput = document.getElementById("text-input")
const translationOutput = document.getElementById("translation-output")

destinationLanguageSelect.onchange = onChange

populateLanguageSelect(destinationLanguageSelect)

textInput.oninput = onInput;
textInput.onchange = onChange;

updateOutput()

// onInput is called after every key press. The currently edited sentence is therefore constantly changing and shouldn't
// be translated. The current sentence is only translated if the user stops typing.
function onInput() {
    const destLang = getDestinationLanguage()
    const inputSentenceEntries = getInputSentences();
    for (const sentenceEntry of inputSentenceEntries) {
        if (!sentenceEntry.edited) {
            translateSentence(sentenceEntry.sentence, destLang)
            continue
        }

        debounce(function () {
            translateSentence(sentenceEntry.sentence, destLang)
        }, 500)
    }
    updateOutput()
}

// onChange is called if the user is done editing. This happens 1) if the user selects a language or 2) if the cursor
// leaves the text input. In any case the whole text should be translated.
function onChange() {
    const destLang = getDestinationLanguage()
    const inputSentenceEntries = getInputSentences();
    for (const sentenceEntry of inputSentenceEntries) {
        translateSentence(sentenceEntry.sentence, destLang)
    }
    updateOutput()
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
    const destLang = getDestinationLanguage()

    const spans = []
    const sentenceEntries = getInputSentences();

    let insertLoadingSpan = true;
    for (const sentenceEntry of sentenceEntries) {
        const span = document.createElement('span')
        const translation = getCachedSentence(sentenceEntry.sentence, destLang)
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

    if (spans.length === 0) {
        const span = document.createElement('span')
        span.innerHTML = "Wenn Sie auf der linken Seite Text eingeben, erscheint hier die Übersetzung."
        span.style.color = "gray"
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

export {updateOutput}


