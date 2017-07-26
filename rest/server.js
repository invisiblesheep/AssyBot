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

                telegram.sendMessage(message.chat.id, `User ${element.name} \nFood: ${element.fuudi} \nVitutus: ${element.vitutus} \nLANPOWER: ${lanpoweri}`);
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

















// Routes

app.get('/bot', function(req, res) {
    //TODO: IMPLEMENT
    res.send('<html><body><h1>BotStuff</h1></body></html>');
});
// app.get('/:collection', function(req, res) {
//    var params = req.params;
//    console.log('findAll in ' + params.collection);
//    collectionDriver.findAll(req.params.collection, function(error, objs) {
//     	  if (error) { res.send(400, error); }
// 	      else {
// 	          res.set('Content-Type','application/json');
//                   res.send(200, objs);
//          }
//    	});
// });

// app.get('/:collection/:entity', function(req, res) {
//    var params = req.params;
//    var entity = params.entity;
//    var collection = params.collection;
//    if (entity) {
//        collectionDriver.get(collection, entity, function(error, objs) {
//           if (error) { res.send(400, error); }
//           else {
//             res.set('Content-Type','application/json');
//             res.send(200, objs); }
//        });
//    } else {
//       res.send(400, {error: 'bad url', url: req.url});
//    }
// });

app.post('/bot', function(req, res) {
    var object = req.body;
    var collection = "Bot1";
    console.log('save in ' + req.params.collection);
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); }
          else {
            res.set('Content-Type','application/json');
            res.send(201, docs); }
     });
     // collectionDriver.save("LogBase", object, function(err,docs) {
     //       if (err) { console.log('error occured while saving to LogBase'); }
     //       else { console.log('saved to LogBase'); }
     //  });
});

app.put('/bot/:entity', function(req, res) {
    var params = req.params;
    var entity = params.entity;
    var collection = "bot";
    if (entity) {
       collectionDriver.update(collection, req.body, entity, function(error, objs) {
          if (error) { res.send(400, error); }
          else {
            res.set('Content-Type','application/json');
            res.send(200, objs); }
       });
   } else {
       var error = { "message" : "Cannot PUT a whole collection" };
       res.send(400, error);
   }

   // var object = req.body;
   // collectionDriver.save("LogBase", object, function(err,docs) {
   //       if (err) { console.log('error occured while saving to LogBase'); }
   //       else { console.log('saved to LogBase'); }
   //  });
});
/*
app.delete('/:collection/:entity', function(req, res) {
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.delete(collection, entity, function(error, objs) {
          if (error) { res.send(400, error); }
          else { res.send(200, objs); }
       });
   } else {
       var error = { "message" : "Cannot DELETE a whole collection" };
       res.send(400, error);
   }
});
*/

app.get('/', function (req, res) {
    res.send('<html><body><h1>AssyBot</h1></body></html>');
});
app.use(function (req, res) {
    res.render('404', {url:req.url});
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
/*
app.listen(app.get('port'), () => {
  console.log('Express server is listening on ' + app.get('port'));
});
*/
var port = 3002;
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});
