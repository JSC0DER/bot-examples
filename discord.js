//######## SETUP #########//
const UserAgent = require('user-agents');
const cluster = require('cluster');
const fetch = require('node-fetch');
const cmd = require('child_process');
const fs = require("fs-extra");
const moment = require('moment');
const ua = new UserAgent({deviceCategory:'desktop'});
const home = "/home/discord/files/";
//######## SETUP #########//

const random = (length, code) => {
  const rl = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ0123456789';
  const rc = rl.charAt(Math.floor(Math.random() * rl.length));
  code ? code += rc : code = rc;
  return length ? random(length -= 1, code) : code;
}
const random_name = (s) => {
  const rn = require('node-random-name');
  return s ? rn().split(' ') : rn();
}
const random_int = (l, s) => {
  const r = Math.random().toString().slice(2);
  const rv = r.slice(0, s ? s : r.length);
  return l ? parseInt(rv) : rv;
}
const random_number = (min, max) => {
  return Math.floor(Math.random() * (max - min) + 1) + min;
}
const random_country = () => {
  const countries = {
    uk:"united kingdom",
    ru:"russia",
    nl:"netherlands",
    il:"israel",
    ee:"estonia",
    ua:"ukraine",
    pl:"poland",
    ph:"philippines",
    br:"brazil",
    fr:"france"
  };
  const ctys = Object.keys(countries);
  const rc = random_number(0, ctys.length - 1);
  return [countries[ctys[rc]], ctys[rc]];
}
const random_email = () => {
	const lst = [
		"@yandex.com"
		// "@gmail.com",
		// "@yahoo.com",
		// "@gmx.com",
		// "@mail.com",
		// "@outlook.com"
	];
	return lst[0];
};

const islink = (link) => {
  const a = link.indexOf('discordapp.com/invite');
  const b = link.indexOf('discord.gg');
  if (a > -1) return true;
  else if (b > -1) return true;
  else return false;
}
const resetconst = (oo, ot) => {
  for (let bp in ot) {
    oo[bp] = ot[bp];
  }
  return;
}
const sleep = (t) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, t);
  });
}

const browser_create = async (rd, data) => {
  const puppeteer = require("puppeteer");
  const args = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-infobars",
    "--disable-gpu",
    "--window-position=0,0",
    "--ignore-certifcate-errors",
    `--user-agent=${ua.random().toString()}`,
    `--proxy-server=${data.proxy}`
  ];
  const browserFetcher = puppeteer.createBrowserFetcher();
	const revisionInfo = await browserFetcher.download('594312');
  const options = {
    args,
    executablePath: revisionInfo.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
    userDataDir: rd
  };
  await fs.ensureDir(rd);
  return await puppeteer.launch(options);
}
const browser_window = async (browser) => {
  return await browser.createIncognitoBrowserContext();
}
const browser_page = async (window) => {
  return await window.newPage();
}
const browser_ip = async (page, data) => {
  thread_status('Checking IP.');
  await page.authenticate({username:data.proxyauth[0],password:data.proxyauth[1]});
  await page.goto('https://api.ipify.org/');
	await evidence(page)
  const ip = await page.evaluate('document.body.innerText');
  thread_status('Session IP: '+ip);
  return;
}

const page_config = async (page) => {
  await page.setViewport({width: 1366, height: 768});
  const trick_one = async () => {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en'],
      });
    });
    await page.evaluateOnNewDocument(() => {
      const plugs = () => {
        const arr = new Array(random_number(3,20));
        for (let i = 0; i < arr.length; i++) {
          arr[i] = random_number(0, 1000000);
        }
        return arr;
      };
      Object.defineProperty(navigator, 'plugins', {
        get: () => plugs(),
      });
    });
    await page.evaluateOnNewDocument(() => {
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });
  };
  const trick_two = async () => {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(window, 'navigator', {
        appCodeName: {[random(56)]:random(56)},
        appName: {[random(56)]:random(56)},
        appVersion: {[random(56)]:random(56)},
        bluetooth: {[random(56)]:random(56)},
        clipboard: {[random(56)]:random(56)},
        connection: {[random(56)]:random(56)},
        cookieEnabled: true,
        credentials: {},
        deviceMemory: {[random(56)]:random(56)},
        doNotTrack: {[random(56)]:random(56)},
        geolocation: {[random(56)]:random(56)},
        hardwareConcurrency: {[random(56)]:random(56)},
        keyboard: {[random(56)]:random(56)},
        language: "en-US",
        languages: ["en-US", "en", random(56)],
        locks: {[random(56)]:random(56)},
        maxTouchPoints: {[random(56)]:random(56)},
        mediaCapabilities: {[random(56)]:random(56)},
        mediaDevices: {[random(56)]:random(56)},
        mimeTypes: [],
        onLine: true,
        userAgent: ua.random().toString(),
        permissions: {[random(56)]:random(56)},
        platform: {[random(56)]:random(56)},
        plugins: {[random(56)]:random(56)},
        presentation: {[random(56)]:random(56)},
        product: {[random(56)]:random(56)},
        productSub: {[random(56)]:random(56)},
        usb: {[random(56)]:random(56)},
        vendor: {[random(56)]:random(56)},
        vendorSub: {[random(56)]:random(56)},
      });
    });
  };
  // await trick_one();
  await trick_two();
  return page;
}
const page_url = (url) => {
  // const scrun = ['.png','.jpg','.jpeg','.mp4','.mp3','v6/science']
  const scrun = ['v6/science'];
  for (let sc of scrun) {
    if (url.indexOf(sc) > -1) return true;
  }
  return false;
}

