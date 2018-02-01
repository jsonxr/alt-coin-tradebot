const sprintf = require('sprintf-js').sprintf;
const mongoose = require('mongoose');

// Mongoose schemas

const TradeSchema = new mongoose.Schema({
  exchangeId: String, // id on the exchange
  symbol: String,
  mts: Number,        // millisecond time stamp
  amount: Number,     // How much was bought (positive) or sold (negative).
  price: Number,      // Price at which the trade was executed
  rate: Number,       // Rate at which funding transaction occurred
  period: Number,     // Amount of time the funding transaction was for
});
TradeSchema.index({exchangeId: 1}, { unique: true });
const Trade = mongoose.model('Trade', TradeSchema);

async function handler(channel, data) {

  const toTrade = (arr) => ({
    exchangeId: arr[0],
    mts: arr[1],
    amount: arr[2],
    price: arr[3],
  });

  // Upsert the row into mongo
  const upsert = async (row) => {
    const trade = toTrade(row);
    trade.symbol = channel.symbol;
    console.log(sprintf('%(symbol)s %(exchangeId)s  %(mts)f   %(amount)10.4f   %(price)10.4f', trade));

    return Trade.findOneAndUpdate({
      exchangeId: trade.exchangeId,
    }, trade, { upsert : true });
  }

  const arr = data[1];
  if (Array.isArray(arr)) {
    if (Array.isArray(arr[0])) {
      // [ 708,
      // [ [ 182858894, 1517478377558, 0.03906078, 1108 ],
      // [ 182858888, 1517478377116, 0.04977389, 1108 ] ]
      arr.forEach(async (row) => {
        await upsert(row);
      })
    } else {
      console.log('ERROR 2, dont know how to handle: ', channel, data);
    }
  } else if (arr === 'tu') {
    // [ 105, 'tu', [ 182858914, 1517478378858, 0.03631, 9732 ] ]
    await upsert(data[2]);
  } else if (arr === 'te') {
    // Do nothing? we only insert when we get a "tu" which is the real thing
    // te is just preliminary?
  } else {
    console.log('ERROR 3, dont know how to handle: ', channel, data);
  }
}

module.exports = handler;