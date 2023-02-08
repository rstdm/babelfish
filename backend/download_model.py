from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

if __name__ == '__main__':
    model = "facebook/m2m100_418M"

    # this downloads the model and stores it in the cache. The cache is then included in the image.
    M2M100ForConditionalGeneration.from_pretrained(model)
    M2M100Tokenizer.from_pretrained(model)
