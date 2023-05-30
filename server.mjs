import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import routes from './routes/index.mjs'

// if you need to update seeds and models
// import User from './models/user_model.mjs'
// import Bike from './models/bike_model.mjs'
// import userSeed from "./seeds/user_seed.js"
// import bikeSeed from './seeds/bike_seed.mjs'

const app = express();

dotenv.config(); // required for .env file usage

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", routes) // connects to the routes 'router' which then extend endpoints in controllers

const PORT = process.env.PORT || 3000;
  
// === only need the following for seeding currently ===

// ======================================================

const dbConnection = process.env.mongoDBConn; // referencing the .env variable
// console.log(dbConnection); // to check conn string if needed

// connecting with the connection string from the .env file
mongoose
  .connect(dbConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    // will display if you're able to connect the database
    console.log("Connected to MongoDB");
    // starting server if able to access db
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}...`);
      });
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
    console.log("Error connecting to MongoDB:", error.message);
  });
