FROM python:3.10 AS build

WORKDIR /app

# the code in the container shouldn't run as root
RUN groupadd -r pythonuser && useradd -r -g pythonuser pythonuser

ADD requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

USER pythonuser
CMD ["uvicorn", "app:app"]

ADD *.py ./