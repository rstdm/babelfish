from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

from language import Language

model = M2M100ForConditionalGeneration.from_pretrained("facebook/m2m100_418M")
tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")


def translate(source_language: Language, destination_language: Language, source_text: str) -> str:
    if source_text.strip() == "" or source_language == destination_language:
        # if the text only contains whitespace or the source and destination language are identical we don't have to
        # translate the text
        return source_text

    tokenizer.src_lang = source_language  # TODO
    encoded_text = tokenizer(source_text, return_tensors="pt")
    generated_tokens = model.generate(**encoded_text, forced_bos_token_id=tokenizer.get_lang_id(destination_language))
    destination_text = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

    return destination_text
