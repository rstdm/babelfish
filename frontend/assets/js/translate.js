document.getElementById("text-input").oninput = onTextChange;

let cachedSentences = new Map();

function onTextChange(event){
    const text = event.target.value;
    const sentenceMatches = text.matchAll("[^.!?]*[.!?]? ?");// text.split(/([.!?]) /g) would remove the delimiter

    const translatedSentences = []

    for (const sentenceMatch of sentenceMatches) {
        const sentence = sentenceMatch[0].trim()
        if (sentence === "") {
            continue
        }

        const translatedSentence = translateSentence(sentence, "en", "de")
        translatedSentences.push(translatedSentence)
    }

    return translatedSentences.join(" ")
}

function translateSentence(sentence, srcLang, dstLang){
    const lookupKey = `${srcLang}-${dstLang}`
    const cacheEntry = cachedSentences.get(sentence) || new Map()

    const cachedTranslatedSentence = cacheEntry.get(lookupKey)
    if (cachedTranslatedSentence !== undefined){
        return cachedTranslatedSentence
    }

    console.log("translating", sentence)
    const translatedSentence = sentence;

    cacheEntry.set(lookupKey, translatedSentence)
    cachedSentences.set(sentence, cacheEntry)

    return translatedSentence
}