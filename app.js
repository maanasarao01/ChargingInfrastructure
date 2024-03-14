
const {startServer}=require('./Server');
require('dotenv').config();

startServer();

const {connectToDB}=require('./ChargingStation/DB');
connectToDB(process.env.mongo_URI);


