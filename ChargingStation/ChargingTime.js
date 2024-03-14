
const chargingStation=require('../models/chargeStation');
const axios=require('axios');

// server details
const EstimationServerurl=`http://localhost:2001/estimate-charging-time`;

// Function to find Connector By ID
async function getConnectorDetailsById(id, batteryCapacity, SoC) {
  const found = await chargingStation.findOne({'chargePoint.connector._id': id});
  if (found) {
    const power=found.chargePoint.connector.wattage;

    // query parameters
    const batteryDetails={
      powerInKW: power,
      batteryCapacityInKWh: batteryCapacity,
      socInPercentage: SoC,
    };
    const estimationResponse = await axios.get(EstimationServerurl, {params: batteryDetails} );

    if (estimationResponse.data.estimatedTimeInHours) {
      console.log(EstimationServerurl);
      const estimatedChargingTimeInHours = estimationResponse.data.estimatedTimeInHours;
      const connectorDetails={
        connector: found.chargePoint.connector,
        estimatedChargingTime: estimatedChargingTimeInHours,
      };
      console.log(connectorDetails);
      return estimatedChargingTimeInHours;
    } else {
      return estimationResponse.data.message;
    }
  } else {
    return 'Unavailaible';
  }
}

module.exports={getConnectorDetailsById};
