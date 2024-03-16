
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const {expect} = chai;

describe('Server Initialization', () => {
  let sandbox;

  before(() => {
    // Create a sandbox to manage stubs
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should start the server', () => {
    // Stub the startServer function
    const startServerStub = sandbox.stub().returns({});

    const connectToDBStub = sandbox.stub();

    const fakeAppModule = {
      startServer: startServerStub,
      connectToDB: connectToDBStub,
    };

    // Stub dotenv config
    const dotenvConfigStub = sandbox.stub().returns({parsed: {}});

    // Stub require statements
    const serverModule = proxyquire('../app', {
      '/app': fakeAppModule,
      './Server': {startServer: startServerStub},
      './ChargingStation/DB': {connectToDB: connectToDBStub},
      'dotenv': {config: dotenvConfigStub},
    });

    serverModule;

    // Expectations
    expect(startServerStub.calledOnce).to.be.true;
  });
});
