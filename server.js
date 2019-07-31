// Dependencies
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const _ = require('lodash');
// MongoClient = require('mongodb').MongoClient,
// Server = require('mongodb').Server,
// CollectionDriver = require('./collectionDriver').CollectionDriver,
// const mongoose = require('mongoose');
// const assert = require('assert');
const TelegramBot = require('node-telegram-bot-api');
// const fs = require('fs');
// const request = require('request');
// const cheerio = require('cheerio');
const Discord = require('discord.js');
const { LanaajaDB } = require('./db');
const { Snapshot } = require('./db');
// const { userActionLog } = require('./db');
// const { Lanaaja } = require('./Lanaaja');

const { renderColumns } = require('./utils');

// Express
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3002);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.use(express.static('public'))

/* //MongoDB
var mongoHost = 'mongodb://localhost:27017/AssyBot';
var collectionDriver;
*/
// Telegram
// var tuomas = new Lanaaja({name: 'Tuomas'});
// tuomas.save();
const token = process.env.TELEGRAMTOKEN;
console.log(token);
// bot which uses polling and getUpdates-method
const telegram = new TelegramBot(token, { polling: true });

// Uncomment for webhook
// const url = 'https://assybot.jokioja.fi'
// var telegram = new TelegramBot(token);
// telegram.setWebHook(`${url}/bot${token}`);

const client = new Discord.Client();
const discordToken = process.env.DISCORDTOKEN;
console.log(discordToken);
client.login(discordToken);

// Bot stuff
// eslint-disable-next-line
let lanaajat = [];
// eslint-disable-next-line
let telegramChatIds = [];
// eslint-disable-next-line
let discordChatIds = [];
const countDownDate = new Date('2019-08-04T14:00:00+00:00').getTime();

// Magic numbers..
const foodDecayHours = process.env.FOODDECAY || 6.0;
const sleepDecayHours = process.env.SLEEPDECAY || 18.0;
const filthGainHours = process.env.FILTHGAIN || 24.0;
// const esGainToSleep = process.env.ESGAIN || 30.0;
const esDiminishingReturns = process.env.ESDIMINISH || 0.3;
const decayIntervalInMinutes = process.env.DECAYINTERVAL || 15.0;
const snapshotIntervalInMinutes = process.env.SNAPSHOTINTERVAL || 5.0;

const decayCountPerHour = 60.0 / decayIntervalInMinutes;

// const warningLevelLow = process.env.WARNINGLEVELLOW || 25.0;
// const warningLevelMed = process.env.WARNINGLEVELMED || 10.0;
// const warningLevelHigh = process.env.WARNINGLEVELHIGH || 5.0;

const foodDecay = 100.0 / foodDecayHours / decayCountPerHour;
const sleepDecay = 100 / sleepDecayHours / decayCountPerHour;
const filthGain = 100 / filthGainHours / decayCountPerHour;

const pieniVitutus = process.env.PIENIVITUTUS || 10;
const suuriVitutus = process.env.SUURIVITUTUS || 20;
const teppoVitutus = process.env.TEPPOVITUTUS || 30;

const defaultSleep = process.env.DEFAULTSLEEP || 100.0;
const defaultEs = process.env.DEFAULTES || 0;
const defaultEsh = process.env.DEFAULTESH || 30.0;
const defaultFood = process.env.DEFAULTFOOD || 100.0;
const defaultMassy = process.env.DEFAULTMASSY || 0;
const defaultMassyh = process.env.DEFAULTMASSYH || 10.0;
const defaultVitutus1 = process.env.DEFAULTVITUTUS1 || 0.0;
const defaultVitutus2 = process.env.DEFAULTVITUTUS2 || 0.0;
const defaultFilth = process.env.DEFAULTFILTH || 0.0;
client.on('ready', () => {
  // addUser"testi1");
  // addUser("testi2");
  console.log('I am ready!');
});

