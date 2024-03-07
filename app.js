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

const server=app.listen(getPort(), () =>{
  app.set('message', `Server running on port ${getPort()}`);
});

module.exports = {app, server, getPort};
