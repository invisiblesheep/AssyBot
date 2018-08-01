//Dependencies
var http = require('http'),
    emoji = require('node-emoji')
    express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    //MongoClient = require('mongodb').MongoClient,
    //Server = require('mongodb').Server,
    //CollectionDriver = require('./collectionDriver').CollectionDriver,
    //mongoose = require('mongoose'),
    assert = require('assert'),
    TelegramBot = require('node-telegram-bot-api'),
    Lanaaja = require('./Lanaaja').Lanaaja,
    fs = require('fs'),
    request = require('request'),
    cheerio = require('cheerio');

//Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3002);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.use(express.static('public'))

/*//MongoDB
var mongoHost = 'mongodb://localhost:27017/AssyBot';
var collectionDriver;
*/
//Telegram

const token = process.env.TELEGRAMTOKEN
console.log(token)
//bot which uses polling and getUpdates-method
// var telegram = new TelegramBot(token, { polling: true });

// Uncomment for webhook
const url = 'https://assybot.jokioja.fi'
var telegram = new TelegramBot(token);
telegram.setWebHook(`${url}/bot${token}`);

const Discord = require("discord.js");
const client = new Discord.Client();
const discordToken = process.env.DISCORDTOKEN
console.log(discordToken)
client.login(discordToken);

client.on("ready", () => {
    // addUser"testi1");
    // addUser("testi2");
    console.log("I am ready!");
});

client.on("message", (message) => {

    // console.log(message.content);
    if (message.content.startsWith("/adduser")) {
        message.channel.send(addUserDiscord(message.author.username, message.channel.id));
    } else {

        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === message.author.username) {


                if (message.content.startsWith("/statusme")) {
                    message.channel.send(statusMe(lanaaja.name));
                }

                if (message.content.startsWith("/statusall")) {
                    lanaajat.forEach(function(lanaaja) {
                        message.channel.send(statusMe(lanaaja.name));
                    });
                }

                if (message.content.startsWith("/eatfood")) {
                    message.channel.send(eatFood(lanaaja.name));
                }

                if (message.content.startsWith("/sleep")) {
                    message.channel.send(lanaajaSleep(lanaaja.name));
                }

                if (message.content.startsWith("/drinkes")) {
                    message.channel.send(drinkES(lanaaja.name));
                }

                if (message.content.startsWith("/stashes")) {
                    let tokens = message.content.split(' ');
                    let amount = parseInt(tokens[1]);
                    // console.log(amount);
                    message.channel.send(stashES(lanaaja.name, amount));
                }

                if (message.content.startsWith("/eatmassy")) {
                    message.channel.send(eatMassy(lanaaja.name));
                }

                if (message.content.startsWith("/stashmassy")) {
                    let tokens = message.content.split(' ');
                    let amount = parseInt(tokens[1]);
                    // console.log(amount);
                    message.channel.send(stashMassy(lanaaja.name, amount));
                }

                if (message.content.startsWith("/vituttaa")) {
                    message.channel.send(vituttaaVahan(lanaaja.name));
                }

                if (message.content.startsWith("/VITUTTAA")) {
                    message.channel.send(vituttaaHelvetisti(lanaaja.name));
                }

                if (message.content.startsWith("/teppoavituttaa")) {
                    message.channel.send(teppoaVituttaa(lanaaja.name));
                }

                if (message.content.startsWith("/eivituta")) {
                    message.channel.send(eiVituta(lanaaja.name));
                }

                if (message.content.startsWith("/sauna")) {
                    message.channel.send(sauna(lanaaja.name));
                }

                if (message.content.startsWith("/resetUser")) {
                    message.channel.send(resetStats(lanaaja.name));
                }

                if (message.content.startsWith("/help")) {
                    message.channel.send(help());
                }

                if (message.content.startsWith("/assytimer")) {
                    message.channel.send(assyTimer());
                }

                if (message.content.startsWith("/events")) {
                    message.channel.send(events());
                }

            }

            // if (!exists) {
            //     message.channel.send("The current user is not initialized")
            // }
        });
    }
    if (message.content.startsWith("ping")) {
        // console.log(message.author.username);
        message.channel.send("AssyBot ready!");
    }
});

