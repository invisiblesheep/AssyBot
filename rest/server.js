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
// Update player stats
setInterval(function(){
  console.log("setInterval: Updating player stats");
    if (lanaajat.length === 0) {
        lanaajat.forEach(function(lanaaja) {
            lanaaja.fuudi > 0 ? lanaaja.fuudi -= 4.2 : null;
            lanaaja.uni > 0 ? lanaaja.uni -= 1.4 : null;
            lanaaja.saastaisuus > 0 ? lanaaja.saastaisuus += 1.05 : null;
        });
    }
}, 15 * 60000);

function renderColumns(food, sleep, es, frustration, lanpower){
    let foodColumn = renderColumn(food);
    let sleepColumn = renderColumn(sleep);
    let esColumn = renderColumn(es);
    let frustrationColumn = renderColumn(frustration);
    let lanpowerColumn = renderColumn(lanpower);
    // var columns = "\nFood:  " + foodColumn + "\nSleep: "+sleepColumn+"\nES:    "+esColumn+"\nFuck:  "+frustrationColumn+"\nLP:    "+lanpowerColumn;
    return `\nFood:  ${foodColumn} ${food}%\nSleep ${sleepColumn} ${sleep}%\nES:    ${esColumn} ${es}\nFuck:  ${frustrationColumn} ${frustration}%\nLP:   ${lanpowerColumn} ${lanpower}%`
    // return columns;
}

function renderColumn(value){
    var num = Math.floor(value/6.7);
    //console.log(num);
    var column = "";
    for(count = 0; count < num; count++){
        column= column.concat("=");
        //console.log(column);
    }
    column = column.concat("|");
    //console.log(column);
    for(count = 0; count < 14-num; count++){
        column= column.concat("=");
        //console.log(column);
    }
    return "["+column+"]";
}


// Bot stuff
// var testiPelaaja = new Lanaaja("Testilanaaja");
var lanaajat = [];


telegram.onText(/\/testing/, (message) => {
	telegram.sendMessage(message.chat.id, "webhook comms testing");
});






telegram.onText(/\/statusMe/, (message) => {
    const name = message.from.username;
    var lanpoweri;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === name) {
                if (lanaaja.uni > 0 && lanaaja.fuudi > 0) {
                    lanaaja.vitutus1 = (((100.0 - lanaaja.uni) + (100.0 - lanaaja.fuudi) + lanaaja.saastaisuus) / 3) + (0.5 * lanaaja.vitutus2);
                    lanpoweri = ((0.8 * lanaaja.uni) + (1.2 * lanaaja.fuudi) + (100.0 - lanaaja.vitutus1)) / 3;
                } else {
                    lanaaja.vitutus1 = 100.0;
                    lanpoweri = 0.0;
                }
                var stats = renderColumns(lanaaja.fuudi.toFixed(2), lanaaja.uni.toFixed(2), lanaaja.es.toFixed(2), lanaaja.vitutus1.toFixed(2), lanpoweri.toFixed(2));
                telegram.sendMessage(message.chat.id, `User ${lanaaja.name}${stats}`);
            }
        });
    }
});

telegram.onText(/\/statusAll/, (message) => {
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "No lanaaja in the game :(");
    } else {
        lanaajat.forEach(function(lanaaja) {
            telegram.sendMessage(message.chat.id, `User ${lanaaja.name} \nFood: ${lanaaja.fuudi}`);
        });
    }
});

telegram.onText(/\/addUser/, (message) => {
    console.log(message);
    var exists = false;
    // telegram.sendMessage(message.chat.id, "addUser");
    lanaajat.forEach(function(lanaaja) {
        if (lanaaja.name === message.from.username) {
            exists = true;
        }
    });

    if (!exists) {

        const name = message.from.username;
        var newPlayer = new Lanaaja(name);
        lanaajat.push(newPlayer);
        // console.log(newPlayer.fuudi);
        telegram.sendMessage(message.chat.id, `New user created`);

    } else telegram.sendMessage(message.chat.id, `User ${message.from.username} already exists!`);
});

// telegram.onText(/\/getUsers/, (message) => {
//     console.log(lanaajat[0]);
//     telegram.sendMessage(message.chat.id, `first user in list: ${lanaajat[0].name} \ntotal users: ${lanaajat.length}`);
//     // telegram.sendMessage(message.chat.id, `Hello again,  ${name}`);
// });

