import {updateOutput} from "./index.js";

let cachedSentences = new Map();

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



export {getCachedSentence, translateSentence};
