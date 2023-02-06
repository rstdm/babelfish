from fastapi import FastAPI
from pydantic import BaseModel, Field

from backend.language import Language

app = FastAPI()


class TranslateRequestPayload(BaseModel):
    sourceLanguage: Language = Field(description="The ISO 639‑1 language code of the sourceText.")
    destinationLanguage: Language = Field(description="The ISO 639‑1 language code of the translated text.")
    sourceText: str = Field(description="The text in the sourceLanguage that should be translated.", max_length=500)

    class Config:
        schema_extra = {
            "example": {
                "sourceLanguage": "en",
                "destinationLanguage": "de",
                "sourceText": "This english text snippet will be translated into german.",
            }
        }


class TranslateResponsePayload(BaseModel):
    translatedText: str = Field(description="This field contains the translated text.")


@app.post("/translate",
          summary="Translates a text from one language to another.",
          description="This endpoint translates a text from one language to another. The translation is very slow for "
                      "long texts. It therefore makes sense to split longer documents into sentences and to create a "
                      "new request for each sentence. This way the sentences can be processed in parallel by different "
                      "workers."
          )
def read_item(request_payload: TranslateRequestPayload) -> TranslateResponsePayload:
    return TranslateResponsePayload(translatedText=request_payload.sourceText)
