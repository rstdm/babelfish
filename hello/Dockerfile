FROM python:3-alpine

WORKDIR /app

ADD requirements.txt ./
RUN pip install -r requirements.txt

ENTRYPOINT ["python", "-u", "hello.py"]

ADD *.py ./