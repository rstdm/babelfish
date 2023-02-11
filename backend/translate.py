from threading import Lock

from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer, MarianTokenizer, MarianMTModel

from language import Language

# load model and tokenizer.
model_name = "Helsinki-NLP/opus-mt-ine-ine"
tokenizer = MarianTokenizer.from_pretrained(model_name)
model = MarianMTModel.from_pretrained(model_name)


def translate(destination_language: Language, source_text: str) -> str:
    if source_text.strip() == "":
        # if the text only contains whitespace we don't have to translate the text
        return source_text

    # Quoting the documentation at https://huggingface.co/docs/transformers/model_doc/marian#multilingual-models:
    # "If a model can output multiple languages, and you should specify a language code by prepending the desired output
    # language to the src_text."
    # In my opinion this is a horrible idea, but I didn't create this model...
    # We don't have to specify the source language: "Note that if a model is only multilingual on the source side,
    # like Helsinki-NLP/opus-mt-roa-en, no language codes are required."
    source_text = f'>>{destination_language}<< {source_text}'

    translated = model.generate(**tokenizer([source_text], return_tensors="pt", padding=True))
    return tokenizer.decode(translated[0], skip_special_tokens=True)
