
const express = require('express');
const router = express.Router();
const {create, findConnectorOfType, updateWattageOfConnectorById,
  deleteConnectorById, findChargingPoints} = require('../ChargingStation/crudOperations');
const {getConnectorDetailsById}=require('../ChargingStation/ChargingTime');

// Define routes

// Route for creating a connectors
router.post('/connectors', async (req, res) => {
  const {id, type, connector, wattage, manufacturer, ChargePointID, location} = req.body;
  const result =
    await create(id, type, connector, wattage, manufacturer, ChargePointID, location);
  res.json({message: result});
});


router.get('/estimate-charging-time/:id', async (req, res) => {
  const id = req.params.id;
  const {batteryCapacity, SoC}=req.query;
  const result = await getConnectorDetailsById(id, batteryCapacity, SoC);
  res.json({message: result});
});

// Route for finding charging points
router.get('/charging-points/:location', async (req, res) => {
  const {location} = req.params;
  const result = await findChargingPoints(location);
  res.json({message: result});
});

// Route for finding connectors of a specific type within an area
router.get('/connectors/:location/:connectorType', async (req, res) => {
  const {location, connectorType} = req.params;
  const result = await findConnectorOfType(location, connectorType);
  res.json({message: result});
});

// Route for updating wattage of a connector by ID
router.put('/connectors/:id', async (req, res) => {
  const id = req.params.id;
  const upgradeWatt = req.body.wattage;
  const result = await updateWattageOfConnectorById(id, upgradeWatt);
  res.json({message: result});
});

// Route for deleting a connector by ID
router.delete('/connectors/:id', async (req, res) => {
  const {id} = req.params;
  const result = await deleteConnectorById(id);
  res.json({message: result});
});

module.exports = router;