const foodDecayHours = process.env.FOODDECAY || 6.0;
const sleepDecayHours = process.env.SLEEPDECAY || 18.0;
const filthGainHours = process.env.FILTHGAIN || 24.0;
const esGainToSleep = process.env.ESGAIN || 30.0;
const esDiminishingReturns = process.env.ESDIMINISH || 0.3;
const decayIntervalInMinutes = process.env.DECAYINTERVAL || 15.0;
const decayCountPerHour = 60.0 / decayIntervalInMinutes;

const warningLevelLow = process.env.WARNINGLEVELLOW || 25.0;
const warningLevelMed = process.env.WARNINGLEVELMED || 10.0;
const warningLevelHigh = process.env.WARNINGLEVELHIGH || 5.0;

const foodDecay = (100.0 / foodDecayHours) / decayCountPerHour;
const sleepDecay = (100 / sleepDecayHours) / decayCountPerHour;
const filthGain = (100 / filthGainHours) / decayCountPerHour;

// Update player stats
setInterval(function(){
  console.log("setInterval: Updating player stats");
    decayUserStats();
}, decayIntervalInMinutes * 60000);

function decayUserStats(){
    if (lanaajat.length > 0) {
        lanaajat.forEach(function(lanaaja) {
            lanaaja.food >= foodDecay ? lanaaja.food -= foodDecay : lanaaja.food = 0;
            lanaaja.sleep >= sleepDecay ? lanaaja.sleep -= sleepDecay : lanaaja.sleep = 0;
            lanaaja.filth <= 100.0 - filthGain ? lanaaja.filth += filthGain : lanaaja.filth = 100.0;

            checkFoodLevels(lanaaja);
            checkSleepLevels(lanaaja);
            checkFilthLevels(lanaaja);
        });
    }
}

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

function checkFoodLevels(lanaaja) {
    if (lanaaja.food > warningLevelLow) {
        resetFoodFlags(lanaaja);
    } else if (lanaaja.food > warningLevelMed && lanaaja.food <= warningLevelLow && !lanaaja.foodWarningFlagLow) {
        sendWarningMessage(`${lanaaja.name} food level at ${warningLevelLow}%!`, lanaaja.name);
        lanaaja.foodWarningFlagLow = true;
        lanaaja.foodWarningFlagMed = false;
        lanaaja.foodWarningFlagHigh = false;
    } else if (lanaaja.food > warningLevelHigh && lanaaja.food <= warningLevelMed && !lanaaja.foodWarningFlagMed) {
        sendWarningMessage(`${lanaaja.name} food level at ${warningLevelMed}%!`, lanaaja.name);
        lanaaja.foodWarningFlagLow = true;
        lanaaja.foodWarningFlagMed = true;
        lanaaja.foodWarningFlagHigh = false;
    } else if (lanaaja.food >= 0 && lanaaja.food <= warningLevelHigh && !lanaaja.foodWarningFlagHigh) {
        sendWarningMessage(`${lanaaja.name} food level at ${warningLevelHigh}%!`, lanaaja.name);
        lanaaja.foodWarningFlagLow = true;
        lanaaja.foodWarningFlagMed = true;
        lanaaja.foodWarningFlagHigh = true;
    }
}

function checkSleepLevels(lanaaja) {
    if (lanaaja.sleep > warningLevelLow) {
        resetSleepFlags(lanaaja);
    } else if (lanaaja.sleep > warningLevelMed && lanaaja.sleep <= warningLevelLow && !lanaaja.sleepWarningFlagLow) {
        sendWarningMessage(`${lanaaja.name} sleep level at ${warningLevelLow}%!`, lanaaja.name);
        lanaaja.sleepWarningFlagLow = true;
        lanaaja.sleepWarningFlagMed = false;
        lanaaja.sleepWarningFlagHigh = false;
    } else if (lanaaja.sleep > warningLevelHigh && lanaaja.sleep <= warningLevelMed && !lanaaja.sleepWarningFlagMed) {
        sendWarningMessage(`${lanaaja.name} sleep level at ${warningLevelMed}%!`, lanaaja.name);
        lanaaja.sleepWarningFlagLow = true;
        lanaaja.sleepWarningFlagMed = true;
        lanaaja.sleepWarningFlagHigh = false;
    } else if (lanaaja.sleep >= 0 && lanaaja.sleep <= warningLevelHigh && !lanaaja.sleepWarningFlagHigh) {
        sendWarningMessage(`${lanaaja.name} sleep level at ${warningLevelHigh}%!`, lanaaja.name);
        lanaaja.sleepWarningFlagLow = true;
        lanaaja.sleepWarningFlagMed = true;
        lanaaja.sleepWarningFlagHigh = true;
    }
}

