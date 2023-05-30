const mongoose = require('mongoose');
require('dotenv').config(); // required for .env file usage

// === only need the following for seeding currently ===
const User = require('../models/user_model.mjs')
const Bike = require('../models/bike_model.mjs')
const userSeed = require('../seeds/user_seed')
const bikeSeed = require('../seeds/bike_seed')
// ======================================================

const dbConnection = process.env.mongoDBConn // referencing the .env variable

// connecting with the connection string from the .env file
mongoose.connect(dbConnection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  // will display if you're able to connect the database
  console.log('Connected to MongoDB');
  // comment the following two lines in for seeding wont be necessary as we're sharing a db connection
  // I will go ahead and populate these
  // await User.insertMany(userSeed)

  // For seeding bikes
  // await Bike.insertMany(bikeSeed)
  // .then(() => {
  //   return Bike.find().populate('ownerID').exec();
  // })
  // .then((bikes) => {
  //   console.log(bikes);
  // })
  // .catch((err) => {
  //   console.error(err);
  // });
})
.catch((error) => {
  console.log('Error connecting to MongoDB:', error.message);
});