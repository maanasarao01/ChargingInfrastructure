const express = require('express');

// uncomment all the commented codes when executing in production

// const {connectToDB}=require('./ChargingStation/DB');

require('dotenv').config();
let server;

async function startServer() {
  return new Promise((resolve) => {
    const app = express();
    app.use(express.json());

    const chargeStationRoutes = require('./routes/chargeStationRoutes');
    app.use('/charging-stations', chargeStationRoutes);

    const port=process.env.PORT;

    server = app.listen(port, () => {
      app.set('message', `Server running on port ${port}\n`);
      resolve(app); // Resolve with the app instance once the server is started
    });
  });
}

function stopServer() {
  server.close();
}

// startServer()
// connectToDB(process.env.mongo_URI)


module.exports = {startServer, stopServer};