function checkFilthLevels(lanaaja) {
    if (lanaaja.filth < 50.0) {
        resetFilthFlags(lanaaja);
    } else if (lanaaja.filth < 80.0 && lanaaja.filth >= 50.0 && !lanaaja.filthWarningFlagLow) {
        sendWarningMessage(`${lanaaja.name} filth level at ${50}%!`, lanaaja.name);
        lanaaja.filthWarningFlagLow = true;
        lanaaja.filthWarningFlagMed = false;
        lanaaja.filthWarningFlagHigh = false;
    } else if (lanaaja.filth < 95.0 && lanaaja.filth >= 80.0 && !lanaaja.filthWarningFlagMed) {
        sendWarningMessage(`${lanaaja.name} filth level at ${80}%!`, lanaaja.name);
        lanaaja.filthWarningFlagLow = true;
        lanaaja.filthWarningFlagMed = true;
        lanaaja.filthWarningFlagHigh = false;
    } else if (lanaaja.filth <= 100.0 && lanaaja.filth >= 95.0 && !lanaaja.filthWarningFlagHigh) {
        sendWarningMessage(`${lanaaja.name} filth level at ${95}%!`, lanaaja.name);
        lanaaja.filthWarningFlagLow = true;
        lanaaja.filthWarningFlagMed = true;
        lanaaja.filthWarningFlagHigh = true;
    }
}

function resetFoodFlags(lanaaja) {
    lanaaja.foodWarningFlagHigh = false;
    lanaaja.foodWarningFlagMed = false;
    lanaaja.foodWarningFlagLow = false;
}

function resetSleepFlags(lanaaja) {
    lanaaja.sleepWarningFlagHigh = false;
    lanaaja.sleepWarningFlagMed = false;
    lanaaja.sleepWarningFlagLow = false;
}

function resetFilthFlags(lanaaja) {
    lanaaja.filthWarningFlagHigh = false;
    lanaaja.filthWarningFlagMed = false;
    lanaaja.filthWarningFlagLow = false;
}


function sendWarningMessage(message, username) {

    for (var k in telegramChatIds) {
        if (telegramChatIds.hasOwnProperty(k)) {
            if (k === username) {
                telegram.sendMessage(telegramChatIds[k], message);
            }
        }
    }

    for (var k in discordChatIds) {
        if (discordChatIds.hasOwnProperty(k)) {
            if (k === username) {
                client.channels.get(discordChatIds[k]).send(message);
            }
        }
    }
}

function renderColumns(food, sleep, es, frustration, lanpower, massy, filth){
    let foodColumn = renderFoodColumn(food >= 100 ? 100 : food);
    let sleepColumn = renderSleepColumn(sleep >= 100 ? 100 : sleep);
    let esColumn = renderEsColumn(es > 10 ? 10 : es);
    let frustrationColumn = renderVitutusColumn(frustration >= 100 ? 100 : frustration);
    let lanpowerColumn = renderColumn(lanpower >= 100 ? 100 : lanpower);
    let massyColumn = renderMassyColumn(massy > 10 ? 10 : massy);
    let filthColumn = renderFilthColumn(filth >= 100 ? 100 : filth);
    // var columns = "\nFood:  " + foodColumn + "\nSleep: "+sleepColumn+"\nES:    "+esColumn+"\nFuck:  "+frustrationColumn+"\nLP:    "+lanpowerColumn;
    var columns = `\nFood:  ${foodColumn} ${food}%\nSleep ${sleepColumn} ${sleep}%\nFilth:    ${filthColumn} ${filth}%\nES:    ${esColumn} ${es}\nMässy:   ${massyColumn} ${massy}\nFuck:  ${frustrationColumn} ${frustration}%\nLP:   ${lanpowerColumn} ${lanpower}%`
     return emoji.emojify(columns);
}

