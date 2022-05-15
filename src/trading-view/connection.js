const WebSocket = require('ws')

function parseMessage(message) {
  if (message.length === 0) return [];

  const events = message.toString().split(/~m~\d+~m~/).slice(1);

  return events.map(event => {
    if (event.substring(0, 3) === "~h~") {
      return { type: 'ping', data: `~m~${event.length}~m~${event}` };
    }

    const parsed = JSON.parse(event);

    if (parsed['session_id']) {
      return { type: 'session', data: parsed };
    }

    return { type: 'event', data: parsed };
  })
}

async function connect() {
  const connection = new WebSocket("wss://prodata.tradingview.com/socket.io/websocket", {
    origin: "https://prodata.tradingview.com"
  });

  const subscribers = new Set();

  function subscribe(handler) {
    subscribers.add(handler);
    return () => {
      subscribers.delete(handler)
    };
  }

  function send(name, params) {
    const data = JSON.stringify({ m: name, p: params });
    const message = "~m~" + data.length + "~m~" + data;
    connection.send(message);
  }

  async function close() {
    return new Promise((resolve, reject) => {
      connection.on('close', resolve);
      connection.on('error', reject);
      connection.close();
    })
  }

  return new Promise((resolve, reject) => {
    const handleByMessageType = {
      ping: (payload) => connection.send(payload.data),
      session: () => resolve({ subscribe, send, close }),
      event: (payload) => {
        const event = {
          name: payload.data.m,
          params: payload.data.p
        };
        subscribers.forEach(handler => handler(event));
      }
    }

    function handlePayload(payload) {
      const handle = handleByMessageType[payload.type];
      handle ? handle(payload) : reject(`unknown payload: ${JSON.stringify(payload)}`);
    }

    connection.on('error', error => close().then(() => reject(error)));

    connection.on('message', message =>
      parseMessage(message.toString())
      .forEach(handlePayload)
    )
  })
}

module.exports = {
  connect
}