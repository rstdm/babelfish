FROM python:3.10-alpine AS build

WORKDIR /app

# the code in the container shouldn't run as root
#RUN groupadd -r pythonuser && useradd -r -g pythonuser pythonuser

ADD requirements.txt ./
RUN apk add cmake gcc libgcc g++ make git openssl-dev
RUN pip install sentencepiece

RUN wget https://sh.rustup.rs -O - | sh -s -- -y
RUN PATH="$HOME/.cargo/bin:$PATH" pip install tokenizers

RUN pip3 install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

#USER pythonuser
CMD ["uvicorn", "app:app"]

ADD *.py ./