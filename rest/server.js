
//Dependencies
var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    CollectionDriver = require('./collectionDriver').CollectionDriver,
    mongoose = require('mongoose'),
    assert = require('assert');

//Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//MongoDB
var mongoHost = 'mongodb://localhost:27017/AssyBot';
var collectionDriver;

MongoClient.connect(mongoHost, function(err, db){
  assert.equal(null, err);
  console.log('Connected to mongodb server');
  collectionDriver = new CollectionDriver(db);
});

setInterval(function(){
  console.log("setInterval: Updating player stats");
  // collectionDriver.deleteOld("FlagBase");
    //TODO: IMPLEMENT
}, 5 * 60000);

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

// app.post('/:collection', function(req, res) {
//     var object = req.body;
//     var collection = req.params.collection;
//     console.log('save in ' + req.params.collection);
//     collectionDriver.save(collection, object, function(err,docs) {
//           if (err) { res.send(400, err); }
//           else {
//             res.set('Content-Type','application/json');
//             res.send(201, docs); }
//      });
//      collectionDriver.save("LogBase", object, function(err,docs) {
//            if (err) { console.log('error occured while saving to LogBase'); }
//            else { console.log('saved to LogBase'); }
//       });
// });

// app.put('/:collection/:entity', function(req, res) {
//     var params = req.params;
//     var entity = params.entity;
//     var collection = params.collection;
//     if (entity) {
//        collectionDriver.update(collection, req.body, entity, function(error, objs) {
//           if (error) { res.send(400, error); }
//           else {
//             res.set('Content-Type','application/json');
//             res.send(200, objs); }
//        });
//    } else {
//        var error = { "message" : "Cannot PUT a whole collection" };
//        res.send(400, error);
//    }
//
//    var object = req.body;
//    collectionDriver.save("LogBase", object, function(err,docs) {
//          if (err) { console.log('error occured while saving to LogBase'); }
//          else { console.log('saved to LogBase'); }
//     });
// });
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
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
