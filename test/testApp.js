
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const {expect} = chai;

describe('Server Initialization', () => {
  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    // Restoring the sandbox after each test
    sandbox.restore();
  });

  it('should start the server', () => {
    // Stub the startServer function
    const startServerStub = sandbox.stub().returns({});

    // Stub connectToDB function
    const connectToDBStub = sandbox.stub();

    const fakeAppModule = {
      startServer: startServerStub,
      connectToDB: connectToDBStub,
    };

    // Stubbing dotenv config
    const dotenvConfigStub = sandbox.stub().returns({parsed: {}});

    // Stub require statements
    const serverModule = proxyquire('../app', {
      '/app': fakeAppModule,
      './Server': {startServer: startServerStub},
      './ChargingStation/DB': {connectToDB: connectToDBStub},
      'dotenv': {config: dotenvConfigStub},
    });

    serverModule;
    
    expect(startServerStub.calledOnce).to.be.true;
  });
});
