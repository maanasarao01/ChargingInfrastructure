const mongoose=require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');

require('dotenv').config();

let mongoServer;

async function connectToDB() {
  // SetUP mongoServer
  mongoServer = new MongoMemoryServer();
  await mongoServer.start();
  const mongoUri = process.env.mongo_URI;
  await mongoose.connect(mongoUri);
  console.log(mongoUri);
  console.log('Successfully connected!\n');
}

async function disconnectFromDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
}


module.exports={connectToDB, disconnectFromDB};
