import {importantLanguages, supportedLanguages} from "./language.js";

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

export {populateLanguageSelect}