const evidence = async (page, clear) => {
  const dir = home + "evidence/";
  if (clear) await fs.emptyDir(dir);
  await page.screenshot({
    path: dir + (await thread_evidence()) + ".jpeg",
    fullPage: true,
    type: 'jpeg',
    quality: 20
  });
  return;
}
const evidence_bot = async (page) => {
  await page.screenshot({
    path: `/home/discord/public/img/evidence${await thread_evidence(true)}.jpeg`,
    fullPage: true,
    type: 'jpeg',
    quality: 20
  });
  return;
}

const presskey = async (page, times, key) => {
  for (let i = 0; i < times; i++) {
    await page.keyboard.down(key);
    await page.keyboard.up(key);
  }
  return;
}
const pressreturn = async (page) => {
  await page.keyboard.down('Shift');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await page.keyboard.up('Shift');
  return;
}
const typeword = async (page, word, tab) => {
  for (let letter of word.split('')) {
    await presskey(1, 'Shift');
    await page.keyboard.sendCharacter(letter);
  }
  if (tab) {
    await presskey(page, 1, "Tab");
    await sleep(random_number(900,2156));
  }
  return;
}
const typemessage = async (page, message) => {
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
}

const captcha_solve_google = async (page, key, data) => {
  thread_status('Solving captcha.');
  const url = `${data.curl}?key=${data.ckey}&method=userrecaptcha&googlekey=${key}&pageurl=${page}`;
  const submit = () => {
    return new Promise((resolve, reject) => {
      fetch(url).then(res => resolve(res.text()));
    });
  };
  const result = (id) => {
    return new Promise((resolve, reject) => {
      const params = `?key=${data.ckey}&action=get&id=${id}`;
      fetch(data.cres + params).then(res => resolve(res.text()));
    });
  };
  const getres = async (id) => {
    await sleep(20000);
    const code = await result(id);
    if (code.indexOf('NOT_READY') > -1) {
      console.log(code);
      return await getres(id);
    }
    else if (code.length < 50) {
      console.log('google captcha attempt failed');
      return false;
    } else return code.split('|')[1].trim();
  };
  const rid = await submit();
  let ret;
  try {
    ret = await getres(rid.split('|')[1]);
    console.log(ret);
  } catch(e){
    console.log(e);
    ret = false;
  }
  return ret;
}
const captcha_solve_sms = async (gdata) => {
  const cty = random_country();
  const data = {
    country: cty[0],
    countrycode: cty[1]
  };
  const get_number = () => {
    const params = `?metod=get_number&country=${cty[1]}&service=opt45&apikey=${gdata.skey}`;
    return new Promise((resolve, reject) => {
      fetch(gdata.surl + params).then(res => resolve(res.json()));
    });
  };
  const result = await get_number();
  console.log(result);
  if (!result.number) return false;
  data.number = result.number;
  data.id = result.id;
  data.check = async (sms, data) => {
    const getsms = () => {
      const params = `?metod=get_sms&country=${sms.countrycode}&service=opt45&apikey=${data.skey}&id=${sms.id}`;
      return new Promise((resolve, reject) => {
        fetch(data.surl + params).then(res => resolve(res.json()));
      });
    };
    const checksms = async () => {
      const text = await getsms();
      console.log(text);
      if (!text.sms) {
        await sleep(21000);
        return await checksms();
      } else return text.sms;
    };
    return await checksms();
  }
  return data;
}

