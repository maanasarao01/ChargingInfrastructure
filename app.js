const express = require('express');
const app = express();

const {/* connectToDB,*/ disconnectFromDB}=require('./ChargingStation/DB');

app.use(express.json());

require('dotenv').config();

// uncomment the above import and below block before executing the app
/* before(async ()=>{
  await connectToDB();
});*/

async function stopServer() {
  await disconnectFromDB();
}

// import Routes
const chargeStationRoutes = require('./routes/chargeStationRoutes');

// Route for charge station operations
app.use('/charging-stations', chargeStationRoutes);


// Start server
function getPort() {
  const PORT = parseInt(process.env.PORT, 10) || 3000;
  return PORT;
}

const server=app.listen(getPort(), ()=>{
  console.log(`Server running on port ${getPort()}`);
});

module.exports = {app, server, getPort, stopServer};
