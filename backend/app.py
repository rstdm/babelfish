from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from language import Language
from translate import translate

app = FastAPI()
app.add_middleware(  # TODO cors is not needed in production
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],
    allow_methods=["*"],
)


class TranslateRequestPayload(BaseModel):
    destinationLanguage: Language = Field(description="The language of the translated text.")
    sourceText: str = Field(description="The text that should be translated. The text can be in any supported language "
                                        "and different languages can be mixed in the same text.", max_length=500)

    class Config:
        schema_extra = {
            "example": {
                "destinationLanguage": "deu",
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
    translated_text = translate(request_payload.destinationLanguage, request_payload.sourceText)
    return TranslateResponsePayload(translatedText=translated_text)