function renderFoodColumn(value){
    var num = Math.floor(value/10);
    //console.log(num);
    var column = "";
    for(count = 0; count < num; count++){
        column= column.concat(":hamburger:");
        //console.log(column);
    }
    //console.log(column);
    for(count = 0; count < 10-num; count++){
        column= column.concat(":x:");
        //console.log(column);
    }
    return column;
}

function renderSleepColumn(value){
    var num = Math.floor(value/10);
    //console.log(num);
    var column = "";
    for(count = 0; count < num; count++){
        column= column.concat(":zzz:");
        //console.log(column);
    }
    //console.log(column);
    for(count = 0; count < 10-num; count++){
        column= column.concat(":x:");
        //console.log(column);
    }
    return column;
}

function renderFilthColumn(value){
    var num = Math.floor(value/10);
    //console.log(num);
    var column = "";
    for(count = 0; count < num; count++){
        column= column.concat(":hankey:");
        //console.log(column);
    }
    //console.log(column);
    for(count = 0; count < 10-num; count++){
        column= column.concat(":slightly_smiling_face:");
        //console.log(column);
    }
    return column;
}

function renderVitutusColumn(value){
    var num = Math.floor(value/10);
    //console.log(num);
    var column = "";
    for(count = 0; count < num; count++){
        column= column.concat(":rage:");
        //console.log(column);
    }
    //console.log(column);
    for(count = 0; count < 10-num; count++){
        column= column.concat(":slightly_smiling_face:");
        //console.log(column);
    }
    return column;
}

function renderEsColumn(value){
    if (value <= 10){
        var num = value;
    }
    else{
        var num = 10;
    }
    //console.log(num);
    var column = "";
    for(count = 0; count < num; count++){
        column= column.concat(":battery:");
        //console.log(column);
    }
    //console.log(column);
    //for(count = 0; count < 10-num; count++){
    //    column= column.concat(":x:");
        //console.log(column);
    //}
    return column;
}

function renderMassyColumn(value){
    if (value <= 10){
        var num = value;
    }
    else{
        var num = 10;
    }
    //console.log(num);
    var column = "";
    for(count = 0; count < num; count++){
        column= column.concat(":popcorn:");
        //console.log(column);
    }
    return column;
}

function renderColumn(value){
    var num = Math.floor(value/10);
    //console.log(num);
    var column = "";
    for(count = 0; count < num; count++){
        column= column.concat("=");
        //console.log(column);
    }
    column = column.concat("|");
    //console.log(column);
    for(count = 0; count < 10-num; count++){
        column= column.concat("=");
        //console.log(column);
    }
    return "["+column+"]";
}


// Bot stuff
var lanaajat = [];
var telegramChatIds = new Map();
var discordChatIds = new Map();
const countDownDate = new Date("2017-08-06T14:00:00+00:00").getTime();

function events(){
    let url1 = "http://m.assembly.org/"

    request(url1, function (error, response, html) {

        if (!error) {
            var $ = cheerio.load(html);

            var now, next1, next2;

            $('.f').filter(function(){

                let data = $(this);

                console.log(data.children);
                // now = data.children().first().children().first().text();
            });

            // return now;
        }
    });

   return
}

telegram.onText(/\/assytimer/, (message) => {
    telegram.sendMessage(message.chat.id, assyTimer());
});

