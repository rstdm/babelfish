from transformers import MarianMTModel, MarianTokenizer

if __name__ == '__main__':
    model = "Helsinki-NLP/opus-mt-ine-ine"

    # this downloads the model and stores it in the cache. The cache is then included in the image.
    MarianMTModel.from_pretrained(model)
    MarianTokenizer.from_pretrained(model)
