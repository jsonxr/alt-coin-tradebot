const sprintf = require('sprintf-js').sprintf;
const mongoose = require('mongoose');

// Mongoose schemas
const CandleSchema = new mongoose.Schema({
  key: String,
  mts: Number,    // millisecond time stamp
  open: Number,   // First execution during the time frame
  close: Number,  // Last execution during the time frame
  high: Number,   // Highest execution during the time frame
  low: Number,    // Lowest execution during the timeframe
  volume: Number, // Quantity of symbol traded within the timeframe
});
CandleSchema.index({key: 1, mts: 1}, {unique: true});
const Candle = mongoose.connection.model('Candle', CandleSchema);


async function handler(channel, data) {

  // Map array to candle object
  const toCandle = (arr) => ({
    mts: arr[0],
    open: arr[1],
    close: arr[2],
    high: arr[3],
    low: arr[4],
    volume: arr[5],
  });

  // Upsert the row into mongo
  const upsert = async (row) => {
    const candle = toCandle(row);
    candle.key = channel.key;
    //console.log(sprintf('%(key)s  %(mts)f   %(open)10.4f   %(close)10.4f   %(high)10.4f   %(low)10.4f   %(volume)10.4f', candle));

    return Candle.findOneAndUpdate({
      key: candle.key,
      mts: candle.mts
    }, candle, { upsert : true });
  }

  const arr = data[1];
  if (Array.isArray(arr)) {
    if (Array.isArray(arr[0])) {
      arr.forEach(async (row) => {
        await upsert(row);
      })
    } else {
      await upsert(arr);
    }
  } else {
    console.log('ERROR, dont know how to handle: ', arr);
  }
}

module.exports = handler;