// const getUserByName = name => Lanaaja.findOne({ name }, (err, lanaaja) => {
//   if (err) return 'Lanaaja not found';
//   return lanaaja;
// });

const addUserTelegram = async (username, chatId) => {
  try {
    const lanaaja = await LanaajaDB.findOne({ name: username }).exec();

    if (lanaaja) {
      await LanaajaDB.findOneAndUpdate(
        { _id: lanaaja.id },
        { $set: { telegramChatId: chatId } },
        (err) => {
          // Handle any possible database errors
          if (err) return `Error while saving lanaaja ${username}: ${err}`;
          return 'OK';
          // return `Telegram integration enabled for user ${username}`;
        },
      );
      return `Telegram integration enabled for user ${username}`;
    }
    const newPlayerDB = await new LanaajaDB({
      name: username,
      telegramChatId: chatId,
    });
    newPlayerDB.save();
    return `User ${username} created, telegram integration enabled`;
  } catch (e) {
    return `An error occured: ${e}`;
  }
};

const addUserDiscord = async (username, chatId) => {
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();

  if (lanaaja) {
    await LanaajaDB.findOneAndUpdate(
      lanaaja,
      { $set: { discordChatId: chatId } },
      (err) => {
        // Handle any possible database errors
        if (err) return `Error while saving lanaaja ${username}: ${err}`;
        return 'OK';
      },
    );
    return `Discord integration enabled for user ${username}`;
  }
  const newPlayerDB = await new LanaajaDB({
    name: username,
    discordChatId: chatId,
  });
  newPlayerDB.save();
  return `User ${username} created, discord integration enabled`;
};

const statusMe = async (username) => {
  console.log('statusMe');
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  console.log(lanaaja);
  // const lanaaja = lanaajat.find(x => x.name === username);
  if (lanaaja) {
    let lanpoweri;
    let vitutus1;
    if (lanaaja.sleep > 0 && lanaaja.food > 0) {
      vitutus1 = (100.0 - lanaaja.sleep + (100.0 - lanaaja.food) + lanaaja.filth) / 3
        + 0.5 * lanaaja.vitutus2;
      lanpoweri = (0.8 * lanaaja.sleep
          + 1.2 * lanaaja.food
          + (100.0 - lanaaja.vitutus1))
        / 3;
    } else {
      vitutus1 = 100.0;
      lanpoweri = 0.0;
    }
    const stats = await renderColumns(
      lanaaja.food.toFixed(0),
      lanaaja.sleep.toFixed(0),
      lanaaja.es,
      vitutus1.toFixed(0),
      lanpoweri.toFixed(0),
      lanaaja.massy,
      lanaaja.filth.toFixed(0),
    );
    return `User ${lanaaja.name}${stats}`;
  }
  return `User with username ${username} not found`;
};

const statusAll = async (message) => {
  const kaikkiLanaajat = await LanaajaDB.find().exec();
  kaikkiLanaajat.forEach(async (lanaaja) => {
    telegram.sendMessage(message.chat.id, await statusMe(lanaaja.name));
  });
};

const eatFood = async (username) => {
  await LanaajaDB.findOneAndUpdate(
    { name: username },
    { $set: { food: 100 } },
    (err) => {
      // Handle any possible database errors
      if (err) return `Error while eating food ${username}: ${err}`;
      return 'OK';
    },
  );
  return `${username} just ate!`;
};

const lanaajaSleep = async (username) => {
  await LanaajaDB.findOneAndUpdate(
    { name: username },
    { $set: { sleep: 100 } },
    (err) => {
      // Handle any possible database errors
      if (err) return `Error while sleeping ${username}: ${err}`;
      return 'OK';
    },
  );
  return `${username} just woke up!`;
};

