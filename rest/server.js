//Dependencies
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    //MongoClient = require('mongodb').MongoClient,
    //Server = require('mongodb').Server,
    //CollectionDriver = require('./collectionDriver').CollectionDriver,
    //mongoose = require('mongoose'),
    assert = require('assert'),
    TelegramBot = require('node-telegram-bot-api'),
    Lanaaja = require('./Lanaaja').Lanaaja;

//Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/*//MongoDB
var mongoHost = 'mongodb://localhost:27017/AssyBot';
var collectionDriver;
*/
//Telegram

const token = "433183839:AAGG7rJinMHDU4ViYi5cxqKRMX4a8bRNspY";
const url = 'https://arvala.eu';
//bot which uses polling and getUpdates-method
var telegram = new TelegramBot(token, { polling: true });

// var telegram = new TelegramBot(token);

// telegram.setWebHook(`${url}/bot${token}`);
/*
MongoClient.connect(mongoHost, function(err, db){
  assert.equal(null, err);
  console.log('Connected to mongodb server');
  collectionDriver = new CollectionDriver(db);
});
*/


const Discord = require("discord.js");
const client = new Discord.Client();

client.login("MzQxMjcwNzMxMzM1Nzk0Njk5.DF-p_Q.5Q5lzfvI0qxbPLHfw9wwfML4UXc");

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

                if (message.content.startsWith("/eivituta")) {
                    message.channel.send(eiVituta(lanaaja.name));
                }

                if (message.content.startsWith("/sauna")) {
                    message.channel.send(sauna(lanaaja.name));
                }

                if (message.content.startsWith("/resetUser")) {
                    message.channel.send(resetStats(lanaaja.name));
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


// Update player stats
setInterval(function(){
  console.log("setInterval: Updating player stats");
    decayUserStats();
}, 15 * 60000);

function decayUserStats(){
    if (lanaajat.length > 0) {
        lanaajat.forEach(function(lanaaja) {
            lanaaja.fuudi >= 4.2 ? lanaaja.fuudi -= 4.2 : lanaaja.fuudi = 0;
            lanaaja.uni >= 1.4 ? lanaaja.uni -= 1.4 : lanaaja.uni = 0;
            lanaaja.saastaisuus >= 1.05 ? lanaaja.saastaisuus += 1.05 : lanaaja.saastaisuus = 0;
            // sendWarningMessage(`${lanaaja.name} is starving!`, lanaaja.name);
            lanaaja.fuudi === 0 ? sendWarningMessage(`${lanaaja.name} is starving!`, lanaaja.name) : null;
            lanaaja.uni === 0 ? sendWarningMessage(`${lanaaja.name} is dead tired!`, lanaaja.name) : null;
            lanaaja.saastaisuus === 100 ? sendWarningMessage(`${lanaaja.name} is filthy as fuck!`, lanaaja.name) : null;
        });
    }
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

function renderColumns(food, sleep, es, frustration, lanpower, massy){
    let foodColumn = renderColumn(food);
    let sleepColumn = renderColumn(sleep);
    let esColumn = renderColumn(es > 100 ? 100 : es);
    let frustrationColumn = renderColumn(frustration);
    let lanpowerColumn = renderColumn(lanpower);
    let massyColumn = renderColumn(massy > 100 ? 100 : massy);
    // var columns = "\nFood:  " + foodColumn + "\nSleep: "+sleepColumn+"\nES:    "+esColumn+"\nFuck:  "+frustrationColumn+"\nLP:    "+lanpowerColumn;
    return `\nFood:  ${foodColumn} ${food}%\nSleep ${sleepColumn} ${sleep}%\nES:    ${esColumn} ${es}\nMässy:   ${massyColumn} ${massy}\nFuck:  ${frustrationColumn} ${frustration}%\nLP:   ${lanpowerColumn} ${lanpower}%`
    // return columns;
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
// var testiPelaaja = new Lanaaja("Testilanaaja");
// var lanaajatLocked = false;
var lanaajat = [];
var telegramChatIds = new Map();
var discordChatIds = new Map();

// function getLanaajat() {
//     while (true){
//         if(!lanaajatLocked) {
//             lanaajatLocked = true;
//             return lanaajat;
//         }
//
//         // setTimeout(function(){
//         //     a=10;
//         // },1000);
//     }
// }
//
// function unlockLanaajat(){
//     lanaajatLocked = false;
// }

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
                if (lanaaja.uni > 0 && lanaaja.fuudi > 0) {
                    lanaaja.vitutus1 = (((100.0 - lanaaja.uni) + (100.0 - lanaaja.fuudi) + lanaaja.saastaisuus) / 3) + (0.5 * lanaaja.vitutus2);
                    lanpoweri = ((0.8 * lanaaja.uni) + (1.2 * lanaaja.fuudi) + (100.0 - lanaaja.vitutus1)) / 3;
                } else {
                    lanaaja.vitutus1 = 100.0;
                    lanpoweri = 0.0;
                }
                let stats = renderColumns(lanaaja.fuudi.toFixed(0), lanaaja.uni.toFixed(0), lanaaja.es, lanaaja.vitutus1.toFixed(0), lanpoweri.toFixed(0), lanaaja.massy);
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
    // telegramChatIds.forEach(function(value, key, mapObj) {
    //     console.log("forEach telegramChatIds");
    //     console.log(value, key);
    //     if (key === username) {
    //         exists = true;
    //     }
    // });

    if (!exists) {

        telegramChatIds[username] = chatId;
        let newPlayer = new Lanaaja(username);
        lanaajat.push(newPlayer);
        // console.log(newPlayer.fuudi);
        return `User ${username} created`;

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
        let newPlayer = new Lanaaja(username);
        lanaajat.push(newPlayer);
        return `User ${username} created`;

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
                lanaaja.fuudi = 100;
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
                lanaaja.uni = 100;
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
                    lanaaja.uni += lanaaja.esh;
                    lanaaja.esh = lanaaja.esh - (0.3 * lanaaja.esh);
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
                    if (lanaaja.fuudi < 100.0) {
                        lanaaja.fuudi += lanaaja.massyh;
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

telegram.onText(/\/VITUTTAA/, (message, match) => {
        telegram.sendMessage(message.chat.id, vituttaaHelvetisti(messag.from.username));
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
                lanaaja.saastaisuus = 0.0;
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
                lanaaja.uni = 100.0;
                lanaaja.es  = 0;
                lanaaja.esh = 30.0;
                lanaaja.fuudi = 100.0;
                lanaaja.massy = 0;
                lanaaja.massyh = 10.0;
                lanaaja.vitutus1 = 0.0;
                lanaaja.vitutus2 = 0.0;
                lanaaja.saastaisuus = 0.0;
                result = `${lanaaja.name}'s stats have been reset!`;
            }
        });
    }

    return result;


}

telegram.on('polling_error', (error) => {
    console.log("polling error: " + error.code);  // => 'EFATAL'
});


// Start server

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});


// app.post(`/bot${token}`, (req, res) => {
//   telegram.processUpdate(req.body);
//   res.sendStatus(200);
// });

// var port = 3002;
// app.listen(port, () => {
//   console.log(`Express server is listening on ${port}`);
// });



