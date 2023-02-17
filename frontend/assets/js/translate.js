let cachedSentences = new Map();

function getCachedSentence(srcSentence, dstLang) {
    const cacheEntry = cachedSentences.get(srcSentence) || new Map()

    return cacheEntry.get(dstLang)
}

function setCachedSentence(srcSentence, dstSentence, dstLang) {
    const cacheEntry = cachedSentences.get(srcSentence) || new Map()
    cacheEntry.set(dstLang, dstSentence)
    cachedSentences.set(srcSentence, cacheEntry)
}

async function translateSentence(sentence, dstLang, updateCacheCallback) {
    const cachedTranslatedSentence = getCachedSentence(sentence, dstLang)
    if (cachedTranslatedSentence !== undefined) {
        return
    }
    setCachedSentence(sentence, null, dstLang)

    const requestBody = {
        destinationLanguage: dstLang,
        sourceText: sentence,
    }

    const response = await fetch('/translate', {
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

    setCachedSentence(sentence, translatedSentence, dstLang)
    updateCacheCallback()
}



export {getCachedSentence, translateSentence};
