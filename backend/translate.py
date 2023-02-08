from threading import Lock

from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

from language import Language

# load model and tokenizer. The required data must be present in the model or tokenizer directory. The data can be
# downloaded by executing download_model.py
repo = "facebook/m2m100_418M"
model = M2M100ForConditionalGeneration.from_pretrained(repo)
tokenizer = M2M100Tokenizer.from_pretrained(repo)

# translating text is very cpu intensive (100% CPU utilization). Therefore, running multiple requests in parallel does
# not improve performance. This mutex ensures that only one translation is performed at a time.
mutex = Lock()


def translate(source_language: Language, destination_language: Language, source_text: str) -> str:
    mutex.acquire()
    try:
        if source_text.strip() == "" or source_language == destination_language:
            # if the text only contains whitespace or the source and destination language are identical we don't have to
            # translate the text
            return source_text

        # this section is based on the example code from https://huggingface.co/facebook/m2m100_418M
        tokenizer.src_lang = source_language  # This is ok because the mutex ensures that no translations run in parallel
        encoded_text = tokenizer(source_text, return_tensors="pt")
        generated_tokens = model.generate(
            **encoded_text,
            forced_bos_token_id=tokenizer.get_lang_id(destination_language),
            # the model specifies this parameter in its config.json file:
            # https://huggingface.co/facebook/m2m100_418M/blob/a84767a43c9159c5c15eb3964dce2179684647f6/config.json#L26
            # However, this generates this warning:
            #       /usr/local/lib/python3.10/site-packages/transformers/generation/utils.py:1273: UserWarning: Neither
            #       `max_length` nor `max_new_tokens` has been set, `max_length` will default to
            #       200 (`generation_config.max_length`). Controlling `max_length` via the config is deprecated
            #       and `max_length` will be removed from the config in v5 of Transformers -- we recommend
            #       using `max_new_tokens` to control the maximum length of the generation.
            # For the time being, I'm using max_length because I'm unaware of the differences of max_length and
            # max_new_tokens. This is the documentation:
            # https://huggingface.co/docs/transformers/v4.18.0/en/main_classes/text_generation#transformers.generation_utils.GenerationMixin.generate
            max_length=200
        )
        translated_text = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

        return translated_text
    finally:
        mutex.release()
