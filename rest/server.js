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
    TelegramBot = require('node-telegram-bot-api')
    Lanaaja = require('./Lanaaja').Lanaaja;

// import Lanaaja from './Lanaaja'

//Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3002);
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
//var telegram = new TelegramBot(token, { polling: true });

var telegram = new TelegramBot(token);

telegram.setWebHook(`${url}/bot${token}`);
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
  // collectionDriver.deleteOld("FlagBase");
    //TODO: IMPLEMENT
}, 5 * 60000);

function renderColumns(food, sleep, es, frustration, lanpower){
    var foodColumn = renderColumn(food);
    var sleepColumn = renderColumn(sleep);
    var esColumn = renderColumn(es);
    var frustrationColumn = renderColumn(frustration);
    var lanpowerColumn = renderColumn(lanpower);
    var columns = "\nFood:  "+foodColumn+"\nSleep: "+sleepColumn+"\nES:    "+esColumn+"\nFuck:  "+frustrationColumn+"\nLP:    "+lanpowerColumn;
    return columns;
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
        lanaajat.forEach(function(element) {
            console.log(element);
            if (element.name === name) {
                if (element.uni > 0 && element.fuudi > 0) {
                    element.vitutus = ((100.0 - element.uni) + (100.0 - element.fuudi) + element.saastaisuus) / 3;
                    lanpoweri = ((0.8 * element.uni) + (1.2 * element.fuudi) + (100.0 - element.vitutus)) / 3;
                } else {
                    element.vitutus = 100.0;
                    lanpoweri = 0.0;
                }
                var stats = renderColumns(element.fuudi, element.uni, 7, element.vitutus, element.lanpoweri)
                telegram.sendMessage(message.chat.id, `User ${element.name} \nFood: ${element.fuudi} \nVitutus: ${element.vitutus} \nLANPOWER: ${lanpoweri}`);
                //telegram.sendMessage(message.chat.id, `User ${element.name} \nFood: ${element.fuudi} \nVitutus: ${element.vitutus} \nLANPOWER: ${lanpoweri}`);
                // telegram.sendMessage(message.chat.id, `User ${element.name} \nFood: ${element.fuudi}`);
            }
        });
    }


    // console.log(message);
    // telegram.sendMessage(message.chat.id, `Hello ${name} \nHello again,  ${name}`);
    // telegram.sendMessage(message.chat.id, `Hello again,  ${name}`);
});

telegram.onText(/\/statusAll/, (message) => {
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "No lanaaja in the game :(");
    } else {
        lanaajat.forEach(function(element) {
            telegram.sendMessage(message.chat.id, `User ${element.name} \nFood: ${element.fuudi}`);
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

telegram.onText(/\/eatFuudi/, (message) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function(element) {
            if (element.name === name) {
                element.fuudi = 100;
                telegram.sendMessage(message.chat.id, `User ${element.name} just ate!`);
            }
        });
    }
});

telegram.onText(/\/sleep/, (message) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function(element) {
            console.log(element);
            if (element.name === name) {
                element.uni = 100;
                telegram.sendMessage(message.chat.id, `User ${element.name} just woke up!`);
            }
        });
    }
});

telegram.onText(/\/drinkES/, (message) => {
    const name = message.from.username;
    if (lanaajat.length === 0) {
        telegram.sendMessage(message.chat.id, "The current user is not initialized");
    } else {
        lanaajat.forEach(function(element) {
            console.log(element);
            if (element.name === name) {
                if (element.es === 0) {
                    telegram.sendMessage(message.chat.id, `User ${element.name} has no more ES!!!`);
                } else {
                    element.uni += element.esh;
                    element.esh = element.esh - (0.3 * element.esh);
                    element.es -= 1;
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
        lanaajat.forEach(function (element) {
            console.log(element);
            if (element.name === name) {
                element.es += parseInt(match[1]);
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
        lanaajat.forEach(function(element) {
            console.log(element);
            if (element.name === name) {
                if (element.massy === 0) {
                    telegram.sendMessage(message.chat.id, `User ${element.name} has no more MÄSSY!!!`);
                } else {
                    if (element.fuudi < 100.0) {
                        element.fuudi += element.massyh;
                    }
                    element.massyh = element.massyh - (0.3 * element.massyh);
                    element.massy -= 1;
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
        lanaajat.forEach(function (element) {
            console.log(element);
            if (element.name === name) {
                element.massy += parseInt(match[1]);
                telegram.sendMessage(message.chat.id, `${match[1]} MÄSSYY GOT`);
            }
        });
    }
});

telegram.on('polling_error', (error) => {
    console.log(error.code);  // => 'EFATAL'
});


// Start server
/*
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
*/

app.post(`/bot${token}`, (req, res) => {
  telegram.processUpdate(req.body);
  res.sendStatus(200);
});

var port = 3002;
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});



