const mongoose=require('mongoose');

async function connectToDB(mongoUri) {
  // SetUP mongoServer
  await mongoose.connect(mongoUri);
  console.log(mongoUri);
  console.log('Successfully connected!\n');
}

async function disconnectFromDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
}


module.exports={connectToDB, disconnectFromDB};
