
FROM node:14

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . /app/

RUN chmod +x ./wait-for-it.sh

EXPOSE 3000

CMD ["./wait-for-it.sh" , "message-broker:5672" , "--strict" , "--timeout=300" , "--" , "npm", "start"]