function assyTimer() {
    let now = new Date().getTime();
    let distance = countDownDate - now;

    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds of ASSEMBLY 2017 left!`
}

telegram.onText(/\/statusme/, (message) => {
    telegram.sendMessage(message.chat.id, statusMe(message.from.username));
});

function statusMe(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result =  "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                let lanpoweri;
                if (lanaaja.sleep > 0 && lanaaja.food > 0) {
                    lanaaja.vitutus1 = (((100.0 - lanaaja.sleep) + (100.0 - lanaaja.food) + lanaaja.filth) / 3) + (0.5 * lanaaja.vitutus2);
                    lanpoweri = ((0.8 * lanaaja.sleep) + (1.2 * lanaaja.food) + (100.0 - lanaaja.vitutus1)) / 3;
                } else {
                    lanaaja.vitutus1 = 100.0;
                    lanpoweri = 0.0;
                }
                let stats = renderColumns(lanaaja.food.toFixed(0), lanaaja.sleep.toFixed(0), lanaaja.es, lanaaja.vitutus1.toFixed(0), lanpoweri.toFixed(0), lanaaja.massy, lanaaja.filth.toFixed(0));
                result = `User ${lanaaja.name}${stats}`;
            }
        });
    }

    return result
}

telegram.onText(/\/statusall/, (message) => {
        lanaajat.forEach(function(lanaaja) {
            telegram.sendMessage(message.chat.id, statusMe(lanaaja.name));
        });
});

telegram.onText(/\/adduser/, (message) => {
    telegram.sendMessage(message.chat.id, addUserTelegram(message.from.username, message.chat.id));
});

function addUserTelegram(username, chatId) {
    let exists = false;
    // telegram.sendMessage(message.chat.id, "addUser");
    for (var k in telegramChatIds) {
        if (telegramChatIds.hasOwnProperty(k)) {
            if (k === username) {
                exists = true;
            }
        }
    }

    if (!exists) {
        telegramChatIds[username] = chatId;
        let lanaajaExists = false;
        lanaajat.forEach(function (lanaaja) {
            lanaaja.name === username ? lanaajaExists = true : null;
        });

        if (!lanaajaExists) {
            let newPlayer = new Lanaaja(username, esGainToSleep);
            lanaajat.push(newPlayer);
        }
        // console.log(newPlayer.food);

        if (lanaajaExists) {
            return `Telegram integration enabled for user ${username}`;
        }
        return `User ${username} created, telegram integration enabled`;

    } else return `User ${username} already exists!`;
}

function addUserDiscord(username, chatId) {
    let exists = false;
    for (var k in discordChatIds) {
        if (discordChatIds.hasOwnProperty(k)) {
            if (k === username) {
                exists = true;
            }
        }
    }

    if (!exists) {
        discordChatIds[username] = chatId;
        let lanaajaExists = false;
        lanaajat.forEach(function (lanaaja) {
            lanaaja.name === username ? lanaajaExists = true : null;
        });

        if (!lanaajaExists) {
            let newPlayer = new Lanaaja(username, esGainToSleep);
            lanaajat.push(newPlayer);
        }
        // console.log(newPlayer.food);

        if (lanaajaExists) {
            return `Discord integration enabled for user ${username}`;
        }
        return `User ${username} created, discord integration enabled`;
    } else return `User ${username} already exists!`;
}

telegram.onText(/\/eatfood/, (message) => {
    telegram.sendMessage(message.chat.id, eatFood(message.from.username));
});

function eatFood(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                lanaaja.food = 100;
                result = `User ${lanaaja.name} just ate!`;
            }
        });
    }

    return result;
}

telegram.onText(/\/sleep/, (message) => {
    telegram.sendMessage(message.chat.id, lanaajaSleep(message.from.username));
});

function lanaajaSleep(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                lanaaja.sleep = 100;
                result = `User ${lanaaja.name} just woke up!`;
            }
        });
    }

    return result;
}

telegram.onText(/\/drinkes/, (message) => {
    telegram.sendMessage(message.chat.id, drinkES(message.from.username));
});

function drinkES(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                if (lanaaja.es === 0) {
                    result = `User ${lanaaja.name} has no more ES!!!`;
                } else {
                    if (lanaaja.sleep + lanaaja.esh > 100.0) {
                        lanaaja.sleep = 100.0;
                    } else {
                        lanaaja.sleep += lanaaja.esh;
                    }
                    lanaaja.esh = lanaaja.esh - (esDiminishingReturns * lanaaja.esh);
                    lanaaja.es -= 1;
                    result = `PÄRINÄ PÄÄLLE`;
                }
            }
        });
    }

    return result;
}

telegram.onText(/\/stashes (\b\d+\b)/, (message, match) => {
    telegram.sendMessage(message.chat.id, stashES(message.from.username, parseInt(match[1])));
})
function stashES(username, amount) {
    var result = "";

    if (isNaN(amount)) {
        return "Not a number.."
    }

    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                lanaaja.es += amount;
                result = `${amount} EEÄSSÄÄ GOT`;
            }
        });
    }

    return result;
}

telegram.onText(/\/eatmassy/, (message) => {
    telegram.sendMessage(message.chat.id, eatMassy(message.from.username));
});

function eatMassy(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                if (lanaaja.massy === 0) {
                    result = `User ${lanaaja.name} has no more MÄSSY!!!`;
                } else {
                    if (lanaaja.food < 100.0) {
                        lanaaja.food += lanaaja.massyh;
                    }
                    lanaaja.massyh = lanaaja.massyh - (0.3 * lanaaja.massyh);
                    lanaaja.massy -= 1;
                    result = `HELEVETIN HYVIÄ MAKKAROITA`;
                }
            }
        });
    }

    return result;
}

telegram.onText(/\/stashmassy (\b\d+\b)/, (message, match) => {
    telegram.sendMessage(message.chat.id, stashMassy(message.from.username, parseInt(match[1])));
});

function stashMassy(username, amount) {
    var result = "";

    if (isNaN(amount)) {
        return "Not a number.."
    }

    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                lanaaja.massy += amount;
                result = `${amount} MÄSSYY GOT`;
            }
        });
    }

    return result;
}

telegram.onText(/\/vituttaa/, (message, match) => {
    telegram.sendMessage(message.chat.id, vituttaaVahan(message.from.username));
});

function vituttaaVahan(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                lanaaja.vitutus2 += 10.0;
                result = `paska peli`;
            }
        });
    }

    return result;
}

telegram.onText(/\/VITUTTAA/, (message) => {
        telegram.sendMessage(message.chat.id, vituttaaHelvetisti(message.from.username));
});

function vituttaaHelvetisti(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                lanaaja.vitutus2 += 20.0;
                result = `VITUN JONNET`;
            }
        });
    }

    return result;
}

telegram.onText(/\/teppoavituttaa/, (message) => {
    telegram.sendMessage(message.chat.id, teppoaVituttaa(message.from.username));
});

function teppoaVituttaa(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                lanaaja.vitutus2 += 30.0;
                result = `Nooh, tuon olisi voinut pelata paremmin ja käytin ultin liian aikasin..`;
            }
        });
    }

    return result;
}

telegram.onText(/\/eivituta/, (message) => {
    telegram.sendMessage(message.chat.id, eiVituta(message.from.username));
});

function eiVituta(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                lanaaja.vitutus2 = 0.0;
                result = `:)`;
            }
        });
    }

    return result;
}

telegram.onText(/\/sauna/, (message) => {
    telegram.sendMessage(message.chat.id, sauna(message.from.username));
});

function sauna(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                lanaaja.filth = 0.0;
                result = `Sauna #1`;
            }
        });
    }

    return result;
}

