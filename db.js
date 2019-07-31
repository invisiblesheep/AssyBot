const mongoose = require('mongoose');

const mongodburi = process.env.MONGODBURI || 'mongodb://localhost:27017/AssyBot';
mongoose.connect(mongodburi, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  // we're connected!
  console.log('CONNECTES TO MONGODB');
});
// var Lanaaja = mongoose.model('Lanaaja', lanaajaSchema);

// var tuomas = new Lanaaja({name: 'Tuomas'});
// var db = mongoose.createConnection(mongodburi, 'test');

// var schema = mongoose.Schema({ name: 'string' });
const lanaajaSchema = new mongoose.Schema({
  name: String,
  telegramChatId: { type: String, default: '' },
  discordChatId: { type: String, default: '' },
  sleep: { type: Number, default: 100.0, minimum: 0 },
  es: { type: Number, default: 0, minimum: 0 },
  esh: { type: Number, default: 30.0, minimum: 0 },
  food: { type: Number, default: 100.0, minimum: 0 },
  massy: { type: Number, default: 0, minimum: 0 },
  massyh: { type: Number, default: 10.0, minimum: 0 },
  vitutus1: { type: Number, default: 0.0, minimum: 0 },
  vitutus2: { type: Number, default: 0.0, minimum: 0 },
  filth: { type: Number, default: 0.0, minimum: 0 },

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
const LanaajaDB = db.model('Lanaaja', lanaajaSchema);

module.exports.LanaajaDB = LanaajaDB;

const userActionLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  lanaaja: String,
  command: String,
});
const userActionLog = db.model('UserActionLog', userActionLogSchema);
module.exports.userActionLog = userActionLog;

const snapshotSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  lanaajat: [lanaajaSchema],
});
const Snapshot = db.model('Snapshot', snapshotSchema);
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
