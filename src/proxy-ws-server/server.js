const { WebSocketServer } = require('ws');
const { QuotesMap } = require('../trading-view');
const messages = require('./messages');
const { addSymbol, deleteSymbol, updatePrice } = require('./services');
const { SERVER_PORT } = require('../config');

const messageMap = new Map(Object.values(messages).map(x => [x.MESSAGE_TYPE, x]));
const { AddSymbolMessage, DeleteSymbolMessage } = messages;

const clientsBySymbolsMap = new Map();

function parseMessage(message) {
  const messageObj = JSON.parse(message);
  const MessageClass = messageMap.get(messageObj.type);
  if (!MessageClass) throw new Error(`No message class for ${messageObj.type} found`);

  return MessageClass.fromString(message)
}

function updatePriceListener(symbol, quotesMap) {
  const quote = quotesMap.get(symbol);
  console.log(`${symbol} --> ${quote.price}`);

  updatePrice(quote, clientsBySymbolsMap)
}

async function start(connection) {
  const quotesMap = new QuotesMap(connection);

  quotesMap.quoteEmitter.on('update', (symbol) => updatePriceListener(symbol, quotesMap));

  let wss = new WebSocketServer({ port: SERVER_PORT });

  wss.on('connection', ws => {
    const symbols = new Set();

    const handleByMessageType = {
      //ping: () => {}, TODO
      [AddSymbolMessage.MESSAGE_TYPE]: message => {
        const symbol = message.symbol;
        symbols.add(symbol);

        addSymbol(ws, message.symbol, clientsBySymbolsMap, quotesMap);
      },
      [DeleteSymbolMessage.MESSAGE_TYPE]: message => {
        const symbol = message.symbol;
        symbols.delete(symbol);

        deleteSymbol(ws, symbol, clientsBySymbolsMap, quotesMap);
      },
    }

    function handleMessage(message) {
      const handle = handleByMessageType[message.type];
      if (handle) handle(message); //TODO add exception
    }

    ws.on('message', buffer => handleMessage(parseMessage(buffer.toString())));

    ws.on('close', () => symbols.forEach(symbol => deleteSymbol(ws, symbol, clientsBySymbolsMap, quotesMap)));
  });

  const originalCloseFunc = wss.close;
  wss.close = () => {
    originalCloseFunc.apply(wss);
    quotesMap.quoteEmitter.removeAllListeners();
    connection.close();
  }

  return wss;
}

module.exports = {
  start
}