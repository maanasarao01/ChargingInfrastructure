const mongoose = require('mongoose');

const connectorSchema = new mongoose.Schema({
  _id: {type: String, required: true},
  type: {type: String, required: true},
  connector: {type: String, required: true},
  wattage: {type: Number, required: true},
  manufacturer: {type: String, required: true},
});

const chargePointSchema = new mongoose.Schema({
  _id: {type: String, required: true},
  connector: connectorSchema, // Embedding connector schema
});

const locationSchema = new mongoose.Schema({
  location: {type: String, required: true},
  chargePoint: chargePointSchema, // Embedding chargePoint schema
});

module.exports = mongoose.model('ChargingStation', locationSchema);