const drinkES = async (username) => {
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  if (lanaaja.es === 0) {
    return `User ${lanaaja.name} has no more ES!!!`;
  }

  let sleep;
  const es = lanaaja.es - 1;
  const esh = lanaaja.esh - esDiminishingReturns * lanaaja.esh;
  if (lanaaja.sleep + lanaaja.esh > 100.0) {
    sleep = 100.0;
  } else {
    sleep += lanaaja.esh;
  }
  await LanaajaDB.findOneAndUpdate(
    { _id: lanaaja.id },
    {
      $set: { sleep, esh, es },
    },
    (err) => {
      // Handle any possible database errors
      if (err) return `Error ES ${username}: ${err}`;
      return 'OK';
    },
  );
  return 'PÄRINÄ PÄÄLLE!';
};

const stashES = async (username, amount) => {
  if (Math.isNaN(amount)) {
    return 'Not a number..';
  }
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  if (lanaaja) {
    const es = lanaaja.es + amount;
    await LanaajaDB.findOneAndUpdate(
      { _id: lanaaja.id },
      {
        $set: { es },
      },
      (err) => {
        // Handle any possible database errors
        if (err) return `Error stashES ${username}: ${err}`;
        return 'OK';
      },
    );
    return `${amount} EEÄSSÄÄ GOT`;
  }
  return 'User not found';
};

const eatMassy = async (username) => {
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  if (lanaaja) {
    if (lanaaja.massy === 0) {
      return `User ${lanaaja.name} has no more MÄSSY!!!`;
    }
    const massyh = lanaaja.massyh - 0.3 * lanaaja.massyh;
    const massy = lanaaja.massy - 1;
    await LanaajaDB.findOneAndUpdate(
      { _id: lanaaja.id },
      { $set: { massyh, massy } },

      (err) => {
        // Handle any possible database errors
        if (err) return `Error Mässy ${username}: ${err}`;
        return 'OK';
      },
    );
    return 'HELEVETIN HYVIÄ MAKKAROITA';
  }
  return 'User not found';
};

const stashMassy = async (username, amount) => {
  if (Math.isNaN(amount)) {
    return 'Not a number..';
  }

  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  if (lanaaja) {
    const massy = lanaaja.massy + amount;
    await LanaajaDB.findOneAndUpdate(
      { _id: lanaaja.id },
      {
        $set: { massy },
      },
      (err) => {
        // Handle any possible database errors
        if (err) return `Error stashMassy ${username}: ${err}`;
        return 'OK';
      },
    );
    return `${amount} MÄSSYY GOT`;
  }
  return 'User not found';
};
const vituttaaVahan = async (username) => {
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  if (lanaaja) {
    const vitutus2 = lanaaja.vitutus2 + pieniVitutus;
    await LanaajaDB.findOneAndUpdate(
      { _id: lanaaja.id },
      {
        $set: { vitutus2 },
      },
      (err) => {
        // Handle any possible database errors
        if (err) return `Error vituttaaVahan ${username}: ${err}`;
        return 'OK';
      },
    );
    return 'paska peli';
  }
  return 'User not found';
};

const vituttaaHelvetisti = async (username) => {
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  if (lanaaja) {
    const vitutus2 = lanaaja.vitutus2 + suuriVitutus;
    await LanaajaDB.findOneAndUpdate(
      { _id: lanaaja.id },
      {
        $set: { vitutus2 },
      },
      (err) => {
        // Handle any possible database errors
        if (err) return `Error vituttaaHelvetisti ${username}: ${err}`;
        return 'OK';
      },
    );
    return 'VITUN JONNET';
  }
  return 'User not found';
};

const teppoaVituttaa = async (username) => {
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  if (lanaaja) {
    const vitutus2 = lanaaja.vitutus2 + teppoVitutus;
    await LanaajaDB.findOneAndUpdate(
      { name: lanaaja.name },
      {
        $set: { vitutus2 },
      },
      (err) => {
        // Handle any possible database errors
        if (err) return `Error teppoaVituttaa ${username}: ${err}`;
        return 'Nooh, tuon olisi voinut pelata paremmin ja käytin ultin liian aikasin..';
      },
    );
  }
  return 'User not found';
};

