const MQTT = require('async-mqtt')
const config = require('config')
const gpio = require('rpi-gpio')

const gpiop = gpio.promise
const MQTTConfig = config.get('mqttClient')

const client = MQTT.connect(`tcp://${MQTTConfig.url}:${MQTTConfig.port}`, {
  keepalive: config.get('mqttClient.keepalive')
})

client.on('connect', startSubscribe)

async function startSubscribe () {
  try {
    await client.subscribe('door')
  } catch (e) {
    console.log(e.stack)
  }
  getMessage()
}

function getMessage () {
  client.on('message', function (topic, message) {
    if (message.toString() === 'on') {
      openTheDoor()
    }
  })
}

function openTheDoor () {
  gpiop.setup(7, gpio.DIR_OUT)
    .then(() => {
      setTimeout(() => {
        gpiop.write(7, false)
      }, 100)
      gpiop.write(7, true)
    })
    .catch((err) => {
      console.log('Error: ', err.toString())
    })
}