const discord_phone = async (page, data) => {
  thread_status('Phone verification.');
  const sms = await captcha_solve_sms(data);
  await page.evaluate("document.querySelectorAll('div[class*=phone]')[0].click();");
  await page.evaluate("document.querySelectorAll('div[class*=countryButton]')[0].click();");
  await typeword(page, sms.country);
  await page.evaluate("document.querySelectorAll('div[class*=countryName]')[0].click();");
  await page.evaluate("document.querySelectorAll('input[class*=input]')[0].focus();");
  await typeword(page, sms.number);
  await page.waitFor(1000);
  await page.evaluate("document.querySelectorAll('button[class*=sendButton]')[0].click();");
  await page.waitFor(2500);
  const check4 = await page.evaluate(`document.querySelectorAll('input[maxlength="1"]').length > 0 ? true : false;`);
  await evidence(page);
  if (check4) {
    const code = await sms.check(sms, data);
    for (const number of code.split('')) {
      await typeword(page, number);
      await page.waitFor(500);
    }
    await page.waitFor(5000);
    await evidence(page);
    return true;
  }
  else {
    thread_status('Check evidence to identify error.');
    return false;
  }
}
const discord_create = async (page, data) => {
  if (!data.user) {
    console.log('bad user info');
    return false;
  }
  if (!(await thread_check())) throw "Bot stopped";
  thread_status('Creating account');
  await page.authenticate({username:data.proxyauth[0],password:data.proxyauth[1]});
  await page.goto("https://discordapp.com/register?redirect_to=%2Factivity");
  // await evidence(page, true);
  await page.waitForSelector("form input[type=email]");
  await page.evaluate("document.querySelector('form input[type=email]').focus();");
  await typeword(page, data.user.email, true);
  await typeword(page, data.user.username, true);
  await typeword(page, data.user.password, true);
  await page.evaluate(`d=document.querySelector('input[type*=checkbox]');if(d){d.click()}`);
  await presskey(page, 1, "Enter");
  await evidence(page);
  if (!(await thread_check())) throw "Bot stopped";
  await page.waitFor(15000);
  if (!(await thread_check())) throw "Bot stopped";
  await evidence(page);
  const check1 = await page.evaluate("document.querySelector('div[class*=subTitle]') ? true : false;");
  const check2 = await page.evaluate("document.querySelectorAll('iframe').length > 0 ? true : false;");
  if (check1 && check2) {
    thread_status('Captcha detected');
    await discord_captcha(page, data);
  }
  thread_status('Waiting for submission');
  try{await page.waitForSelector("div[class*=phone]",{timeout:60000})}catch(e){}
  await evidence(page);
  const check3 = await page.evaluate("document.querySelector('div[class*=phone]') ? true : false;");
  if (check3) await discord_phone(page, data);
  await page.evaluate(`c=document.querySelectorAll('form[class*=modal] button')[0];if(c){c.click()}`);
  const check5 = await page.evaluate("document.querySelectorAll('span.username').length > 0 ? true : false");
  await evidence(page);
  if (check5) {
    thread_post(data.user.email, 'accountupdate');
    thread_status('Discord account created successfully');
    return true;
  }
  else {
    thread_status('There was a problem creating discord account, check evidence for potential error.');
    return false;
  }
}
const discord_login = async (page, data) => {
  thread_status('Logging into: '+data.user.email+' account');
  if (!(await thread_check())) throw "Bot stopped";
  await page.authenticate({username:data.proxyauth[0],password:data.proxyauth[1]});
  await page.goto("https://discordapp.com/login?redirect_to=%2Factivity");
  await page.waitForSelector("form input[type=email]");
  await evidence(page);
  await typeword(page, data.user.email);
  await presskey(page, 1, "Tab");
  await sleep(random_number(500,1100));
  await typeword(page, data.user.password);
  await sleep(random_number(500,1100));
  await presskey(page, 1, "Tab");
  await presskey(page, 1, "Enter");
  await page.waitFor(15000);
  await evidence(page);
  thread_status('Verifiying login.');
  let logged = await page.evaluate(() => {
    if (document.querySelector('div[class*=accountDetails] .username')) return true;
    else return false;
  });
  thread_status('Login status: '+logged);
  if (!logged) {
    if (!(await thread_check())) throw "Bot stopped";
    await discord_captcha(page, data);
    try {
      await page.waitForSelector("div[class*=accountDetails] .username", {timeout:60000});
      logged = true;
    } catch(e){}
    await evidence(page);
    let check3 = false;
    try {
      await page.waitForSelector("div[class*=phone]", {timeout:20000});
      check3 = true;
    } catch(e){}
    if (check3) {
      await discord_phone(page, data);
      await page.waitFor(3000);
    }
    await evidence(page);
    const disabled = await page.evaluate(() => {
      const g = document.querySelector('form input[type=email]') ? true : false;
      if (g) {
        const f = document.querySelectorAll('form[class*=authBox]')[0].innerText;
        if (f.indexOf('disabled') > -1) return f;
        else return false;
      } else return false;
     });
    console.log('Account disabled: ' +disabled);
    if (disabled) {
      thread_post(data.user.email, 'accountdisable');
      thread_status(data.user.email + ' account has been disabled.');
    }
    await evidence(page);
    console.log('Login status: '+logged);
    return logged;
  }
  else {
  	await evidence(page);
  	return logged;
  }
}
const discord_join = async (page, data) => {
	thread_status('Joining server: '+data.link);
	if (!(await thread_check())) throw "Bot stopped";
	await page.authenticate({username:data.proxyauth[0],password:data.proxyauth[1]});
  await page.goto(data.link);
  await evidence(page);
  try {
  	await page.waitForSelector('button');
  	await page.evaluate("document.querySelectorAll('button')[0].click();");
  } catch(e){}
  try {
    await page.waitFor(2000);
    const iviv = await page.evaluate(()=>{
      const f = document.querySelectorAll('div[class*=subTitle]');
      if (f) {
        if (f[0].innerText.toLowerCase().indexOf('might not have permission') > -1) return true;
        else return false;
      } else return false;
    });
    console.log(iviv);
    if (iviv) {
      thread_post(data.link, "completedlink");
      return false;
    }
  } catch(e) {console.log(e)}
  try{await page.waitForSelector("div[class*=membersGroup]", {timeout:60000});}catch(e){}
  await evidence(page);
  const invalid = await page.evaluate("document.querySelectorAll('div[class*=memberGroupsPlaceholder]').length > 0 ? true : false;");
  thread_status('Making sure server is accessible');
  if (invalid) {
    thread_status(data.link + " is missing access or invalid.");
    thread_post(data.link, 'invalidlink');
    return false;
  }
  else {
    await page.waitForSelector('header[class*=header] span[class*=name]');
    return await page.evaluate("window.location.href");
  }
}
const discord_message = async (page, gdata, pageurl) => {
  if (!(await thread_check())) throw "Bot stopped";
  const data = {
  	ss: 0,
  	sh: 0,
    ht: parseInt(await page.evaluate(`window.innerHeight`)),
    pl: await page.evaluate("window.location.href"),
    qm: gdata.title,
    un: gdata.user.username
  };
  const find_online = async () => {
    if (!(await thread_check())) throw "Bot stopped";
    thread_status('Finding unique online user.');
    try{await page.waitForSelector("div[class*=membersGroup]");}catch(e){}
    const uniqueuser = {found: false, scrolls: 0, online: false};
    while (!uniqueuser.online) {
      const result = await page.evaluate((data, tscrolls) => {
      	let ds = document.querySelectorAll('div[class*=membersGroup]');
      	let od = false;
      	let bl = ['moderator','admin','bot','community','support','dev','owner',]
        for (const d of ds) {
          let dt = d.innerText.toLowerCase();
          for (let b of bl) {
            if (dt.indexOf(b) > -1) od = true;
          }
      	}
      	document
      	  .querySelectorAll('div[class*=membersWrap] div[class*=scroller-]')[0]
      	  .scrollBy(0, data.sh += data.ht);
      	  tscrolls += 1;
      	 return [od, tscrolls];
      }, data, uniqueuser.scrolls);
      uniqueuser.scrolls = result[1];
      if (!result[0]) {
        uniqueuser.online = true;
        break;
      }
      else if (uniqueuser.scrolls > 1000) {
        thread_status("Can't find online users. Scrolled 1000 times.");
        throw "Can't find online users. Scrolled 1000 times.";
      }
    }
    data.cu = await thread_get('contacted');
    while (!uniqueuser.found) {
      const onlineuser = await page.evaluate((data, tscrolls) => {
        const olm = document.querySelectorAll('div[class*=memberOnline] span[class*=username-]');
        for (let cm of olm) {
          if (!data.cu[cm.innerText]) {
            cm.click();
            document.querySelectorAll('input[class*=quickMessage]')[0].value = data.qm;
            return [cm.innerText,tscrolls];
          }
        }
      	document.querySelectorAll('div[class*=membersWrap] div[class*=scroller-]')[0].scrollBy(0, data.sh += data.ht);
      	tscrolls += 1
      	return [false, tscrolls];
      }, data, uniqueuser.scrolls);
      uniqueuser.scrolls = onlineuser[1];
      if (onlineuser[0]) {
        uniqueuser.found = onlineuser[0];
        thread_post(uniqueuser.found, 'newcontact');
        await sleep(random_number(300, 1111));
        break;
      }
      else if (uniqueuser.scrolls > 2000) {
        thread_status("Can't find online users. Scrolled 2000 times. All users contacted.");
        break;
      }
    }
    if (!uniqueuser.found) {
      thread_post(gdata.link, 'completedlink');
      return {s: 0, m: ('Contacted all possible users.')};
    }
    await evidence(page);
		thread_status('Found user: ' + uniqueuser.found);
	  let uc = 1009;
	  await presskey(page, 1, 'Enter');
	  while (uc-=1) {
	    let ul = await page.evaluate("window.location.href");
	    if (ul !== data.pl) break;
	  }
	  try{await page.waitForSelector("textarea[class*=textArea]");}catch(e){}
	  const tb = await page.evaluate(()=>{
	    let d = document.querySelectorAll('textarea[class*=textArea]');
	    if (!d) return false;
	    else {
	      let c = 3;
	      while(c-=1) {
	        d[0].click();
	      }
	      return true;
	    }
	  });
	  if (!tb) thread_status("Error getting to user message page.");
	  else {
	    await typemessage(page, gdata.message);
	    await page.evaluate(()=>{
  	    let d = document.querySelectorAll('textarea[class*=textArea]');
  	    try {
  	      let c = 3;
  	      while(c-=1) {
  	        d[0].focus();
  	      }
  	      return true;
  	    } catch(e){return false;}
  	  });
      await evidence(page);
      await presskey(page, 2, 'Enter');
	    try{await page.waitForSelector("textarea[class*=textArea]");}catch(e){}
	    await evidence(page);
      const dv = await page.evaluate(()=>{
        const v = document.querySelectorAll('div[class*=messages] h2[class*=headerCozy] span[class*=username]');
        const b = v[v.length - 1];
        return b.innerText.toLowerCase()
      });
      if (dv == data.un.toLowerCase()) {
        thread_post(uniqueuser.found, 'newcontact');
        await evidence_bot(page);
        thread_status('Message has been confirmed.');
      }
      else {
        await evidence(page);
        const blocked = await page.evaluate(()=>{
         const m = document.querySelectorAll('div[class*=contentCozy]');
         const n = m[m.length - 1];
         if (n.innerText.toLowerCase().indexOf('disabled direct message') > -1) return true;
         else return false;
        });
        if (blocked) {
          thread_post(uniqueuser.found, 'newcontact');
          thread_status('User has disabled direct messages.');
        } else {
          thread_status('Problem sending message.');
          throw 'Message limit or error';
        }
      }
	  }
    await evidence(page);
    await page.authenticate({username:gdata.proxyauth[0],password:gdata.proxyauth[1]});
	  await page.goto(data.pl);
    return {s: 1, m: "Running again."};
	};
  if (data.pl !== pageurl) {
    await page.authenticate({username:data.proxyauth[0],password:data.proxyauth[1]});
	  await page.goto(pageurl);
  }
  await evidence(page, true);
  return await find_online();
};
const discord_captcha = async (page, data) => {
  const key = await page.evaluate("document.querySelectorAll('iframe')[0].src.split('k=')[1].split('&')[0]");
  const url = await page.evaluate("window.location.href");
  const code = await captcha_solve_google(url, key, data);
  await page.evaluate(`
    try {window.___grecaptcha_cfg.clients[0].xd.O.callback("${code}");}catch(e){}
  `);
  return;
}

