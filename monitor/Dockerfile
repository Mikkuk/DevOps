FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt /app/

RUN pip install -r requirements.txt

COPY . /app/

RUN chmod +x ./wait-for-it.sh

EXPOSE 8087

CMD ["./wait-for-it.sh" , "message-broker:5672" , "--strict" , "--timeout=300" , "--" , "python", "monitor.py"]