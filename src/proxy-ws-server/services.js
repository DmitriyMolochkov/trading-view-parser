const { WebSocket } = require("ws")
const { UpdateSymbolPriceMessage } = require('./messages');

function addSymbol(ws, symbol , clientsBySymbolsMap, quotesMap) {
  if (clientsBySymbolsMap.has(symbol)) {
    clientsBySymbolsMap.get(symbol).add(ws);

    const quote = quotesMap.get(symbol);
    ws.send(JSON.stringify(new UpdateSymbolPriceMessage({ symbol: quote.symbol }, quote.price)));
  } else {
    quotesMap.set(symbol, { symbol, price: null });
    clientsBySymbolsMap.set(symbol, new Set([ws]));
  }
}

function deleteSymbol(ws, symbol, clientsBySymbolsMap, quotesMap) {
  if (!clientsBySymbolsMap.has(symbol)) return;

  const clients = clientsBySymbolsMap.get(symbol);
  clients.delete(ws);

  if (clients.size) return;

  clientsBySymbolsMap.delete(symbol);
  quotesMap.delete(symbol);
}

function updatePrice(quote, clientsBySymbolsMap) {
  const symbol = quote.symbol;
  const clients = clientsBySymbolsMap.get(symbol);
  if (!clients) return;
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(new UpdateSymbolPriceMessage({ symbol }, quote.price)));
    }
  })
}

module.exports = {
  addSymbol,
  deleteSymbol,
  updatePrice,
}