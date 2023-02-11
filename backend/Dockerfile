# We can't use python:3.10-alpine because alpine linux is based on musl. However, the precompiled
# binaries for pytorch, numpy, sentencepiece and tokenizers are not available for musl. Compiling them
# during the docker build will increase the build time significantly.
#
# Commit 7a58b4b3d8bce6e1b53649b464c8581cce98ef49 contains a dockerfile with alpine linux which compiles
# numpy, sentencepiece (both c / c++) and tokenizers (rust). It takes about 15 minutes to build the image.
# No attemt was made to compile pytorch.
#
# Using python-slim instead of python-alpine increases the image size by about 100 MB. However, the total
# image size is about 1.4GB due to the immense size of pytorch (~750GB) and the deep learning model (~270MB). Adding
# 100MB more doesn't make much of a difference.

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

CMD ["uvicorn", "--host", "0.0.0.0", "--port", "80", "app:app"]

ADD *.py ./
