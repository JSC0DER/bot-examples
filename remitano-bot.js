function Bot() {
  let pages        = {};
  let pairs        = Object.freeze(db.pairs.map(p => p.toLowerCase()));
  let loginurl     = "https://remitano.com/btc/my/login";
  let loggedin     = false;
  let hasprices    = false;
  let debugmode    = false;
  let exchanges    = Object.freeze(["bitstamp", "kraken", "binance", "bitfinex"]);
  let tickerpairs  = Object.freeze(["btcusd", "ltcusd", "bchusd", "ethusd", "xrpusd"]);
  let ticker       = {
    kraken   : {
      btcusd: 1,
      ethusd: 1,
      ltcusd: 1,
      bchusd: 1,
      xrpusd: 1
    },
    bitstamp : {
      btcusd: 1,
      ethusd: 1,
      ltcusd: 1,
      bchusd: 1,
      xrpusd: 1
    },
    bitfinex : {
      btcusd: 1,
      ethusd: 1,
      ltcusd: 1,
      bchusd: 1,
      xrpusd: 1
    },
    binance  : {
      btcusd: 1,
      ethusd: 1,
      ltcusd: 1,
      bchusd: 1,
      xrpusd: 1
    }
  };
  let f            = parseFloat;
  let i            = parseInt;
  let browser;

  const debug         = Object.freeze((text) => {
    if (debugmode) console.log(text);
  });
  const url           = Object.freeze((type, coin) => {
    return `https://remitano.com/api/v1/offers?offer_type=${type}&country_code=my&coin=${coin}&offline=true&page=1&coin_currency=${coin}&per_page=1000`;
  });
  const data_getrates = Object.freeze(() => {
    let queue = [];
    Object.keys(ticker).forEach(exchange => {
      tickerpairs.forEach(pair => {
        switch (exchange) {
          case 'kraken':
            return void queue.push(data_kraken(pair));
          case 'bitstamp':
            return void queue.push(data_bitstamp(pair));
          case 'bitfinex':
            return void queue.push(data_bitfinex(pair));
          case 'binance':
            return void queue.push(data_binance(pair));
          default: return;
        }
      });
    });
    Promise.all(queue).
    then(() => {
      if (!hasprices) {
        hasprices = true;
        account_action();
        data_update();
        setTimeout(() => {
          debug('30 minute reset');
          process.exit();
        }, 1000*60*30);
      }
    }).
    catch(debug).
    finally(() => {
      setTimeout(data_getrates, 2e4);
    });
  });
  const data_kraken   = Object.freeze((coin) => {
    return new Promise((resolve, reject) => {
      if (coin == 'btcusd') coin = 'xbtusd';
      fetch(`https://api.kraken.com/0/public/Ticker?pair=${coin}`).
      then(response => response.json()).
      then(response => {
        if (coin == 'xbtusd') coin = 'btcusd';
        const pair = Object.keys(response.result)[0];
        ticker.kraken[coin] = f(response.result[pair].b[0]);
        resolve();
      }).
      catch(response => {
        console.log(response);
        resolve();
      });
    });
  });
  const data_bitstamp = Object.freeze((coin) => {
    return new Promise((resolve, reject) => {
      fetch(`https://www.bitstamp.com/api/v2/ticker/${coin}/`).
      then(response => response.json()).
      then(response => {
        ticker.bitstamp[coin] = f(response.last);
        resolve();
      }).
      catch(response => {
        console.log(response);
        resolve();
      });
    });
  });
  const data_bitfinex = Object.freeze((coin) => {
    return new Promise((resolve, reject) => {
      if (coin == 'bchusd') coin = 'babusd';
      fetch(`https://api.bitfinex.com/v1/pubticker/${coin}/`).
      then(response => response.json()).
      then(response => {
        if (coin == 'babusd') coin = 'bchusd';
        ticker.bitfinex[coin] = f(response.last_price);
        resolve();
      }).
      catch(response => {
        console.log(response);
        resolve();
      });
    });
  });
  const data_binance  = Object.freeze((coin) => {
    return new Promise((resolve, reject) => {
      if (coin == 'bchusd') coin = 'bchabcusd'
      fetch(`https://api.binance.com/api/v1/ticker/price?symbol=${coin.toUpperCase() + 'T'}`).
      then(response => response.json()).
      then(response => {
        if (coin == 'bchabcusd') coin = 'bchusd';
        ticker.binance[coin] = f(response.price);
        resolve();
      }).
      catch(response => {
        console.log(response);
        resolve();
      });
    });
  });
  const data_get      = Object.freeze(async (type, coin) => {
    let page   = await browser.newPage();
    let result = false;
    try {
      await page.setViewport({width:1920,height:1080});
      await page.goto(url(type, coin), {waitUntil: "load", timeout: 2e4});
    } catch(err) {
      await evidence(page);
    }
    await page.waitFor(15000);
    const data = await page.evaluate('document.body.innerText');
    try { 
      result = JSON.parse(data)
    }
    catch(err) {
      debug('Data retrieval failed.' + err);
    } finally {
      await page.close();
      return result;
    }
  });
  const data_fiat     = Object.freeze((z, p, m, k, x, r, y) => {
    let cp = f(z / m);
    let fp = 0;
    if (y)  fp = cp < p ? cp : data_real(p, r, m, x, k, y);
    else    fp = cp > p ? cp : data_real(p, r, m, x, k, y);
    return (fp >= k && fp <= x) ? fp : false;
  });
  const data_real     = Object.freeze((p, r, m, x, k, y) => {
    let rp = f((p * r) / m);
    return (rp >= k && rp <= x) ? rp : false;
  });
  const data_price    = Object.freeze((ad, coin, buy) => {
    const exchange    = ad.reference_exchange.split('_')[0];
    const bitstamp    = coin.toLowerCase() == 'usdt' ? 1 : ticker.bitstamp[coin.toLowerCase() + 'usd'];
    const currentrate = coin.toLowerCase() == 'usdt' ? 1 : ticker[exchange][coin.toLowerCase() + 'usd'];
    const offerprice  = f(ad.price);
    const filterprice = f(settings[coin.toUpperCase() + 'min']);
    const filtermax   = f(settings[coin.toUpperCase() + 'max']);
    const offerfiat   = buy ? i(ad.max_coin_price) : i(ad.min_coin_price);
    
    if (offerfiat === NaN || !offerfiat) {
      return data_real(offerprice, currentrate, bitstamp, filtermax, filterprice, buy);
    }
    else {
      return data_fiat(offerfiat, offerprice, bitstamp, filterprice, filtermax, currentrate, buy);
    }
  });
  const data_date     = Object.freeze((addate, lastonline) => {
    if (settings.lastonline <= 0) return true;
    else return (Date.now() - (new Date(addate).getTime())) <= lastonline;
  });
  const data_filter   = Object.freeze((type, coin) => {
    return new Promise((resolve, reject) => {
      Promise.resolve(data_get(type, coin)).
      then(data => {
        if (!data) throw 'no data';
        switch (type) {
          case 'sell' : {
            const filtered   = [];
            const lastonline = 1000 * 60 * i(settings.lastonline);
            debug("Debug count: " + data.offers.length + ' offer.');
            for (let ad of data.offers) {
              const f1 = f(ad.max_amount) >= f(settings[coin.toUpperCase() + 'amt']);
                const f2 = data_price(ad, coin);
              const f3 = settings.blacklist.includes(ad.username.toLowerCase());
              const f4 = ad.disabled === false;
              const f5 = ad.currency.toLowerCase() === "myr";
              const f6 = data_date(ad.last_online_all, lastonline);
              const f7 = f(ad.seller_speed_score) >= f(settings.score);
              const f8 = f(ad.seller_released_trades_count) >= f(settings.trades);
              if (f1 && f2 && !f3 && f4 && f5 && f6 && f7 && f8) {
                filtered.push({price: f2, user: ad.username, max: ad.max_amount});
              }
            }
            const target   = filtered.reduce((min, ad) => f(ad.price) < f(min) ? f(ad.price) : f(min), Infinity);
            const newprice = f(target - f(settings[coin.toUpperCase() + 'markup']));
            db.save(`${coin}sellbest`, target);
            db.save(`${coin}sellads`,  JSON.stringify(filtered));
            db.save(`${coin}sellnew`,  newprice);
            resolve(true);
            break;
          }
          case 'buy'  : {
            const filtered = [];
            const lastonline = 1000 * 60 * i(settings.lastonline);
            for (let ad of data.offers) {
              const f1 = f(ad.max_amount) >= f(settings[coin.toUpperCase() + 'amt']);
              const f2 = data_price(ad, coin, true);
              const f3 = settings.blacklist.includes(ad.username.toLowerCase());
              const f4 = ad.disabled === false;
              const f5 = ad.currency === "MYR";
              const f6 = data_date(ad.last_online_all, lastonline);
              const f7 = f(ad.buyer_trust_score) >= f(settings.score);
              if (f1 && f2 && !f3 && f4 && f5 && f6 && f7) {
                filtered.push({price: f2, user: ad.username, max: ad.max_amount});
              }
            }
            const target   = filtered.reduce((max, ad) => f(ad.price) > f(max) ? f(ad.price) : f(max), 0);
            const newprice = f(target + f(settings[coin.toUpperCase() + 'markup']));
            db.save(`${coin}buybest`, target);
            db.save(`${coin}buyads`,  JSON.stringify(filtered));
            db.save(`${coin}buynew`,  newprice);
            resolve(true);
            break;
          }
          default     :
            resolve(true);
            break;
        }
      }).
      catch(data => {
        debug(data);
        resolve(false);
      });
    });
  });
  const data_update   = Object.freeze(async () => {
    try {
      let data_all = [];
      for (let pair of pairs) {
        data_all.push(data_filter('sell', pair));
        data_all.push(data_filter('buy',  pair));
      }
      await Promise.all(data_all);
    }
    catch(err) {
      debug("Data update error.");
    } finally {
      lastupdate = Date.now();
      setTimeout(data_update, 2e4);      
    }
  });
  
  const presskey      = Object.freeze(async (page, times, key) => {
    for (let i = 0; i < times; i++) {
      await page.keyboard.down(key);
      await page.keyboard.up(key);
    }
    return;
  });
  const pressreturn   = Object.freeze(async (page) => {
    await page.keyboard.down('Shift');
    await page.keyboard.down('Enter');
    await page.keyboard.up('Enter');
    await page.keyboard.up('Shift');
    return;
  });
  const typeword      = Object.freeze(async (page, word, tab) => {
    for (let letter of word.split('')) {
      await presskey(1, 'Shift');
      await page.keyboard.sendCharacter(letter);
    }
    if (tab) {
      await presskey(page, 1, "Tab");
      await sleep(range(900,2156));
    }
    return;
  });
  const typemessage   = Object.freeze(async (page, message) => {
    const msg = message.split("");
    for (const i of msg) {
      if (i == "\n" || i == '\t' || i == '\r') {
        await pressreturn(page);
      }
      else if (i == " ") {
        await presskey(page, 1, 'Space');
      }
      else {
        await page.keyboard.sendCharacter(i);
      }
    }
    return;
  });
  const evidence      = Object.freeze(async (page) => {
    await page.screenshot({
      path: "/home/public/app/evidence.jpeg",
      fullPage: true,
      type: 'jpeg',
      quality: 80
    });
    return;
  });
  
  const account_login  = Object.freeze(async () => {
    let page    = pages.account;
    let maxwait = 3e2;
    try {
      await page.goto(loginurl, {waitUntil: "load", timeout: 2e4});
    } catch(err) {
      await evidence(page);
    }
    await page.waitFor(15e3);
    if ((await page.evaluate(() => document.querySelector('.balance') ? true : false))) {
      loggedin = true;
      lastupdate = Date.now();
      return true;
    }
    else {
      await page.focus('input[name="email"]');
      await typeword(page, settings.email, true);
      await evidence(page);
      await pressreturn(page);
      await pressreturn(page);
      await evidence(page);
      while (true) {
        await sleep(1000);
        maxwait--;
        if (loginlink || !maxwait) break;
      }
      if (!loginlink) {
        await evidence(page);
        debug("Bot failed to login to account.");
        lastupdate = Date.now();
        return false;
      }
      else {
        try {
          await page.goto(loginlink, {waitUntil: "load", timeout: 2e4});
        } catch(err) {
          await evidence(page);
        }
        try {
          await page.waitForSelector('.balance');
          loggedin = true;
          lastupdate = Date.now();
          return true;
        }
        catch(err) {
          void debug(err);
          await evidence(page);
          return false;
        }
        finally {
          loginlink = false;
        }
      }
    }
  });
  const account_offers = Object.freeze(async () => {
    if (!loggedin) return false;
    let page = pages.account;
    let alloffers = {};
    for (let pair of pairs) {
      let offers = [];
      try {
        await page.goto(`https://remitano.com/${pair}/my/dashboard/escrow/offers`,{waitUntil: "load", timeout: 2e4});
      } catch(err) {
        await evidence(page);
      }
      try {
        try {
          await page.waitForSelector('.offer', {timeout: 10000});
        } catch(err) {
          await evidence(page);
        }
        offers = await page.evaluate(() => {
          let ids   = [];
          let nodes = Array.from(document.querySelectorAll('div[class*="offer-"]'));
          nodes.forEach(node => {
            let names = node.classList.value.split(' ');
            names.forEach(name => {
              let sufix = name.split('-');
              if (sufix.length > 1) {
                if (parseInt(sufix[1]) > 100) ids.push(sufix[1]);
              }
            });
          });
          return ids;
        });
      }
      catch(err) {
        void debug('No offers for: ' + pair);
      }
      finally {
        alloffers[pair] = offers;
      }
    }
    void db.save('myoffers', JSON.stringify(alloffers));
    lastupdate = Date.now();
    return true;
  });
  const account_update = Object.freeze(async () => {
    let page   = pages.account;
    let offers = db.get('myoffers') || {};
    for (let pair of Object.keys(offers)) {
      let offerlist = [];
      for (let offer of offers[pair]) {
        debug('working on ' + pair + "offer " + offer);
        try {
          await page.goto(`https://remitano.com/${pair}/my/offers/${offer}/edit`, {timeout: 2e4});
        } catch(err) {
          await evidence(page);
        }
        await page.waitFor(1.5e4);
        await evidence(page);
        debug('Checking offer type');
        let offertype = await page.evaluate(() => {
          var sell = document.querySelectorAll('.offer-details .offer-type-sell.btn.active').length ? 'sell' : false;
          var buy  = document.querySelectorAll('.offer-details .offer-type-buy.btn.active').length ? 'buy' : false;
          return sell || buy;
        });
        debug('Offer type: ' + offertype);
        let price     = offertype == 'sell' ? db.get(`${pair.toLowerCase()}sellnew`) : db.get(`${pair.toLowerCase()}buynew`);
        if (price < 1 || price > 10000) {
          debug('abnormal price');
          price = settings.backup;
        }
        await evidence(page);
        debug('Entering price');
        await page.evaluate(() => {
          document.querySelectorAll('.btn-change')[0].click();
          return true;
        });
        await evidence(page);
        await page.evaluate(() => {
          document.querySelector('input[name="price"]').click();
          document.querySelector('input[name="price"]').focus();
        });
        await evidence(page);
        await presskey(page, 20, 'ArrowRight');
        await presskey(page, 20, 'Backspace');
        await evidence(page);
        await typeword(page, price.toString(), true);
        await evidence(page);
        await page.evaluate(() => {
          document.querySelector('button[type="submit"]').click();
          document.querySelector('button[type="submit"]').click();
          return true;
        });
        await evidence(page);
        debug('Waiting for confirmation');
        try {
          await page.waitForSelector('.flash-messages');
        } catch(err) {
          debug('check evidence');
          await evidence(page);
        }
        offerlist.push({offer: offer, price: price, type: offertype});
        lastupdate = Date.now();
      }
      void db.save(pair + 'ads', JSON.stringify(offerlist));
    }
    return true;
  });
  const account_action = Object.freeze(async () => {
    try {
      await account_login();
      await account_offers();
      await account_update();
    } catch(err) {
      debug(err);
    } finally {
      await sleep(5e3);
      return account_action();
    }
  });
  
  (async () => {
    browser        = await puppeteer.launch({
      args: [ "--no-sandbox",
        "--disable-setuid-sandbox",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        `--user-agent=${agent.random().toString()}`
      ],
      headless: true,
      ignoreHTTPSErrors: true
    });
    pages.account  = await browser.newPage();
    pages.account.on('error', async (err) => {
      try {
        pages.account.close();
        pages.account = await browser.newPage();
        pages.account.setViewport(view);
      } catch(err) {
        debug(err);
        pages.account = await browser.newPage();
        await pages.account.setViewport(view);
      } finally {
        loggedin = false;
      }
    });
    
    await pages.account.setViewport({width:1920,height:1080});
    void data_getrates();
  })();
}

module.exports = {Bot};

