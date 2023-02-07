from threading import Lock

from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

from language import Language

# load model and tokenizer. The required data must be present in the model or tokenizer directory. The data can be
# downloaded by executing download_model.py
model = M2M100ForConditionalGeneration.from_pretrained("model")
tokenizer = M2M100Tokenizer.from_pretrained("tokenizer")

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
        generated_tokens = model.generate(**encoded_text, forced_bos_token_id=tokenizer.get_lang_id(destination_language))
        translated_text = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

        return translated_text
    finally:
        mutex.release()
