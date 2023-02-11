from threading import Lock

from transformers import MarianTokenizer, MarianMTModel

from language import Language

# load model and tokenizer.
model_name = "Helsinki-NLP/opus-mt-ine-ine"
print("loading tokenizer")  # this takes a few seconds...
tokenizer = MarianTokenizer.from_pretrained(model_name)
print("loading model")  # this takes a few seconds...
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

    tokens = tokenizer([source_text], return_tensors="pt", padding=True)

    # the model specifies the value of max_length in its generation_config.json file:
    # https://huggingface.co/Helsinki-NLP/opus-mt-ine-ine/blob/467b0f37b929d0cae6d8db2eb994a1af39916f19/generation_config.json#L12
    # However, this generates this warning:
    #       /lib/python3.10/site-packages/transformers/generation/utils.py:1273: UserWarning: Neither `max_length` nor
    #       `max_new_tokens` has been set, `max_length` will default to 512 (`generation_config.max_length`).
    #       Controlling `max_length` via the config is deprecated and `max_length` will be removed from the config in
    #       v5 of Transformers -- we recommend using `max_new_tokens` to control the maximum length of the generation.
    # For the time being, I'm using max_length because I'm unaware of the differences of max_length and
    # max_new_tokens. This is the documentation:
    # https://huggingface.co/docs/transformers/v4.18.0/en/main_classes/text_generation#transformers.generation_utils.GenerationMixin.generate
    translated = model.generate(**tokens, max_length=512)
    return tokenizer.decode(translated[0], skip_special_tokens=True)