const thread_status = (s) => {
  process.send({
    status: true,
    text: `${s}   |-------> Thread ID: ${process.pid}`,
    id: process.pid
  });
};
const thread_error = (e) => {
  process.send({
    error: true,
    text: e,
    id: process.pid
  });
};
const thread_post = (data, name) => {
  process.send({
    key: name,
    data: data,
    id: process.pid,
    post: true
  });
};
const thread_launch = () => {
  return new Promise((resolve, reject) => {
    process.send({
      launch: true,
      id: process.pid
    });
    process.on('message', m => {
      if (m.user) resolve(m);
    });
    setTimeout(()=>{
      resolve(false);
    },10000);
  });
};
const thread_evidence = (type) => {
  return new Promise((resolve, reject) => {
    process.send({
      evidence: true,
      id: process.pid,
      key: type
    });
    process.on('message', m => {
      if (m.evidence) resolve(m.total);
    });
    setTimeout(() => {
      resolve(false);
    }, 10000);
  });
}
const thread_check = () => {
  return new Promise((resolve, reject) => {
    process.send({
      check: true,
      id: process.pid,
    });
    process.on('message', m => {
      if (m.active) resolve(true);
    });
    setTimeout(()=>{
      resolve(false);
    },3000);
  })
};
const thread_get = (name) => {
  return new Promise((resolve, reject) => {
    process.send({
      key: name,
      id: process.pid,
      get: true
    });
    process.on('message', m => {
      if (m.contacts) resolve(m.data);
    });
    setTimeout(()=>{
      resolve(false);
    },3000);
  });
}

