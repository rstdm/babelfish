from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
from huggingface_hub import scan_cache_dir

if __name__ == '__main__':
    model = "facebook/m2m100_418M"
    M2M100ForConditionalGeneration.from_pretrained(model).save_pretrained("model")
    M2M100Tokenizer.from_pretrained(model).save_pretrained("tokenizer")

    # clear cache
    cache = scan_cache_dir()
    revisions = [revision.commit_hash for repo in cache.repos for revision in repo.revisions]
    cache.delete_revisions(*revisions).execute()
