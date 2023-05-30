import mongoose from 'mongoose';

const bikeSchema = new mongoose.Schema({
  ownerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    foreignField: '_id'
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    foreignField: '_id'
  },
  image: String,
  lat: mongoose.Schema.Types.Decimal128,
  lon: mongoose.Schema.Types.Decimal128,
  bikeType: String,
  timeOut: String,
  totalStars: Number,
  lockCombination: Number, // maybe should be a string
  timesUsed: Number,
  outOfService: Boolean,
  missing: Boolean,
  badPW: Boolean,
  noLock: Boolean,
  gearIssue: Boolean,
  flatTire: Boolean,
  structuralDamage: Boolean


}, { timestamps: true });

const Bike = mongoose.model('Bike', bikeSchema);

//createBike()
/**
 * Create a bike
 * @param {ObjectId} ownerID
 * @param {ObjectId} userID
 * @param {String} image
 * @param {Decimal128} lat
 * @param {Decimal128} lon
 * @param {String} bikeType
 * @param {String} timeOut
 * @param {Number} totalStars
 * @param {Number} lockCombination
 * @param {Number} timesUsed
 * @param {Boolean} outOfService
 * @param {Boolean} missing
 * @param {Boolean} badPW
 * @param {Boolean} noLock
 * @param {Boolean} gearIssue
 * @param {Boolean} flatTire
 * @param {Boolean} structuralDamage
 * @returns A promise. Resolves to the JSON object for the document created by calling save
 */
const createBike = async (ownerID, image, lat, lon, 
  bikeType, lockCombination) => {
  const bike = new Bike({ 
    ownerID: ownerID,
    userID: null,
    image: image,
    lat: lat,
    lon: lon, 
    bikeType: bikeType,
    timeOut: 0,
    totalStars: 0,
    lockCombination: lockCombination,
    timesUsed: 0,
    outOfService: false,
    missing: false, 
    badPw: false,
    noLock: false,
    gearIssue: false,
    flatTire: false,
    structuralDamage: false
   });
  return bike.save();
}

//findBikes
/**
* Retrieves all the bikes, since the filter passed is empty
* @param {Object} filter 
* @param {String} projection (not specified)
* @param {Number} limit (not specified)
* @returns 
*/
const findBikes = async (filter) => {
  const query = Bike.find(filter);
  return query.exec();
}

//findBikeById
/**
* Retrieves the bike based on the filter, which is the _id passed
* @param {Object} filter 
* @param {String} projection (not specified)
* @param {Number} limit (not specified)
* @returns 
*/
const findBikeById = async (id) => {
  const query = Bike.findById(id);
  return query.exec();
}

/**
* 
* @param {Object} obj 
* @returns a boolean value denoting whether a JSON object is empty or not
*/
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

//updateBike
/**
* updates a bike in the database
* MUST ENSURE THAT THE OTHER PROPERTIES ARE RETURNED AS WELL, INTACT !!!!
* @param {Object} conditions (an object containing a bike's _id)
* @param {Object} update (the parameters entered by the user in the query that they want to update)
* @param {Number} options (None) 
* @returns A promise. Resolves to the number of documents modified
*/
const updateBike = async (_id, ownerID, userID, image, lat, lon, 
  bikeType, timeOut, totalStars, lockCombination, timesUsed, outOfService, missing, badPW, noLock,
  gearIssue, flatTire, structuralDamage ) => { 
  const conditions = {_id: _id};
  const update = { 
      _id: _id,
      ownerID: ownerID,
      userID: userID,
      image: image,
      lat: lat,
      lon: lon, 
      bikeType: bikeType,
      timeOut: timeOut,
      totalStars: totalStars,
      lockCombination: lockCombination,
      timesUsed: timesUsed,
      outOfService: outOfService,
      missing: missing, 
      badPw: badPW,
      noLock: noLock,
      gearIssue: gearIssue,
      flatTire: flatTire,
      structuralDamage: structuralDamage
  };
  const result = await Bike.findOneAndUpdate(conditions, update)
  if (isEmpty(conditions)){
      return 0;
  }
  else {
      return 1;
  }
}

//deleteBikeById
/**
* Delete the bike given the _id
* @param {Object} input (represents all the parameters entered in the query)
* @returns A promise. Resolves to the count of deleted documents
*/
const deleteBikeById = async (_id) => {
  const result = await Bike.deleteOne({_id: _id});
  return result.deletedCount;
}

export { deleteBikeById, updateBike, findBikes, findBikeById, createBike};