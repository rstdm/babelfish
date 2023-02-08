FROM python:3.10-slim AS build

WORKDIR /app

# the code in the container shouldn't run as root
RUN groupadd -r pythonuser && useradd -r -g pythonuser pythonuser

ADD requirements.txt download_model.py ./
RUN pip3 install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu
RUN mkdir model  \
    && mkdir tokenizer  \
    && python3 download_model.py

USER pythonuser

# transformers shouldn't be allowed to download models from the internet
ENV TRANSFORMERS_OFFLINE=1

CMD ["uvicorn", "--host", "0.0.0.0", "app:app"]

ADD *.py ./