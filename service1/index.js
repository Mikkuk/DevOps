const fs = require('fs');
const express = require('express');
const axios = require('axios');
const amqp = require('amqplib/callback_api');
const dns = require('dns');

const app = express();
const port = 3000;

let counter = 1;
let currentState = 'INIT';

// Middleware to parse text
app.use(express.text());

app.put('/state', (req, res) => {
  const newState = req.body;
  console.log(newState);

  switch (newState) {
    case 'INIT':
      counter = 1;
      currentState = 'RUNNING';
      break;
    case 'RUNNING':
      currentState = 'RUNNING';
      break;
    case 'PAUSED':
      currentState = 'PAUSED';
      break;
    case 'SHUTDOWN':
      currentState = 'SHUTDOWN';
      break;
    default:
      res.status(400).send('Invalid state');
      return;
  }

  res.status(200).send(`State changed to ${newState}`);
});

function writeToLog(logText) {
  const timestamp = new Date().toISOString();
  const logEntry = `${logText} ${timestamp}`;

  sendMessageToRabbitMQ('log', logEntry);
}

function sendMessageToRabbitMQ(topic, message) {
  amqp.connect('amqp://message-broker', function (error0, connection) {
    if (error0) {
      writeToLog(`${error0.message}`);
      return;
    }

    connection.createChannel(function (error1, channel) {
      if (error1) {
        writeToLog(`${error1.message}`);
        return;
      }

      channel.assertExchange(topic, 'fanout', {
        durable: false,
      });

      channel.publish(topic, '', Buffer.from(message));
      console.log('message sent to rabbit', message);
    });

    setTimeout(function () {
      connection.close();
    }, 500);
  });
}

async function getService2Address() {
  return new Promise((resolve, reject) => {
    dns.lookup('service2', (err, address, family) => {
      if (err) {
        reject(err);
      } else {
        resolve(`${address}:8000`);
      }
    });
  });
}

async function sendData() {
  if (currentState === 'PAUSED') {
    setTimeout(sendData, 2000);
    return;
  }

  if (currentState === 'INIT') {
    counter = 1;
    currentState = 'RUNNING';
  }

  const timestamp = new Date().toISOString();
  const service2AddressPort = await getService2Address();
  console.log(service2AddressPort);
  const logText = `${counter} ${timestamp} ${service2AddressPort}`;

  sendMessageToRabbitMQ('message', logText);

  try {
    await axios.post(`http://${service2AddressPort}`, logText);
    console.log('sent with http', logText);
    writeToLog(`200`);
  } catch (error) {
    writeToLog(`${error.message}`);
  }

  counter++;
  setTimeout(sendData, 2000);
}

app.listen(port, () => {
  console.log(`Service 1 is listening on port ${port}`);
  sendData();
});