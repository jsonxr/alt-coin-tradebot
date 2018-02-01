const WebSocket = require('ws');
const sprintf = require('sprintf-js').sprintf;
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/altcoins');

const candles = require('./candles.js');
const trades = require('./trades.js');

// WS Event handler
class Events {
  constructor() {
    this.channels = {};
  }
  
  async onmessage(msg) {
    const json = JSON.parse(msg.data);
    if (Array.isArray(json)) {
      this.handle(json);
    } else {
      this[json.event](json);
    }
  }
  
  info(data) {
    /*
    { event: 'info',
      code: 20051,
      msg: 'Stopping. Please try to reconnect' }
    */
    console.log('info: ', data);
  }
  
  pong(data) {
    console.log('pong: ', data);
  }
  
  subscribed(data) {
    /*
      // response
      {
        event: "subscribed",
        channel: "candles",
        chanId": CHANNEL_ID,
        key: "trade:1m:tBTCUSD"
      }

      // response Trading
      {
        event: "subscribed",
        channel: "trades",
        chanId: CHANNEL_ID,
        symbol: "tBTCUSD"
        pair: "BTCUSD"
      }

      // response Funding
      {
        event: "subscribed",
        channel: "trades",
        chanId: CHANNEL_ID,
        symbol: "fUSD"
      }
    */
    console.log('subscribe: ', data);
    this.channels[data.chanId] = data;
  }
  
  // Magic "candles" channel
  async candles(channel, data) {
    candles(channel, data);
  }
  
  // Magic "trades" channel
  async trades(channel, data) {
    trades(channel, data);
  }
  
  // Handle a channel event
  async handle(data) {
    const channelId = data[0];
    const channel = this.channels[channelId];
    if (data[1] !== 'hb') { // Ignore heartbeats
      this[channel.channel](channel, data); // either "candles", or "trades"
    }
  }
}

// Now, setup all the websocket channels
const events = new Events();
const wss = new WebSocket('wss://api.bitfinex.com/ws/2')
wss.onmessage = events.onmessage.bind(events);
wss.onopen = () => {
  // API keys setup here (See "Authenticated Channels")
  wss.send(JSON.stringify({
    "event":"ping",
    "cid": 1234
  }));
  
  wss.send(JSON.stringify({
    event: "subscribe",
    channel: "candles",
    key: "trade:1m:tBTCUSD"
  }));
  
  wss.send(JSON.stringify({
    event: "subscribe",
    channel: "candles",
    key: "trade:1m:tETHUSD"
  }));
  
  wss.send(JSON.stringify({
    event: "subscribe", 
    channel: "trades", 
    symbol: "tBTCUSD",
  }));
  wss.send(JSON.stringify({
    event: "subscribe", 
    channel: "trades", 
    symbol: "tETHUSD",
  }));
  wss.send(JSON.stringify({
    event: "subscribe", 
    channel: "trades", 
    symbol: "tETHBTC",
  }));
}