const main = async() => {
  const data = await thread_launch();
  const rdir = home + random(10);
  const br = await browser_create(rdir,data);
  const br_window = await browser_window(br);
  const br_page = await page_config((await browser_page(br_window)));
  const messenger = async (data, url) => {
    const msgs = await discord_message(br_page, data, url);
    thread_status(msgs.m);
    if (msgs.s === 1) return await messenger(data, url);
    else return;
  };
  const create = async (page, data) => {
    const names = random_name(true);
    const u = names.join('') + random_int(true, 5);
    const user = {
	    firstname: names[0],
	    lastname: names[1],
	    username: u,
	    password: random(16),
	    email: u + random_email(),
	    date: new Date().toString(),
	    discordactive: 'no',
	    emailblock: 'fake email',
	    discordusers: '',
    };
    thread_post(user, 'account');
    const status = await discord_create(page, data);
    if (user.email && status) {
      const one = await discord_join(br_page, data);
      if (!one) return false;
      await messenger(data, one);
      return true;
    }
    else {
      thread_status('Error creating account.');
      return false;
    }
  };
  const login = async (page, data) => {
    const one = await discord_login(br_page, data);
    if (!one) return false;
    const two = await discord_join(br_page, data);
    if (!two) return false;
    const three = await messenger(data, two);
    return true;
  };
  try {
    if (!data) throw 'Data error';
    await evidence(br_page, true);
    await br_page.setRequestInterception(true);
    br_page.on('request', req => {
      if (page_url(req.url())) req.abort();
      else req.continue();
    });
    br_page.on('error', async e => {
      console.log(e);
      await br_window.close();
      await br.close();
      await fs.remove(rdir);
      console.log("restarting app...");
      global_data.running = false;
    });
    await br_page.setDefaultNavigationTimeout(60000);
    await browser_ip(br_page, data);
    const status = data.user ?
      await login(br_page, data) :
      await create(br_page, data);
  }
  catch(e) {
    console.log(e);
    thread_error(e);
  }
  finally {
    console.log('done')
    await br_window.close();
    await br.close();
    await fs.remove(rdir);
    const ra = await thread_check();
    if (data.user) thread_post(data.user.email, 'release');
    if (ra) return await main();
    else {
      thread_status('Bot stopped.');
      thread_post(process.pid, 'killme');
      process.exit();
    }
  }
}

