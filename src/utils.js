const fetch = require("node-fetch");
const { WATCH_LIST_NUMBER } = require("./config");
const cheerio = require("cheerio");

async function getSymbols() {
  const response = await fetch(`https://ru.tradingview.com/watchlists/${WATCH_LIST_NUMBER}/`);

  const $ = cheerio.load(await response.text());

  return JSON.parse(
    $('script[type="application/prs.init-data+json"]')
      .filter((i, link) => /"sharedWatchlist":/.test(link.children[0].data))[0].children[0].data
  ).sharedWatchlist.list.symbols;
}

module.exports = {
  getSymbols
}