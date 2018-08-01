var mongoose = require('mongoose');
const mongodburi = process.env.MONGODBURI;
mongoose.connect(mongodburi);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
    console.log('CONNECTES TO MONGODB');
});
// var Lanaaja = mongoose.model('Lanaaja', lanaajaSchema);

// var tuomas = new Lanaaja({name: 'Tuomas'});
// var db = mongoose.createConnection(mongodburi, 'test');

// var schema = mongoose.Schema({ name: 'string' });
var lanaajaSchema = new mongoose.Schema( {
  name: String,
  telegramChatId: { type: String, default: ''},
  discordChatId: { type: String, default: ''},
  sleep: { type: Number, default: 100.0 },
  es: { type: Number, default: 0 },
  esh: { type: Number, default: 30.0 },
  food: { type: Number, default: 100.0 },
  massy: { type: Number, default: 0 },
  massyh: { type: Number, default: 10.0 },
  vitutus1: { type: Number, default: 0.0 },
  vitutus2: { type: Number, default: 0.0 },
  filth: { type: Number, default: 0.0 },

  foodWarningFlagLow: { type: Boolean, default: false },
  foodWarningFlagMed: { type: Boolean, default: false },
  foodWarningFlagHigh: { type: Boolean, default: false },

  sleepWarningFlagLow: { type: Boolean, default: false },
  sleepWarningFlagMed: { type: Boolean, default: false },
  sleepWarningFlagHigh: { type: Boolean, default: false },

  filthWarningFlagLow: { type: Boolean, default: false },
  filthWarningFlagMed: { type: Boolean, default: false },
  filthWarningFlagHigh: { type: Boolean, default: false },

});
var LanaajaDB = db.model('Lanaaja', lanaajaSchema);

module.exports.LanaajaDB = LanaajaDB;

var userActionLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now } ,
  lanaaja: String,
  command: String
});
var userActionLog = db.model('UserActionLog', userActionLogSchema);
module.exports.userActionLog = userActionLog;

var snapshotSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now } ,
  lanaajat: [lanaajaSchema]
});
var Snapshot = db.model('Snapshot', snapshotSchema);
module.exports.Snapshot = Snapshot;
// class Lanaaja {
//     constructor(name, esh) {

//         this.name = name;
//         this.sleep = 100.0;
//         this.es  = 0;
//         this.esh = esh;
//         this.food = 100.0;
//         this.massy = 0;
//         this.massyh = 10.0;
//         this.vitutus1 = 0.0;
//         this.vitutus2 = 0.0;
//         this.filth = 0.0;

//         this.foodWarningFlagLow = false;
//         this.foodWarningFlagMed = false;
//         this.foodWarningFlagHigh = false;

//         this.sleepWarningFlagLow = false;
//         this.sleepWarningFlagMed = false;
//         this.sleepWarningFlagHigh = false;

//         this.filthWarningFlagLow = false;
//         this.filthWarningFlagMed = false;
//         this.filthWarningFlagHigh = false;
//     }

//     get(attribute) {

//     }
// }



module.exports.lanaajaSchema = lanaajaSchema;