const eiVituta = async (username) => {
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  if (lanaaja) {
    const vitutus2 = 0;
    await LanaajaDB.findOneAndUpdate(
      { _id: lanaaja.id },
      {
        $set: { vitutus2 },
      },
      (err) => {
        // Handle any possible database errors
        if (err) return `Error vituttaaVahan ${username}: ${err}`;
        return 'OK';
      },
    );
    return ':)';
  }
  return 'User not found';
};

const sauna = async (username) => {
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  if (lanaaja) {
    const filth = 0;
    await LanaajaDB.findOneAndUpdate(
      { _id: lanaaja.id },
      {
        $set: { filth },
      },
      (err) => {
        // Handle any possible database errors
        if (err) return `Error sauna ${username}: ${err}`;
        return 'OK';
      },
    );
    return 'Sauna #1';
  }
  return 'User not found';
};

const getDefaults = () => ({
  sleep: defaultSleep,
  es: defaultEs,
  esh: defaultEsh,
  food: defaultFood,
  massy: defaultMassy,
  massyh: defaultMassyh,
  vitutus1: defaultVitutus1,
  vitutus2: defaultVitutus2,
  filth: defaultFilth,
});

const resetStats = async (username) => {
  const lanaaja = await LanaajaDB.findOne({ name: username }).exec();
  if (lanaaja) {
    await LanaajaDB.findOneAndUpdate(
      { _id: lanaaja.id },
      {
        $set: getDefaults(),
      },
      (err) => {
        // Handle any possible database errors
        if (err) return `Error resetStats ${username}: ${err}`;
        return 'OK';
      },
    );
    return `${lanaaja.name}'s stats have been reset!`;
  }
  return 'User not found';
};

const help = () => `Komennot: \n
    /adduser - Lisää käyttäjä \n
    /assytimer - Assembly 2018 countdown \n
    /drinkes - Juo ES \n
    /eatfood - Syö ruokaa \n
    /eatmassy - Syö mässyä \n
    /eivituta - Nyt ei vituta \n
    /sauna - Käy saunassa \n
    /sleep - Nuku \n
    /stashes - Päivitä ES määrä \n
    /stashmassy - Päivitä Mässymäärä \n
    /statusall - Kaikkien status \n
    /statusme - Oma status \n
    /teppoavituttaa - NYT ON TEPPO VIHAINEN \n
    /vituttaa - Nyt vähän vituttaa \n
    /VITUTTAA - VITTU KU VITUTTAA`;

