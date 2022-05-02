const { connect, QuotesMap } = require('./trading-view');
const { getSymbols } = require('./utils');

module.exports = async function () {
  let connection;
  try {
    connection = await connect();
    const quotesMap = new QuotesMap(connection);

    //quotesMap.quoteEmitter.on('update', () => console.table([...quotesMap.values()]));
    quotesMap.quoteEmitter.on('update',
      (key) => console.log(`${quotesMap.get(key).ticker} --> ${quotesMap.get(key).price}`));

    for (const symbol of await getSymbols()) {
      quotesMap.set(symbol, {
        symbol,
        ticker: symbol.split(':')[1],
        price: null
      });
    }

  } catch (e) {
    console.error(e.toString())
    if (connection) connection.close();
  }
}