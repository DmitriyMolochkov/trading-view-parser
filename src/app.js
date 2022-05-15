const { connect } = require('./trading-view');
const { start: startProxyServer } = require('./proxy-ws-server')

module.exports = async function () {
  let connection;
  let wss;
  try {
    connection = await connect();
    wss = await startProxyServer(connection);
  } catch (e) {
    console.error(e.toString())
    if (connection) connection.close();
    if (wss) wss.close();
  }
}