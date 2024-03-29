const request = require('supertest');
const {app, startServer} = require('../Server');
const {expect} = require('chai');
const {connectToDB, disconnectFromDB}=require('../ChargingStation/DB');
const {MongoMemoryServer} = require('mongodb-memory-server');

const axios=require('axios');
const nock=require('nock');

let mongoServer;
let server;

describe('Testing Charging Infrastructure CRUD Operations\n', () => {
  before('Connecting to Database', async ()=>{
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.mongo_URI = mongoUri;
    console.log('Connecting via MongoServer');
    await connectToDB(process.env.mongo_URI);
    server=startServer();
  });

  // Checking for server
  it('should start the server on the specified port', async () => {
    const serverStarted = app.get('message');
    console.log(serverStarted);
    expect(serverStarted).to.equal(`Server running on port 3003\n`);
  });

  // Creating Connectors
  it('should successfully create charging stations', async () => {
    const result1 = await request(app)
        .post('/charging-stations/connectors')
        .send({
          id: 'C01',
          type: 'Type 2 AC',
          connector: 'J1772',
          wattage: 7.6,
          manufacturer: 'Mennekes',
          ChargePointID: 'CP1',
          location: 'Majestic, Bangalore',
        });
    expect(result1.status).to.equal(200);
    expect(result1.body).to.have.property('message').to.equal('Created');

    const result2 = await request(app)
        .post('/charging-stations/connectors')
        .send({
          id: 'C02',
          type: 'Type 2 AC',
          connector: 'Tesla',
          wattage: 22,
          manufacturer: 'Tesla',
          ChargePointID: 'CP1',
          location: 'Majestic, Bangalore',
        });
    expect(result2.body).to.have.property('message').to.equal('Created');

    const result3 = await request(app)
        .post('/charging-stations/connectors')
        .send({
          id: 'C03',
          type: 'DC Fast Charging',
          connector: 'CCS',
          wattage: 24,
          manufacturer: 'Duosida (China)',
          ChargePointID: 'CP2',
          location: 'Girinagar, Bangalore',
        });
    expect(result3.body).to.have.property('message').to.equal('Created');

    const result4 = await request(app)
        .post('/charging-stations/connectors')
        .send({
          id: 'C04',
          type: 'DC Fast Charging',
          connector: 'CCS',
          wattage: 200,
          manufacturer: 'MennekesCombo',
          ChargePointID: 'CP3',
          location: 'Delhi',
        });
    expect(result4.body).to.have.property('message').to.equal('Created');

    const result5= await request(app)
        .post('/charging-stations/connectors')
        .send({
          id: 'C05',
          type: 'Type 2 AC',
          connector: 'Mennekes(Type 2)',
          wattage: 22,
          manufacturer: 'Mennekes',
          ChargePointID: 'CP2',
          location: 'Girinagar, Bangalore',
        });
    expect(result5.body).to.have.property('message').to.equal('Created');
  });

  it('should fail to create a connector with undefined/empty fields', async () => {
    const Connector = await request(app)
        .post('/charging-stations/connectors')
        .send({
          id: '',
          type: undefined,
          connector: 'China',
        });

    expect(Connector.body).to.have.property('message').to.equal('Insertion Unsuccessful');
  });

  // Find ChargingPoints for a given location
  it('should find ChargingPoints for a given location', async () => {
    const foundCP = await request(app).get('/charging-stations/charging-points/Majestic');
    expect(foundCP.body).to.have.property('message').to.equal('Found');
  });

  it('should fail on finding non-availaible CPs in given location', async () => {
    const CP = await request(app).get('/charging-stations/charging-points/Padubidri');
    expect(CP.body).to.have.property('message').to.equal('No CPs here');
  });

  // Find Connector for a given location
  it('should find Connector for a given location', async () => {
    const foundConnector =
    await request(app).get('/charging-stations/connectors/Girinagar/DC%20Fast%20Charging');
    expect(foundConnector.body).to.have.property('message').to.equal('Availaible');
  });

  it('should fail on unavailable Connectors for a given location', async () => {
    const connectorUnavailaible =
    await request(app).get('/charging-stations/connectors/Delhi/Type%202%20AC');
    expect(connectorUnavailaible.body).to.have.property('message')
        .to.equal('Connector Unavailaible');
  });


  // Update Wattage of Connector by ID
  it('should update Wattage of a connector by ID', async () => {
    const updatedWattage = await request(app)
        .put('/charging-stations/connectors/C04')
        .send({wattage: 30});
    expect(updatedWattage.status).to.equal(200);
    expect(updatedWattage.body).to.have.property('message').to.equal('Updated successfully');
  });

  it('should fail on attempting to update a non existing EV connector by ID', async () => {
    const updateFailed = await request(app)
        .put('/charging-stations/connectors/C09')
        .send({wattage: 100});
    expect(updateFailed.body).to.have.property('message').to.equal('Couldn\'t update');
  });

  // Delete connector by ID
  it('should delete an existing EV connector by ID', async () => {
    const deletedConnector = await request(app)
        .delete('/charging-stations/connectors/C01');
    expect(deletedConnector.status).to.equal(200);
    expect(deletedConnector.body).to.have.property('message').to.equal('Deleted successfully');
  });

  it('shouldn\'t delete a non existing EV connector by ID', async () => {
    const connectorNotFound = await request(app)
        .delete('/charging-stations/connectors/C07');
    expect(connectorNotFound.body).to.have.property('message').to.equal('Couldn\'t delete');
  });
});


describe('\nTesting Asset Server\n', ()=>{
  // Check if server is running without using nock
  it('should pass if Estimation server is not running\n', async ()=>{
    const batteryDetails={
      powerInKW: 22,
      batteryCapacityInKWh: 35,
      socInPercentage: 40,
    };
    try {
      await axios.get('http://localhost:2001/estimate-charging-time',
          {params: batteryDetails});
    } catch (e) {
      expect(e.code).to.equal('ECONNREFUSED');
    }
  });

  // Find Connectors for a given ID
  it('should find Connector for a given ID and return estimated Time', async () => {
    // mocking Estimation Server
    nock('http://localhost:2001')
        .get('/estimate-charging-time')
        .query(true)
        .reply(200, {estimatedTimeInHours: 1.08});

    const estimatedTime = await request(app).get('/charging-stations/estimate-charging-time/C03')
        .query({
          batteryCapacity: 40,
          SoC: 35,
        });
    expect(estimatedTime.body).to.have.property('message').to.equal(1.08);
  });

  it('should fail to find Connector for an invalid ID', async () => {
    const invalidConnectorID =
        await request(app).get('/charging-stations/estimate-charging-time/C08')
            .query({
              batteryCapacity: 30,
              SoC: 50,
            });
    expect(invalidConnectorID.body).to.have.property('message').to.equal('Unavailaible');
  });

  it('should return Invalid on incomplete or bad requests', async () => {
    nock('http://localhost:2001')
        .get('/estimate-charging-time')
        .query(true)
        .reply(200, {message: 'Invalid Input'});

    const badRequest = await request(app).get('/charging-stations/estimate-charging-time/C02')
        .query({
          batteryCapacity: undefined,
        });
    expect(badRequest.body).to.have.property('message').to.equal('Invalid Input');
  });

  // DISCONNECTION
  after(async () => {
    server.close();
    await disconnectFromDB();
    await mongoServer.stop();
    nock.cleanAll();
    console.log('Disconnected from mongoDB and the server:)');
  });
});
