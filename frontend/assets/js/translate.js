const textInput = document.getElementById("text-input")
const translationOutput = document.getElementById("translation-output")

textInput.oninput = onTextChange;

let cachedSentences = new Map();

function onTextChange() {
    const inputSentenceEntries = getInputSentences();
    for (const sentenceEntry of inputSentenceEntries) {
        if (!sentenceEntry.edited) {
            translateSentence(sentenceEntry.sentence, "en", "de")
            continue
        }

        debounce(function () {
            translateSentence(sentenceEntry.sentence, "en", "de")
        }, 2000)
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
        const translation = getCachedSentence(sentenceEntry.sentence, "en", "de") // todo
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

    if (response.status !== 200){
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
