const chargingStation=require('../models/chargeStation');
const axios=require('axios');


// Function to find Connector By ID
async function getConnectorDetailsById(id, batteryCapacity, SoC) {
  const found = await chargingStation.findOne({'chargePoint.connector._id': id});
  if (found) {
    const power=found.chargePoint.connector.wattage;
    // server details
    const EstimationServerurl=`http://localhost:2000/estimate-charging-time`;
    // query parameters
    const batteryDetails={
      powerInKW: power,
      batteryCapacity: batteryCapacity,
      socInPercentage: SoC,
    };
    const estimationResponse = await axios.get(EstimationServerurl, {params: batteryDetails} );

    if (estimationResponse.data.estimatedTime) {
      console.log(EstimationServerurl);
      const estimatedChargingTimeInHours = estimationResponse.data.estimatedTime;
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
