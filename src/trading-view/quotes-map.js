const EventEmitter = require('events');
const { generateRandomString } = require('./utils');

class QuoteEmitter extends EventEmitter {}

class QuotesMap extends Map {
  #sessionId;

  constructor(connection, ...args) {
    super(...args);
    this.connection = connection;
    this.startSession();
    this.quoteEmitter = new QuoteEmitter();
  }

  startSession() {
    if (this.#sessionId) throw new Error('Session has already started');

    this.#sessionId = `qs_${generateRandomString(12)}`;

    const handlerByEventName = {
      qsd: (event) => {
        const data = event.params[1];
        const key = data.n;
        const quote = this.get(key)
        if (!quote) return;
        quote.price = data.v.lp;

        this.quoteEmitter.emit('update', key);
      },
      quote_completed: undefined
    }

    this.connection.subscribe(event => {
      const handler = handlerByEventName[event.name];
      if (handler) handler(event);
    })
    this.connection.send('set_data_quality', ["low"]);
    this.connection.send('quote_create_session', [this.#sessionId]);
    this.connection.send('quote_set_fields', [this.#sessionId, "lp"]);
  }

  set(key, value) {
    super.set(key, value);
    this.connection.send('quote_add_symbols', [this.#sessionId, key])
  }

  delete(key) {
    super.delete(key) && this.connection.send('quote_remove_symbols', [this.#sessionId, key])
  }

  clear() {
    const keysIterator = this.keys();
    super.clear()
    for(const key of keysIterator)
      this.connection.send('quote_remove_symbols', [this.#sessionId, key])
  }
}

module.exports = QuotesMap