const assyTimer = () => {
  const now = new Date().getTime();
  const distance = countDownDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds of ASSEMBLY 2019 left!`;
};

// function events() {
//   const url1 = 'http://m.assembly.org/';

//   request(url1, (error, response, html) => {
//     if (!error) {
//       const $ = cheerio.load(html);

//       let now;
//       let next1;
//       let next2;

//       $('.f').filter(function () {
//         const data = $(this);

//         console.log(data.children);
//         // now = data.children().first().children().first().text();
//       });

//       // return now;
//     }
//   });
// }
//
client.on('message', async (message) => {
  // console.log(message.content);
  if (message.content.startsWith('/adduser')) {
    message.channel.send(
      addUserDiscord(message.author.username, message.channel.id),
    );
  } else {
    const lanaaja = await LanaajaDB.findOne({
      name: message.author.username,
    }).exec();
    // const lanaaja = lanaajat.find(x => x.name === message.author.username);
    if (lanaaja) {
      switch (message.content.split(' ')[0]) {
        case '/statusme':
          message.channel.send(statusMe(lanaaja.name));
          break;

        case '/statusall': {
          const messages = statusAll();
          messages.forEach((msg) => {
            message.channel.send(msg);
          });
          break;
        }

        case '/eatfood':
          message.channel.send(eatFood(lanaaja.name));
          break;

        case '/sleep':
          message.channel.send(lanaajaSleep(lanaaja.name));
          break;

        case '/drinkes':
          message.channel.send(drinkES(lanaaja.name));
          break;

        case '/stashes':
          message.channel.send(
            stashES(lanaaja.name, parseInt(message.content.split(' ')[1], 10)),
          );
          break;

        case '/eatmassy':
          message.channel.send(eatMassy(lanaaja.name));
          break;

        case '/stashmassy':
          message.channel.send(
            stashMassy(
              lanaaja.name,
              parseInt(message.content.split(' ')[1], 10),
            ),
          );
          break;

        case '/vituttaa':
          message.channel.send(vituttaaVahan(lanaaja.name));
          break;

        case '/VITUTTAA':
          message.channel.send(vituttaaHelvetisti(lanaaja.name));
          break;

        case '/teppoavituttaa':
          message.channel.send(teppoaVituttaa(lanaaja.name));
          break;

        case '/eivituta':
          message.channel.send(eiVituta(lanaaja.name));
          break;

        case '/sauna':
          message.channel.send(sauna(lanaaja.name));
          break;

        case '/resetUser':
          message.channel.send(resetStats(lanaaja.name));
          break;

        case '/help':
          message.channel.send(help());
          break;

        case '/assytimer':
          message.channel.send(assyTimer());
          break;

          // case '/events':
          //   message.channel.send(events());
          //   break;

        default:
          message.channel.send('Unkown command');
      }
    } else message.channel.send('User not initialized');
  }
  if (message.content.startsWith('ping')) {
    // console.log(message.author.username);
    message.channel.send('AssyBot ready!');
  }
});

const decayUserStats = async () => {
  await LanaajaDB.updateMany(
    {},
    { $inc: { food: -foodDecay, sleep: -sleepDecay, filth: -filthGain } },
  );
  // if (lanaajat.length > 0) {
  //   lanaajat.forEach((lanaaja) => {
  //     lanaaja.food >= foodDecay
  //       ? (lanaaja.food -= foodDecay)
  //       : (lanaaja.food = 0);
  //     lanaaja.sleep >= sleepDecay
  //       ? (lanaaja.sleep -= sleepDecay)
  //       : (lanaaja.sleep = 0);
  //     lanaaja.filth <= 100.0 - filthGain
  //       ? (lanaaja.filth += filthGain)
  //       : (lanaaja.filth = 100.0);

  //     LanaajaDB.findOneAndUpdate(
  //       { name: lanaaja.name },
  //       {
  //         $set: {
  //           food: lanaaja.food,
  //           sleep: lanaaja.sleep,
  //           filth: lanaaja.filth,
  //         },
  //       },
  //       (err, todo) => {
  //         // Handle any possible database errors
  //         if (err) return res.status(500).send(err);
  //         // return res.send(todo);
  //       },
  //     );

  // checkFoodLevels(lanaaja);
  // checkSleepLevels(lanaaja);
  // checkFilthLevels(lanaaja);
  // LanaajaDB.findOneAndUpdate(
  //   { name: lanaaja.name },
  //   {
  //     $set: {
  //       food: lanaaja.food,
  //       sleep: lanaaja.sleep,
  //       filth: lanaaja.filth,
  //       foodWarningFlagLow: lanaaja.foodWarningFlagLow,
  //       foodWarningFlagMed: lanaaja.foodWarningFlagMed,
  //       foodWarningFlagHigh: lanaaja.foodWarningFlagHigh,
  //       sleepWarningFlagLow: lanaaja.sleepWarningFlagLow,
  //       sleepWarningFlagMed: lanaaja.sleepWarningFlagMed,
  //       sleepWarningFlagHigh: lanaaja.sleepWarningFlagHigh,
  //       filthWarningFlagLow: lanaaja.filthWarningFlagLow,
  //       filthWarningFlagMed: lanaaja.filthWarningFlagMed,
  //       filthWarningFlagHigh: lanaaja.filthWarningFlagHigh,
  //     },
  //   },
  //   (err, todo) => {
  //     // Handle any possible database errors
  //     if (err) return res.status(500).send(err);
  //     // return res.send(todo);
  //   },
  // );
  // });
  // }
};

// Update player stats
setInterval(() => {
  console.log('setInterval: Updating player stats');
  decayUserStats();
}, decayIntervalInMinutes * 60000);

const snapshotDB = async () => {
  const kaikkiLanaajat = await LanaajaDB.find().exec();
  const snapshot = await new Snapshot({ lanaajat: kaikkiLanaajat });
  snapshot.save();
};

// Take snapshot of db
setInterval(() => {
  console.log('setInterval: Taking snapshot of db');
  // decayUserStats();
  snapshotDB();
}, snapshotIntervalInMinutes * 60000);

// function checkLevelsOfAttribute(lanaaja, attr) {
//     let attribute;
//     let flag;
//     if (attr === "food") {
//         attribute = lanaaja.food
//
//     } else if (attr === "sleep") {
//         attribute = lanaaja.sleep
//     } else if (attr === "filth") {
//         attribute = lanaaja.filth
//     } else return;
//
//     if (attribute > warningLevelLow) {
//         resetFoodFlags(lanaaja);
//     } else if (attribute > warningLevelMed && attribute <= warningLevelLow && lanaaja.foodWarningFlagLow) {
//         sendWarningMessage(`${lanaaja.name} food level at ${warningLevelLow}%!`, lanaaja.name);
//         lanaaja.foodWarningFlagLow = true;
//         lanaaja.foodWarningFlagMed = false;
//         lanaaja.foodWarningFlagHigh = false;
//     } else if (lanaaja.food > warningLevelHigh && lanaaja.food <= warningLevelMed && lanaaja.foodWarningFlagMed) {
//         sendWarningMessage(`${lanaaja.name} food level at ${warningLevelMed}%!`, lanaaja.name);
//         lanaaja.foodWarningFlagLow = true;
//         lanaaja.foodWarningFlagMed = true;
//         lanaaja.foodWarningFlagHigh = false;
//     } else if (lanaaja.food >= 0 && lanaaja.food <= warningLevelHigh && lanaaja.foodWarningFlagHigh) {
//         sendWarningMessage(`${lanaaja.name} food level at ${warningLevelHigh}%!`, lanaaja.name);
//         lanaaja.foodWarningFlagLow = true;
//         lanaaja.foodWarningFlagMed = true;
//         lanaaja.foodWarningFlagHigh = true;
//     }
// }
// function resetFoodFlags(lanaaja) {
//   lanaaja.foodWarningFlagHigh = false;
//   lanaaja.foodWarningFlagMed = false;
//   lanaaja.foodWarningFlagLow = false;
// }

// function resetSleepFlags(lanaaja) {
//   lanaaja.sleepWarningFlagHigh = false;
//   lanaaja.sleepWarningFlagMed = false;
//   lanaaja.sleepWarningFlagLow = false;
// }

// function resetFilthFlags(lanaaja) {
//   lanaaja.filthWarningFlagHigh = false;
//   lanaaja.filthWarningFlagMed = false;
//   lanaaja.filthWarningFlagLow = false;
// }

// function sendWarningMessage(message, username) {
//   for (var k in telegramChatIds) {
//     if (telegramChatIds.hasOwnProperty(k)) {
//       if (k === username) {
//         telegram.sendMessage(telegramChatIds[k], message);
//       }
//     }
//   }

//   for (var k in discordChatIds) {
//     if (discordChatIds.hasOwnProperty(k)) {
//       if (k === username) {
//         client.channels.get(discordChatIds[k]).send(message);
//       }
//     }
//   }
// }

// function checkFoodLevels(lanaaja) {
//   if (lanaaja.food > warningLevelLow) {
//     resetFoodFlags(lanaaja);
//   } else if (
//     lanaaja.food > warningLevelMed
//     && lanaaja.food <= warningLevelLow
//     && !lanaaja.foodWarningFlagLow
//   ) {
//     sendWarningMessage(
//       `${lanaaja.name} food level at ${warningLevelLow}%!`,
//       lanaaja.name,
//     );
//     lanaaja.foodWarningFlagLow = true;
//     lanaaja.foodWarningFlagMed = false;
//     lanaaja.foodWarningFlagHigh = false;
//   } else if (
//     lanaaja.food > warningLevelHigh
//     && lanaaja.food <= warningLevelMed
//     && !lanaaja.foodWarningFlagMed
//   ) {
//     sendWarningMessage(
//       `${lanaaja.name} food level at ${warningLevelMed}%!`,
//       lanaaja.name,
//     );
//     lanaaja.foodWarningFlagLow = true;
//     lanaaja.foodWarningFlagMed = true;
//     lanaaja.foodWarningFlagHigh = false;
//   } else if (
//     lanaaja.food >= 0
//     && lanaaja.food <= warningLevelHigh
//     && !lanaaja.foodWarningFlagHigh
//   ) {
//     sendWarningMessage(
//       `${lanaaja.name} food level at ${warningLevelHigh}%!`,
//       lanaaja.name,
//     );
//     lanaaja.foodWarningFlagLow = true;
//     lanaaja.foodWarningFlagMed = true;
//     lanaaja.foodWarningFlagHigh = true;
//   }
// }

// function checkSleepLevels(lanaaja) {
//   if (lanaaja.sleep > warningLevelLow) {
//     resetSleepFlags(lanaaja);
//   } else if (
//     lanaaja.sleep > warningLevelMed
//     && lanaaja.sleep <= warningLevelLow
//     && !lanaaja.sleepWarningFlagLow
//   ) {
//     sendWarningMessage(
//       `${lanaaja.name} sleep level at ${warningLevelLow}%!`,
//       lanaaja.name,
//     );
//     lanaaja.sleepWarningFlagLow = true;
//     lanaaja.sleepWarningFlagMed = false;
//     lanaaja.sleepWarningFlagHigh = false;
//   } else if (
//     lanaaja.sleep > warningLevelHigh
//     && lanaaja.sleep <= warningLevelMed
//     && !lanaaja.sleepWarningFlagMed
//   ) {
//     sendWarningMessage(
//       `${lanaaja.name} sleep level at ${warningLevelMed}%!`,
//       lanaaja.name,
//     );
//     lanaaja.sleepWarningFlagLow = true;
//     lanaaja.sleepWarningFlagMed = true;
//     lanaaja.sleepWarningFlagHigh = false;
//   } else if (
//     lanaaja.sleep >= 0
//     && lanaaja.sleep <= warningLevelHigh
//     && !lanaaja.sleepWarningFlagHigh
//   ) {
//     sendWarningMessage(
//       `${lanaaja.name} sleep level at ${warningLevelHigh}%!`,
//       lanaaja.name,
//     );
//     lanaaja.sleepWarningFlagLow = true;
//     lanaaja.sleepWarningFlagMed = true;
//     lanaaja.sleepWarningFlagHigh = true;
//   }
// }

// function checkFilthLevels(lanaaja) {
//   if (lanaaja.filth < 50.0) {
//     resetFilthFlags(lanaaja);
//   } else if (
//     lanaaja.filth < 80.0
//     && lanaaja.filth >= 50.0
//     && !lanaaja.filthWarningFlagLow
//   ) {
//     sendWarningMessage(`${lanaaja.name} filth level at ${50}%!`, lanaaja.name);
//     lanaaja.filthWarningFlagLow = true;
//     lanaaja.filthWarningFlagMed = false;
//     lanaaja.filthWarningFlagHigh = false;
//   } else if (
//     lanaaja.filth < 95.0
//     && lanaaja.filth >= 80.0
//     && !lanaaja.filthWarningFlagMed
//   ) {
//     sendWarningMessage(`${lanaaja.name} filth level at ${80}%!`, lanaaja.name);
//     lanaaja.filthWarningFlagLow = true;
//     lanaaja.filthWarningFlagMed = true;
//     lanaaja.filthWarningFlagHigh = false;
//   } else if (
//     lanaaja.filth <= 100.0
//     && lanaaja.filth >= 95.0
//     && !lanaaja.filthWarningFlagHigh
//   ) {
//     sendWarningMessage(`${lanaaja.name} filth level at ${95}%!`, lanaaja.name);
//     lanaaja.filthWarningFlagLow = true;
//     lanaaja.filthWarningFlagMed = true;
//     lanaaja.filthWarningFlagHigh = true;
//   }
// }

telegram.onText(/\/assytimer/, async (message) => {
  telegram.sendMessage(message.chat.id, await assyTimer());
});

telegram.onText(/\/statusme/, async (message) => {
  telegram.sendMessage(message.chat.id, await statusMe(message.from.username));
});

telegram.onText(/\/statusall/, async (message) => {
  await statusAll(message);
});

telegram.onText(/\/adduser/, async (message) => {
  telegram.sendMessage(
    message.chat.id,
    await addUserTelegram(message.from.username, message.chat.id),
  );
});

telegram.onText(/\/eatfood/, async (message) => {
  telegram.sendMessage(message.chat.id, await eatFood(message.from.username));
});

telegram.onText(/\/sleep/, async (message) => {
  telegram.sendMessage(
    message.chat.id,
    await lanaajaSleep(message.from.username),
  );
});

telegram.onText(/\/drinkes/, async (message) => {
  telegram.sendMessage(message.chat.id, await drinkES(message.from.username));
});

telegram.onText(/\/stashes (\b\d+\b)/, async (message, match) => {
  telegram.sendMessage(
    message.chat.id,
    await stashES(message.from.username, parseInt(match[1], 10)),
  );
});

telegram.onText(/\/eatmassy/, async (message) => {
  telegram.sendMessage(message.chat.id, await eatMassy(message.from.username));
});

telegram.onText(/\/stashmassy (\b\d+\b)/, async (message, match) => {
  telegram.sendMessage(
    message.chat.id,
    await stashMassy(message.from.username, parseInt(match[1], 10)),
  );
});

telegram.onText(/\/vituttaa/, async (message) => {
  telegram.sendMessage(
    message.chat.id,
    await vituttaaVahan(message.from.username),
  );
});

telegram.onText(/\/VITUTTAA/, async (message) => {
  telegram.sendMessage(
    message.chat.id,
    await vituttaaHelvetisti(message.from.username),
  );
});

telegram.onText(/\/teppoavituttaa/, async (message) => {
  telegram.sendMessage(
    message.chat.id,
    await teppoaVituttaa(message.from.username),
  );
});

telegram.onText(/\/eivituta/, async (message) => {
  telegram.sendMessage(message.chat.id, await eiVituta(message.from.username));
});

telegram.onText(/\/sauna/, async (message) => {
  telegram.sendMessage(message.chat.id, await sauna(message.from.username));
});

telegram.onText(/\/resetuser/, async (message) => {
  telegram.sendMessage(
    message.chat.id,
    await resetStats(message.from.username),
  );
});

telegram.onText(/\/help/, async (message) => {
  telegram.sendMessage(message.chat.id, await help());
});

telegram.onText(/\/ping/, async (message) => {
  telegram.sendMessage(message.chat.id, 'PONG');
});

telegram.on('polling_error', (error) => {
  console.log(`polling error: ${error.code}`); // => 'EFATAL'
});

// Start server

http.createServer(app).listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')}`);
});

app.post(`/bot${token}`, (req, res) => {
  telegram.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('AssyBot 2019');
});
