const request = require('supertest');
const {app, getPORT, server} = require('../app');
const {expect} = require('chai');
const mongoose=require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');

let mongoServer;

describe('Charging Infrastructure CRUD Operations', () => {
  before(async () => {
    // SetUP mongoServer
    mongoServer = new MongoMemoryServer();
    await mongoServer.start();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('Successfully connected!\n');
  });

  it('should use the value of PORT if set', () => {
    // set Custom port number
    process.env.PORT=5000;
    const port = getPORT();
    expect(port).to.equal(5000);
  });

  it('should default to 3000 if PORT is not set', () => {
    // Clear PORT environment variable
    delete process.env.PORT;
    const port =getPORT();
    expect(port).to.equal(3000);
  });

  // Checking for server
  it('should start the server on the specified port', async () => {
    const res = app.get('message');
    console.log(res, '\n\n');
    expect(res).to.equal(`Server running on port ${getPORT()}`);
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
    const res = await request(app)
        .post('/charging-stations/connectors')
        .send({
          id: '',
          type: undefined,
          connector: 'China',
        });

    expect(res.body).to.have.property('message').to.equal('Insertion Unsuccessful');
  });

  // Find ChargingPoints for a given location
  it('should find charging points for a given location', async () => {
    const result = await request(app).get('/charging-stations/charging-points/Majestic');
    expect(result.body).to.have.property('message').to.equal('Found');
  });

  it('should fail to find charging points for an unavailable location', async () => {
    const res = await request(app).get('/charging-stations/charging-points/Mumbai');
    expect(res.body).to.have.property('message').to.equal('No ChargingPoints Here');
  });

  // Find Connector for a given location
  it('should find Connector for a given location', async () => {
    const found =
    await request(app).get('/charging-stations/connectors/Girinagar/DC%20Fast%20Charging');
    expect(found.body).to.have.property('message').to.equal('Availaible');
  });

  it('should fail on unavailable Connectors for a given location', async () => {
    const res = await request(app).get('/charging-stations/connectors/Delhi/Type%202%20AC');
    expect(res.body).to.have.property('message').to.equal('Connector Unavailaible');
  });


  // Update Wattage of Connector by ID
  it('should update Wattage of a connector by ID', async () => {
    const res = await request(app)
        .put('/charging-stations/connectors/C03')
        .send({wattage: 30});
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message').to.equal('Updated successfully');
  });

  it('should fail on attempting to update a non existing EV connector by ID', async () => {
    const res = await request(app)
        .put('/charging-stations/connectors/C09')
        .send({wattage: 100});
    expect(res.body).to.have.property('message').to.equal('Couldn\'t update');
  });

  // Delete connector by ID
  it('should delete an existing EV connector by ID', async () => {
    const res = await request(app)
        .delete('/charging-stations/connectors/C01');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message').to.equal('Deleted successfully');
  });

  it('shouldn\'t delete a non existing EV connector by ID', async () => {
    const res = await request(app)
        .delete('/charging-stations/connectors/C07');
    expect(res.body).to.have.property('message').to.equal('Couldn\'t delete');
  });

  // DISCONNECTION
  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
    await server.close();
    console.log('Disconnected from mongoDB and the server:)');
  });
});