const thread_master = async () => {
  const Database = require('better-sqlite3');
  const http = require("http");
  const routes = {};
  const accountdb = new Database(home + 'accounts.db');
  const global_data = fs.readJsonSync(home + 'settings.json');
  const contactedusers = fs.readJsonSync(home + 'blacklist.json');
  const table = {
  t: (name) => {
    return `CREATE TABLE ${name} (firstname TEXT, lastname TEXT, email TEXT, password TEXT, username TEXT, date TEXT, emailblock TEXT, discordactive TEXT, discordusers TEXT)`;
  },
  n: "accounts"
};
  const dashcache = [];
  const autosave = async () => {
    const gd_backup = global_data;
    const cu_backup = contactedusers;
    try {
      await fs.writeJson((home + 'settings.json'), global_data);
      await fs.writeJson((home + 'blacklist.json'), contactedusers);
    }
    catch(e) {
      console.log(e);
      resetconst(global_data, gd_backup);
      resetconst(contactedusers, cu_backup);
    }
    finally {
      setTimeout(autosave, 5000);
    }
  }
  const autobackup = () => {
    cmd.exec('cp -r /home/discord/* /home/backup/');
    setTimeout(autobackup, 1000 * 60 * 30);
  }
  const autocache = async () => {
    try {
      dashcache[0] = await fs.readFile(global_data.page,'utf8');
    } catch(e) {
      console.log(e)
    } finally {
      setTimeout(autocache, 1000 * 60 * 20);
    }
  }
  
  const botstatus_cache = ['Bot not running.'];
  const botstatus = (s) => {
  	console.log(s);
    botstatus_cache[0] = s;
  };
  
  const db_fresh = (db) => {
    const sdel = db.prepare(`DROP TABLE IF EXISTS ${table.n}`);
    sdel.run();
    const sset = db.prepare(table.t(table.n));
    sset.run();
  };
  const db_get = (db, key, header) => {
    try {
      const commands = [
        `SELECT email FROM ${table.n} ORDER BY random() LIMIT 1`,
        `SELECT * FROM ${table.n} WHERE ${header} = ? ORDER BY random()`
      ];
      if (key && header) return db.prepare(commands[1]).get(key);
      else return db.prepare(commands[0]).get();
    } catch (e) {
      console.log(e);
      return false;
    }
  };
  const db_post = (db, setvalue, setheader, searchheader, searchvalue) => {
    try {
      const command = `UPDATE ${table.n} SET ${setheader} = ? WHERE ${searchheader} = ?`;
      return db.prepare(command).run(setvalue, searchvalue);
    } catch (e) {
      console.log(e);
      return false;
    }
  };
  const db_account = (db, data) => {
    db.prepare(`INSERT INTO ${table.n} (firstname,lastname,email,password,username,date,emailblock,discordactive,discordusers) VALUES ($firstname,$lastname,$email,$password,$username,$date,$emailblock,$discordactive,$discordusers)`).run(data);
    return;
  };
  const db_random = (db, total) => {
    const rt = new Set();
    while (rt.size < total) {
      rt.add(db_get(db, 'yes', 'discordactive'));
    }
    return Array.from(rt);
  };
  
  autosave();
  autobackup();
  autocache();
  global_data.running = false;
  global_data.cr = false;
  global_data.activeaccounts = new Set();
  global_data.activelinks = [];
  accountdb.pragma('journal_mode = wal');
  
  const workers = {};
  const workers_allocate = async (res) => {
    global_data.cr = true;
    if (Object.keys(workers).length < global_data.threads) {
      let base = 5000;
      for (let i = 0; i < global_data.threads; i++) {
        setTimeout(() => {
          const wrk = cluster.fork();
          workers[wrk.process.pid] = wrk;
          wrk.on('message', handle_message);
        }, random_number(base * i, (base * 2) * i));
      }
      res.end('Success');
    }
    else {
      res.end('Active threads reached max.');
    }
  }
  
  const handle_get = async (msg) => {
    try {
      if (msg.key == 'contacted') {
        workers[msg.id].send({contacts:true,data:contactedusers});
      }
    } catch(e) {
      console.log(e);
    }
  };
  const hangle_post = async (msg) => {
    try {
      switch(msg.key) {
        case 'invalidlink':
          if (!global_data.invalidlinks) global_data.invalidlinks = new Set();
          if (global_data.invalidlinks.has(msg.data)) {
            global_data.invalidlinks.delete(msg.data);
            global_data.completed.push(msg.data);
          }
          else {
            global_data.invalidlinks.add(msg.data);
          }
          break;
        case 'completedlink':
          global_data.completed.push(msg.data);
          break;
        case 'accountdisable':
          db_post(accountdb, 'no', 'discordactive', 'email', msg.data);
          break;
        case 'accountupdate':
          db_post(accountdb, 'yes', 'discordactive', 'email', msg.data);
          break;
        case 'newcontact':
          contactedusers[msg.data] = true;
          break;
        case 'account':
          db_account(accountdb, msg.data);
          break;
        case 'release':
          global_data.activeaccounts.delete(msg.data);
          break;
        case 'killme':
          try {
            workers[msg.id].kill();
          } catch(e) {
            console.log(e)
          } finally {
            delete workers[msg.id];
          }
          break;
        default:
          break;
      }
    } catch(e) {
      console.log(e);
    }
  };
  const hangle_check = async (msg) => {
    try {
      workers[msg.id].send({active:global_data.cr});
    } catch(e) {
      console.log('process does not exist');
    }
  };
  const hangle_error = async (msg) => {
    console.log(msg.text);
  };
  const hangle_status = async (msg) => {
    botstatus(msg.text);
  };
  const hangle_launch = async (msg) => {
    try {
      console.log('new bot instance');
      workers[msg.id].send({
        message: global_data.message,
        title: global_data.title,
        link: (() => {
          let searchon = true;
          let count = 0;
          while (searchon) {
            if (count >= global_data.link.length) {
              global_data.completed = [];
              botstatus('Completed all links. Starting over.');
              // searchon = false;
              // return false;
            }
            else if (global_data.completed.includes(global_data.link[count])) count+=1;
            else if (global_data.activelinks.includes(global_data.link[count])) count+=1;
            else {
              searchon = false;
              break;
            }
          }
          global_data.activelinks.push(global_data.link[count]);
          return global_data.link[count];
        })(),
        user: (() => {
          let isactive = true;
          let control = 500;
          if (!global_data.activeaccounts) global_data.activeaccounts = new Set();
          while (isactive && (control-=1)) {
            const u = db_get(accountdb, 'yes', 'discordactive');
            if (!global_data.activeaccounts.has(u.email)) {
              isactive = false;
              global_data.activeaccounts.add(u.email);
              return u;
            }
          }
          return false;
        })(),
        proxyauth: global_data.proxyauth,
        proxy: global_data.proxy,
        ckey: global_data.ckey,
        skey: global_data.skey,
        surl: global_data.surl,
        curl: global_data.curl,
        cres: global_data.cres
      });
    } catch(e) {
      console.log(e);
    }
  };
  const handle_evidence = (msg) => {
    if (msg.key) {
      try {
        global_data.tms += 1;
        global_data.be.push({
          n:global_data.tms,
          t:moment().format('MMMM Do YYYY, h:mm:ss a')
        });
        workers[msg.id].send({evidence:true,total:global_data.tms});
      } catch(e) {
        console.log(e);
      }
    }
    else {
      try {
        global_data.evc += 1;
        workers[msg.id].send({evidence:true,total:global_data.evc});
      } catch(e) {
        console.log(e);
      }
    }
  }
  const handle_message = (m) => {
    if (m.get) handle_get(m);
    else if (m.post) hangle_post(m);
    else if (m.launch) hangle_launch(m);
    else if (m.check) hangle_check(m);
    else if (m.error) hangle_error(m);
    else if (m.status) hangle_status(m);
    else if (m.evidence) handle_evidence(m);
  };
  
  process.on('unhandledRejection', async error => {
    console.log('unhandledRejection', error.message);
  });
  process.on('warning', e => console.warn(e.stack));
  
  routes.router = async (req, res) => {
    res = routes.addheaders(res);
    if (req.method.toLowerCase() == 'get') {
      res.setHeader('content-type', 'text/html');
      res.end(dashcache[0]);
    }
    else if (req.method.toLowerCase() == 'post') {
      const data = (()=>{try {return JSON.parse(req.headers["x-data"])} catch(e){return false}})();
      if (!data) res.end();
      else if (data.login) {
        if (data.login === global_data.adminkey) {
          res.end(JSON.stringify({
            auth: (() => {
              global_data.adminsession = random(42);
              return global_data.adminsession;
            })(),
            sts: botstatus_cache[0],
            lk: global_data.link,
            msg: encodeURI(global_data.message),
            ttl: encodeURI(global_data.title),
            cap: global_data.ckey,
            tms: global_data.tms,
            al: global_data.activelinks.join(','),
            sms: global_data.skey,
            pxip: global_data.proxy,
            thd: global_data.threads,
            up: global_data.proxyauth.join(':'),
            mde: global_data.mode,
            ip: global_data.sip,
            ev: (() => {
              if (global_data.be.length) {
                return global_data.be.slice((global_data.be.length > 10 ? global_data.be.length - 10 : 0));
              }
              else return false;
            })(),
            t: (() => {
              global_data.token = random(42);
              return global_data.token;
            })()
          }));
        }
        else res.end();
      }
      else if (data.savedata) {
        if (data.auth == global_data.adminsession) {
          global_data.message = decodeURI(data.msg);
          global_data.title = decodeURI(data.ttl);
          global_data.link = data.link.split(',');
          res.end('Success.')
        } else res.end('Invalid');
      }
      else if (data.savesettings) {
        if (data.auth == global_data.adminsession) {
          global_data.proxy = data.pxip;
          global_data.proxyauth = data.up.split(':');
          global_data.ckey = data.cap;
          global_data.skey = data.sms;
          global_data.mode = data.mde;
          global_data.threads = data.thd;
          res.end('Success.')
        } else res.end('Invalid');
      }
      else if (data.token) {
        if (data.token === global_data.token) {
          const dt = {
            s: botstatus_cache[0],
            al: global_data.activelinks.join(','),
            ts: global_data.tms
          };
          res.end(JSON.stringify(dt));
        } else res.end('');
      }
      else if (data.command) {
        if (data.auth == global_data.adminsession) {
          if (data.command == 'run') {
            if (!global_data.ckey || !global_data.skey) {
              botstatus('Missing API keys. Bot not running.');
              res.end('Fail');
            }
            else workers_allocate(res);
          }
          else if (data.command == 'stop') {
            global_data.cr = false;
            res.end('Success');
          } else res.end('Fail');
        }
      }
      else if (data.clear) {
         if (data.auth == global_data.adminsession) {
           await fs.writeJson(home + 'blacklist.json', {});
           for (let cu in contactedusers) {
             delete contactedusers[cu];
           }
         }
         res.end('success')
      }
      else if (data.erase) {
         if (data.auth == global_data.adminsession) global_data.be = [];
         res.end('success')
      }
      else res.end('');
    }
    else res.end('');
  };
  routes.addheaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    return res;
  };
  
  http.createServer(routes.router).listen(8100);
  
};
const thread_worker = async () => {
  process.setMaxListeners(0);
  console.log('new thread');
  await main();
}

if (cluster.isMaster) thread_master();
else thread_worker();



