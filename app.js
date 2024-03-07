const express = require('express');
const app = express();

app.use(express.json());

// import Routes
const chargeStationRoutes = require('./routes/chargeStationRoutes');

// Route for charge station operations
app.use('/charging-stations', chargeStationRoutes);


require('dotenv').config();

// Start server
function getPort() {
  const PORT = parseInt(process.env.PORT, 10) || 3000;
  return PORT;
}

const server=app.listen(getPORT(), ()=>
  app.set('message', `Server running on port ${getPORT()}`),
);

module.exports = {app, server, getPort};
