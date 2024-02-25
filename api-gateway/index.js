const express = require('express')
const axios = require('axios')
const app = express()
const port = 8083

// Middleware to parse text
app.use(express.text());

let currentState = 'INIT'
let runLog = []

// Log the initial transition from INIT to RUNNING
if (currentState === 'INIT') {
  runLog.push(`${new Date().toISOString()}: ${currentState}->RUNNING`)
  currentState = 'RUNNING'
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/messages', async (req, res) => {
  try {
    const response = await axios.get('http://monitor:8087/')
    res.set('Content-Type', 'text/plain')
    res.send(response.data)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error fetching messages from Monitor service')
  }
})

app.get('/state', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(currentState);
});

app.put('/state', async (req, res) => {
  const newState = req.body

  if (newState === currentState) {
    res.set('Content-Type', 'text/plain');
    res.status(200).send(`State remains at ${newState}`)
    return
  }

  const serviceAddresses = 'http://service1:3000/state'
  try {
    await axios.put(serviceAddresses, newState, { 
      headers: { 
        'Content-Type': 'text/plain',
        'Accept': 'text/plain'
      } 
    })

    let oldState = currentState

    if (newState === 'INIT') {
      runLog.push(`${new Date().toISOString()}: ${oldState}->${newState}`)
      currentState = 'RUNNING'
      runLog.push(`${new Date().toISOString()}: ${newState}->${currentState}`)
    } else {
      currentState = newState
      runLog.push(`${new Date().toISOString()}: ${oldState}->${currentState}`)
    }

  } catch (error) {
    console.error(`Error updating state of service at ${serviceAddresses}: ${error}`)
  }
  res.set('Content-Type', 'text/plain');
  res.status(200).send(`State changed to ${newState}`)
})

app.get('/run-log', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(runLog.join('\n'));
});

app.listen(port, () => {
  console.log(`API gateway listening at http://localhost:${port}`)
})

module.exports = app
