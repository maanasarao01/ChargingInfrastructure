const express = require('express');
const app = express();

const {connectToDB, disconnectFromDB}=require('./ChargingStation/DB');

app.use(express.json());

require('dotenv').config();

before(async ()=>{
  await connectToDB();
});

async function stopServer() {
  await disconnectFromDB();
}

// import Routes
const chargeStationRoutes = require('./routes/chargeStationRoutes');

// Route for charge station operations
app.use('/charging-stations', chargeStationRoutes);

const port=process.env.PORT;

const server=app.listen(port, ()=>{
  console.log(`Server running on port ${port}`);
});

module.exports = {app, server, stopServer};
