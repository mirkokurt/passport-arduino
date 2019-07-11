
const Strategy = require('./passport-oauth2/lib').Strategy;
const arduinCloudRestApi = require('./arduino-cloud-api');
require("babel-polyfill");
const arduinCloudMessageApi = require('arduino-iot-js').default;
const Fetch = require('node-fetch').default;
const fetch = Fetch.default;
const Headers = Fetch.Headers;
global["fetch"] = fetch;
global["Headers"] = Headers;
const WebSocket = require('ws');	
global["WebSocket"] = WebSocket;

const mqttHost = process.env.IOT_MQTTHOST_URL || 'wss.iot.oniudra.cc';
const authApiUrl = process.env.IOT_AUTH_API_URL || 'https://auth-dev.arduino.cc';

ArduinoCloudOptions = {
  host: mqttHost,
  port: 8443,
  ssl: true,             
  apiUrl: authApiUrl,
  useCloudProtocolV2: true
};

Strategy.prototype.userProfile = async function(accessToken, done) {
  ArduinoCloudOptions.token = accessToken;
  try {
    const ArduinoRestClient = new arduinCloudRestApi.ArduinoCloudClient(accessToken);
    global["ArduinoRestClient"] = ArduinoRestClient;
    const user = await ArduinoRestClient.getUserId();

    if(global["ArduinoMessageClient"] !== undefined) {
      await arduinCloudMessageApi.disconnect();
    }
    await arduinCloudMessageApi.connect(ArduinoCloudOptions);
    global["ArduinoMessageClient"] = arduinCloudMessageApi;
    
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

// Expose Strategy.
exports = module.exports = Strategy;

// Exports.
exports.Strategy = Strategy;