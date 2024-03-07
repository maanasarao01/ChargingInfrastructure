const request = require('supertest');
const {app, getPort, server, stopServer} = require('../app');
const {expect} = require('chai');
const {connectToDB}=require('../ChargingStation/DB');


const nock=require('nock');

describe('Testing Charging Infrastructure CRUD Operations', () => {
  before(async () => {
    // SetUP mongoServer
    await connectToDB();
  });

  it('should use the value of PORT if set', () => {
    // process.env.PORT is fetched from .env;
    const port = getPort();
    expect(port).to.equal(3003);
  });

  it('should default to 3000 if PORT is not set', async () => {
    // Clear PORT environment variable
    delete process.env.PORT;
    const port =getPort();
    expect(port).to.equal(3000);
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
        .put('/charging-stations/connectors/C03')
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


describe('Testing Asset Server', ()=>{
  // Find Connectors for a given ID
  it('should find Connector for a given ID and return estimated Time', async () => {
    // mocking Estimation Server
    nock('http://localhost:2000')
        .get('/estimate-charging-time')
        .query(true)
        .reply(200, {estimatedTime: 1.08});

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
    nock('http://localhost:2000')
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
    await stopServer();
    await server.close();
    console.log('Disconnected from mongoDB and the server:)');
  });
});
