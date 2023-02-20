from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, BaseSettings

from language import Language
from translate import translate


class Settings(BaseSettings):
    # CORS should be allowed by default because it's not needed in production
    cors_allowed_origins: list[str] = []
    # The openAPI documentation should be allowed by default because it's not needed in production
    api_documentation_enabled: bool = False
    version: str = "unknown"  # The current version is needed for the openAPI documentation


settings = Settings()
print(f'current server configuration: {settings.json()}')

# Setting the openapi_url to an empty string disables the documentation
# https://fastapi.tiangolo.com/advanced/conditional-openapi/
openapi_url = "/api/openapi.json" if settings.api_documentation_enabled else ""
app = FastAPI(
    openapi_url=openapi_url,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    title="babelfish-backend",
    description="This microservice is the backend of the babelfish application. It's only purpose is to translate text "
                "between various languages.",
    version=settings.version,
    contact={
        "name": "René Maget",
        "email": "rene.maget@stud.th-luebeck.de",
    },
)

if len(settings.cors_allowed_origins) > 0:  # CORS is needed for local debugging, but not in production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins,
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

    class Config:
        schema_extra = {
            "example": {
                "translatedText": "Dieses englische Textsnippe wird in Deutsch übersetzt.",
            }
        }


@app.post("/api/translate",
          operation_id="translate",
          summary="Translates a text from one language to another.",
          description="This endpoint translates a text from one language to another. The translation is very slow for "
                      "long texts. It therefore makes sense to split longer documents into sentences and to create a "
                      "new request for each sentence. This way the sentences can be processed in parallel by different "
                      "workers."
          )
def read_item(request_payload: TranslateRequestPayload) -> TranslateResponsePayload:
    translated_text = translate(request_payload.destinationLanguage, request_payload.sourceText)
    return TranslateResponsePayload(translatedText=translated_text)
