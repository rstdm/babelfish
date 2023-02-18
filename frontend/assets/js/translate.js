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

    let response = null;
    while (true) { // The nginx proxy returns a 504 status code (Gateway Timeout) after the request has been pending for 60 seconds
        response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        if (response.status === 200) {
            break
        }

        const errorMessage = "Failed to retrieve translation from the server. Retrying... URL: " + response.url +
            " Status: " + response.status + " Response Body: " + await response.text();
        console.log(errorMessage)

        if (response.status === 502 || response.status === 503) { // Bad Gateway or Service Unavailable: babelfish-backend container is not running
            // https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
        await new Promise(r => setTimeout(r, 2000)); // wait for two seconds before retrying
        }
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
