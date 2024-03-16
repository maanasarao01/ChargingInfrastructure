const express = require('express');

require('dotenv').config();
const app = express();

function startServer() {
  app.use(express.json());

  const chargeStationRoutes = require('./routes/chargeStationRoutes');
  app.use('/charging-stations', chargeStationRoutes);

  const port=process.env.PORT;

  const server = app.listen(port, () => {
    app.set('message', `Server running on port ${port}\n`);
  });
  return server;
}


module.exports={app, startServer};
