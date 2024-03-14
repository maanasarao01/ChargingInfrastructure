const express = require('express');
const mongoose=require('mongoose')

require('dotenv').config();


const app = express();
app.use(express.json());

const chargeStationRoutes = require('./routes/chargeStationRoutes');
app.use('/charging-stations', chargeStationRoutes);

const port=process.env.PORT;

const server = app.listen(port, () => {
  app.set('message', `Server running on port ${port}\n`);
});

function stopServer() {
  server.close();
}

mongoose.connect(process.env.mongo_URI);

module.exports = {app, stopServer};