telegram.onText(/\/eatFood/, (message) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function(lanaaja) {
            if (lanaaja.name === name) {
                lanaaja.fuudi = 100;
                telegram.sendMessage(message.chat.id, `User ${lanaaja.name} just ate!`);
            }
        });
    }
});

telegram.onText(/\/sleep/, (message) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function(lanaaja) {
            console.log(lanaaja);
            if (lanaaja.name === name) {
                lanaaja.uni = 100;
                telegram.sendMessage(message.chat.id, `User ${lanaaja.name} just woke up!`);
            }
        });
    }
});

telegram.onText(/\/drinkES/, (message) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function(lanaaja) {
            console.log(lanaaja);
            if (lanaaja.name === name) {
                if (lanaaja.es === 0) {
                    telegram.sendMessage(message.chat.id, `User ${lanaaja.name} has no more ES!!!`);
                } else {
                    lanaaja.uni += lanaaja.esh;
                    lanaaja.esh = lanaaja.esh - (0.3 * lanaaja.esh);
                    lanaaja.es -= 1;
                    telegram.sendMessage(message.chat.id, `PÄRINÄ PÄÄLLE`);
                }
            }
        });
    }
});

telegram.onText(/\/stashES (\b\d+\b)/, (message, match) => {

    console.log("STASHES");
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function (lanaaja) {
            console.log(lanaaja);
            if (lanaaja.name === name) {
                lanaaja.es += parseInt(match[1]);
                telegram.sendMessage(message.chat.id, `${match[1]} EEÄSSÄÄ GOT`);
            }
        });
    }
});

telegram.onText(/\/eatMässy/, (message) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function(lanaaja) {
            console.log(lanaaja);
            if (lanaaja.name === name) {
                if (lanaaja.massy === 0) {
                    telegram.sendMessage(message.chat.id, `User ${lanaaja.name} has no more MÄSSY!!!`);
                } else {
                    if (lanaaja.fuudi < 100.0) {
                        lanaaja.fuudi += lanaaja.massyh;
                    }
                    lanaaja.massyh = lanaaja.massyh - (0.3 * lanaaja.massyh);
                    lanaaja.massy -= 1;
                    telegram.sendMessage(message.chat.id, `HELEVETIN HYVIÄ MAKKAROITA`);
                }
            }
        });
    }
});

telegram.onText(/\/stashMässy (\b\d+\b)/, (message, match) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function (lanaaja) {
            console.log(lanaaja);
            if (lanaaja.name === name) {
                lanaaja.massy += parseInt(match[1]);
                telegram.sendMessage(message.chat.id, `${match[1]} MÄSSYY GOT`);
            }
        });
    }
});

telegram.onText(/\/vituttaa/, (message, match) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function (lanaaja) {
            console.log(lanaaja);
            if (lanaaja.name === name) {
                lanaaja.vitutus2 += 10.0;
                telegram.sendMessage(message.chat.id, `paska peli`);
            }
        });
    }
});

telegram.onText(/\/VITUTTAA/, (message, match) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function (lanaaja) {
            console.log(lanaaja);
            if (lanaaja.name === name) {
                lanaaja.vitutus2 += 20.0;
                telegram.sendMessage(message.chat.id, `VITUN JONNET`);
            }
        });
    }
});

telegram.onText(/\/resetUser/, (message, match) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function (lanaaja) {
            console.log(lanaaja);
            if (lanaaja.name === name) {
                resetStats(lanaaja)
                telegram.sendMessage(message.chat.id, `${lanaaja.name}'s stats have been reset!`);
            }
        });
    }
});

function resetStats(lanaaja) {
    lanaaja.uni = 100.0;
    lanaaja.es  = 0;
    lanaaja.esh = 30.0;
    lanaaja.fuudi = 100.0;
    lanaaja.massy = 0;
    lanaaja.massyh = 10.0;
    lanaaja.vitutus1 = 0.0;
    lanaaja.vitutus2 = 0.0;
    lanaaja.saastaisuus = 0.0;
}

telegram.on('polling_error', (error) => {
    console.log(error.code);  // => 'EFATAL'
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