telegram.onText(/\/resetuser/, (message, match) => {
    telegram.sendMessage(message.chat.id, resetStats(message.from.username));
});

function resetStats(username) {
    var result = "";
    if (lanaajat.length === 0) {
        result = "The current user is not initialized";
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === username) {
                lanaaja.sleep = 100.0;
                lanaaja.es  = 0;
                lanaaja.esh = 30.0;
                lanaaja.food = 100.0;
                lanaaja.massy = 0;
                lanaaja.massyh = 10.0;
                lanaaja.vitutus1 = 0.0;
                lanaaja.vitutus2 = 0.0;
                lanaaja.filth = 0.0;
                result = `${lanaaja.name}'s stats have been reset!`;
            }
        });
    }

    return result;
}

telegram.onText(/\/help/, (message) => {
    telegram.sendMessage(message.chat.id, help());
});

function help() {
    return `Komennot: \n
    /adduser - Lisää käyttäjä \n
    /assytimer - Assembly 2017 countdown \n
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
    /VITUTTAA - VITTU KU VITUTTAA`
}

telegram.on('polling_error', (error) => {
    console.log("polling error: " + error.code);  // => 'EFATAL'
});


// Start server

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


 app.post(`/bot${token}`, (req, res) => {
   telegram.processUpdate(req.body);
   res.sendStatus(200);
 });

