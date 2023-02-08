FROM python:3.10-slim AS build

WORKDIR /app
ENV TRANSFORMERS_CACHE=/transformer-cache

# the code in the container shouldn't run as root
RUN groupadd -r pythonuser && useradd -r -g pythonuser pythonuser

ADD requirements.txt download_model.py ./

# download dependencies and model. PYTHONDONTWRITEBYTECODE tells the python interpreter not to create
# pycache files.
RUN export PYTHONDONTWRITEBYTECODE=1 && \
    pip3 install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
RUN export export PYTHONDONTWRITEBYTECODE=1 &&  \
    python3 download_model.py

USER pythonuser

# transformers shouldn't be allowed to download models from the internet
# We can only set these env vars after the models have been downloaded
# https://huggingface.co/docs/transformers/installation#offline-mode
ENV TRANSFORMERS_OFFLINE=1
ENV HF_DATASETS_OFFLINE=1

CMD ["uvicorn", "--host", "0.0.0.0", "app:app"]

ADD *.py ./