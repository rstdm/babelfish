import os
from flask import Flask

PORT = int(os.environ.get("PORT", "5000"))

app = Flask(__name__)

greets = {
    "nl" : "Hello wereld",
    "en" : "Hello world",
    "fr" : "Bonjour monde",
    "de" : "Hallo Welt",
    "it" : "Ciao mondo",
    "pt" : "Olá mundo",
    "es" : "Hola mundo"
}

@app.route("/", methods=["GET"])
def index():
    return greets['de']

@app.route("/greet/<lang>", methods=["GET"])
def get_greet(lang):
    if lang not in greets:
        return f"{ lang } not found", 404
    return greets[lang]

app.run(host="0.0.0.0", port=PORT)
