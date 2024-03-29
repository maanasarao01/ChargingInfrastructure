const chargingStation = require('../models/chargeStation');

// CRUD Operations

// Function to create a new Connector
async function create(id, type, connector, wattage, manufacturer, ChargePointID, location) {
  try {
    await chargingStation.create({
      location: location,
      chargePoint: {
        _id: ChargePointID,
        connector: {
          _id: id,
          type: type,
          connector: connector,
          wattage: wattage,
          manufacturer: manufacturer,
        },
      },
    });

    return 'Created';
  } catch (e) {
    return 'Insertion Unsuccessful';
  }
}

// read Operations
async function findChargingPoints(location) {
  const place = new RegExp(location, 'i');
  const found = await chargingStation.find({'location': {$regex: place}});
  return found.length>0?'Found':'No CPs here';
}


async function findConnectorOfType(location, connectorType) {
  const place = new RegExp(location, 'i');
  const found = await chargingStation.find({'location': {$regex: place},
    'chargePoint.connector.type': connectorType});
  return found.length>0?'Availaible':'Connector Unavailaible';
}

// Function to update Wattage of connector by ID
async function updateWattageOfConnectorById(id, upgradeWatt) {
  const updatedPower=await chargingStation.updateOne(
      {'chargePoint.connector._id': id}, {$set: {'chargePoint.connector.wattage': upgradeWatt}});
  return updatedPower.modifiedCount>0?'Updated successfully':
          'Couldn\'t update';
}

// Function to delete a connector by ID
async function deleteConnectorById(id) {
  const deleted=await chargingStation.deleteOne({'chargePoint.connector._id': id});
  return deleted.deletedCount>0?'Deleted successfully':'Couldn\'t delete';
}

// Export the CRUD operations functions
module.exports = {create, findConnectorOfType,
  updateWattageOfConnectorById, deleteConnectorById, findChargingPoints};


