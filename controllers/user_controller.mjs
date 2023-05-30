import * as users from "../models/user_model.mjs";
import { findBikeById } from "../models/bike_model.mjs";
import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';

const app = express.Router();
// attaching routes through router

// this is wrapped around MainApp 'innerApp' and runs on every component/screen wrapped in that file
app.get("/auth-check/:userID", async (req, res, next) => {
  let filter = { userID: req.params.userID };
  const user = await users.findUsers(filter);
  try {
    console.log(user[0])
    if (!user[0].token) {
      res.json("No token for user")
    } else {
      const decoded = jwt.verify(user[0].token, process.env.JWT_SECRET);
      // checks if current time - jwt creation is greater than time expires
      if (parseInt(Date.now() / 1000) - decoded.iat > decoded.expiresIn) {
        console.log("expired");
        return res.json({ isAuthenticated: false });
      }
      if (user[0].banned === "true" ){
        return res.json({ isAuthenticated: false}); //statement not working :(
      } else {
        console.log("auth fine; time elapsed: ", parseInt(Date.now() / 1000) - decoded.iat);
        return res.json({ isAuthenticated: true, token: user[0].token });
      }
    }

  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { userID, password } = req.body;
    const user = await users.findUsers({ userID });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Auth failed" });
    }
    if(user[0].banned === "true" )
      return res.status(401).json({message: "user banned from app"})
    // because the findUsers method is giving back an array
    const isValid = await user[0].isValidPassword(password);
    if (!isValid) {
      return res.status(401).json({ message: "Auth failed" });
    }
    // creating a token
    const token = jwt.sign({ userId: user._id, expiresIn: "9h" }, process.env.JWT_SECRET);
    // respond with token probably look for valid in routes
    users.updateUser(
      user[0]._id,
      user[0].userID,
      user[0].username,
      user[0].canRepair,
      user[0].banned,
      user[0].privilege,
      token
    );
    // responding with everything but password
    res.json({
      _id: user[0]._id,
      userID: user[0].userID,
      username: user[0].username,
      canRepair: user[0].canRepair,
      banned: user[0].banned,
      privilege: user[0].privilege,
      token: token,
    });
  } catch (error) {
    next(error);
  }
});

// Logout will update users token to be null
app.post("/logout", async (req, res, next) => {
  // console.log("hello?")
  try {
    const { userID } = req.body;
    const user = await users.findUsers({ userID });
    // console.log(user);
    if (!user) {
      return res.status(401).json({ message: "No user found failed" });
    }

    // respond with token probably look for valid in routes
    // console.log("BEFORE:", user[0]);
    users.updateUser(
      user[0]._id,
      user[0].userID,
      user[0].username,
      user[0].canRepair,
      user[0].banned,
      user[0].privilege,
      null
    );
    // console.log("AFTER:", user[0]);
    return res.status(200).json("User Logged out/token removed");
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new user
 */
app.post("/", (req, res) => {
  // console.log(req.body)
  // expires in 1 hour
  const token = jwt.sign({ userId: req.body.userID, expiresIn: "9h" }, process.env.JWT_SECRET);
  users
    .createUser(
      req.body.userID,
      req.body.username,
      req.body.password,
      req.body.canRepair,
      req.body.banned,
      req.body.privilege,
      token
    )
    .then((user) => {
      console.log(user);
      // send back the user and the token on new user signup
      res.status(201).json(user);
    })
    .catch((error) => {
      console.error("ERROR: ", error);
      res.status(400).json({ Error: "Request failed: cannot create user" });
    });
});

/**
 * Retrieve all users.
 */
app.get("/", (req, res) => {
  let filter = {};
  users
    .findUsers(filter, "", 0)
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ Error: "Request failed: cannot find users" });
    });
});

/**
 * Retrieve the user corresponding to the ID provided in the URL.
 */
app.get("/:_id", (req, res) => {
  const userId = req.params._id;
  users
    .findUserById(userId)
    .then((user) => {
      if (user !== null) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ Error: "User not found" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ Error: "Cannot find user" });
    });
});

/**
 * Update the user whose id is provided in the path parameter and set
 * its attributes to the values provided in the body.
 */
app.put("/:_id", (req, res) => {
  users
    .updateUser(
      req.params._id,
      req.body.userID,
      req.body.username,
      req.body.canRepair,
      req.body.banned,
      req.body.privilege,
      req.body.token
    )
    .then((numUpdated) => {
      if (numUpdated === 1) {
        res.status(200).json({
          _id: req.params._id,
          userID: req.body.userID,
          username: req.body.username,
          canRepair: req.body.canRepair,
          banned: req.body.banned,
          privilege: req.body.privilege,
          token: req.body.token,
        });
      } else {
        res.status(404).json({ Error: "Resource not found" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ Error: "Request failed: cannot update user" });
    });
});

/**
 * Delete the user whose id is provided in the query parameters
 */
app.delete("/:_id", (req, res) => {
  users
    .deleteUserById(req.params._id)
    .then((deletedCount) => {
      if (deletedCount === 1) {
        res.status(204).json({ Message: `${deletedCount} items have been deleted` });
      } else {
        res.status(404).json({ Error: "Resource not found" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ Error: "Request failed: cannot delete user" });
    });
});

/**
 * Emails the user after 8 hours has passed to return their bike.
 */
app.post("/email", async (req, res, next) => {

  //check after the timeOut if the bike is still checked out by the same user
  //if yes, then send out email
  //let us assume a user is not trying to return and recheckout multiple times.
  //we can assure that a user who checked a bike out twice in a row is properly emailed
  //by checking that the timeout is roughly (24-8) hours away from current time
  //may implement later!

  setTimeout(async () => {

    const bikeId = req.body.bike;
    findBikeById(bikeId)
        .then(bike => {
            if (bike.userID !== req.body.userID){
              return
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ Error: "Cannot find bike" });
        });

    const { userID, username } = req.body;

    try {
  
        let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "smtp.mailgun.org",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.USER, // generated ethereal user
            pass: process.env.PASS, // generated ethereal password
          },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: process.env.USER, // sender address
          to: userID, // list of receivers
          subject: `Hello ${username}`, // Subject line
          text: "Return your Bike", // plain text body
        //   html: "<b>Hello world?</b>", // html body
        });

        console.log("Message sent: %s", info.messageId);
    } catch (e) {
        console.error(e);
    }
  }, 28800000) //currently set at eight hours

  
});

/**
 * Update the ban attribute such that a user can no longer sign in
 */
app.put("/ban-user/:_id", (req, res) => {
  
  setTimeout(async () =>{
  users
    .updateUser(
      req.params._id,
      req.body.userID,
      req.body.username,
      req.body.canRepair,
      "true",
      req.body.privilege,
      req.body.token
    )
    .then((numUpdated) => {
      if (numUpdated === 1) {
        res.status(200).json({
          _id: req.params._id,
          userID: req.body.userID,
          username: req.body.username,
          canRepair: req.body.canRepair,
          banned: "true",
          privilege: req.body.privilege,
          token: req.body.token,
        });
      } else {
        res.status(404).json({ Error: "Resource not found" });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ Error: "Request failed: cannot update user" });
    });
  }, 86400000)   //currently set at 8 hours
})
// exporting routes attached to router
export default app;
