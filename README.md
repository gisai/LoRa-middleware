# LoRa-middleware
Middleware to connect LoRa Data packets from Chirpstack (HTTP integration) to Orion Context broker.
Once an HTTP request coming from Chirpstack is received, the middleware is capable of detecting if a device is already registered in the Orion Context Broker. If the device is registered, the middleware updated its context information. If the device is new to Orion, the middleware registers it.

# Installation instructions

## Configuration

Chirpstack HTTP integration must point to the Middleware address. If Application server is inside a docker, then "localhost" should be included as host.docker.internal.
In my environment (having chirpstack dockerized but executing the middleware outside docker) the HTTP integration endpoint configuration should be: http://host.docker.internal:3000/lora

In routes/index.js make sure:

1. OrionAddress point to your Orion broker direction
1. The template variable matches your sensor data.
Data must be expresed in NGSIv2 JSON format:
[https://fiware-orion.readthedocs.io/en/master/user/walkthrough_apiv2/index.html](https://fiware-orion.readthedocs.io/en/master/user/walkthrough_apiv2/index.html)
1. Once received the message, template is modified with sensor values (i.e. template.Battery.value = objectJSON.Battery;)

## Project start

Make sure you have nodejs / npm installed

In the root folder of the project:

```bash
$ npm install -g nodemon
```

```bash
$ npm install
$ npm start
```
Middleware server will be run in [http://localhost:3000/](http://localhost:3000/)
Make sure you receive an Express Welcome message in this address.
