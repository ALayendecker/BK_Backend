import * as bikes from "../models/bike_model.mjs"
import express from 'express';

const app = express();
// attaching routes through router

/**
 * Create a new bike with the attributes provided in the body
 */
app.post('/', (req, res) => {
    bikes.createBike(
        req.body.ownerID,
        req.body.image,
        req.body.lat, 
        req.body.lon,
        req.body.bikeType,
        req.body.lockCombination,
        )
        .then(bike => {
            res.status(201).json(bike);
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({Error: "Request failed: cannot create bike"});
        });
});


/**
 * Retrive the bikes corresponding to the ID provided in the URL.
 */
app.get('/:_id', (req, res) => {
    const bikeId = req.params._id;
    bikes.findBikeById(bikeId)
        .then(bike => {
            if (bike !== null) {
                res.status(200).json(bike);
            } else {
                res.status(404).json({ Error: "Bike not found" });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ Error: "Cannot find bike" });
        });
});

/**
 * Retrieve bikes.
 */
app.get('/', (req, res) => {
    let filter = {};
    bikes.findBikes(filter, "", 0)
        .then(bikes => {
            res.status(200).json(bikes);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ Error: "Request failed: cannot find bikes" });
        });
});

/**
 * Update the bike whose id is provided in the path parameter and set
 * its attributes to the values provided in the body.
 */
app.put('/:_id', (req, res) => {
    bikes.updateBike(
        req.params._id, req.body.ownerID, req.body.userID, req.body.image,
        req.body.lat, req.body.lon, req.body.bikeType, req.body.timeOut,
        req.body.totalStars, req.body.lockCombination,
        req.body.timesUsed, req.body.outOfService, req.body.missing,
        req.body.badPW, req.body.noLock, req.body.gearIssue,
        req.body.flatTire, req.body.structuralDamage)
        .then(numUpdated => {
            if (numUpdated === 1) {
                res.status(200).json({
                    _id: req.params._id,
                    ownerID: req.body.ownerID,
                    userID: req.body.userID,
                    image: req.body.image,
                    lat: req.body.lat,
                    lon: req.body.lon, 
                    bikeType: req.body.bikeType,
                    timeOut: req.body.timeOut,
                    totalStars: req.body.totalStars,
                    lockCombination: req.body.lockCombination,
                    timesUsed: req.body.timesUsed,
                    outOfService: req.body.outOfService,
                    missing: req.body.missing, 
                    badPw: req.body.badPW,
                    noLock: req.body.noLock,
                    gearIssue: req.body.gearIssue,
                    flatTire: req.body.flatTire,
                    structuralDamage: req.body.structuralDamage
                })
            } else {
                res.status(404).json({ Error: "Resource not found" });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ Error: "Request failed: cannot update bike" });
        });
});

/**
 * Delete the bike whose id is provided in the query parameters
 */
app.delete('/:_id', (req, res) => {
    bikes.deleteBikeById(req.params._id)
        .then(deletedCount => {
            if (deletedCount === 1) {
                res.status(204).json({ Message: "Successfully deleted!"});
            } else {
                res.status(404).json({ Error: "Resource not found" });
            }
        })    
        .catch(error => {
            console.error(error);
            res.status(500).json({ Error: "Request failed: cannot delete bike" });
        });
});

// exporting routes attached to router
export default app