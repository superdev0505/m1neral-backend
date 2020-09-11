///////////////////  Connection File  /////////////////////////////////

const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const mongoOptions = {
  useUnifiedTopology: true,
  useNewUrlParser: true
}

function connect(connectString) {
  try {
    let MongoConnection = mongoose.createConnection(connectString, mongoOptions);

    MongoConnection.on('connected', () => {
      console.log(`Connection to Cosmos MongoDB (${connectString}) successful 🚀`);
    });

    MongoConnection.on('error', (err) => {
      console.log(`Mongoose connection error: ${String(err)}`);
      // If first connect fails because mongod is down, try again later.
      // This is only needed for first connect, not for runtime reconnects.
      // See: https://github.com/Automattic/mongoose/issues/5169
      if (err.  name && err.name === 'MongooseServerSelectionError') {
          // Wait for a bit, then try to connect again
          setTimeout(() => {
              console.log('Retrying first connect...');
              MongoConnection.openUri(connectString, mongoOptions).catch(() => {});
              // Why the empty catch?
              // Well, errors thrown by db.open() will also be passed to .on('error'),
              // so we can handle them there, no need to log anything in the catch here.
              // But we still need this empty catch to avoid unhandled rejections.
          }, 30 * 1000);
      } else {
          // Some other error occurred.  Log it.
          console.error(new Date(), String(err));
      }
    });

    MongoConnection.on('disconnected', () => {
      console.log('Mongoose connection disconnected');
    });  

    return MongoConnection;
  } catch (err) {
    console.error(err);
    return `MongoConnection fail`;
  }
}

module.exports = {
  connect,
  mongoose
};
