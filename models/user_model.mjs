import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  username: String,
  canRepair: Boolean,
  banned: Boolean,
  privilege: String,
  token: String
});

userSchema.pre("save", async function (next) {
  // when a user gets saved
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});
// checks if it matches a bcrypt hash when logging in
userSchema.methods.isValidPassword = async function (password) {
  // console.log("hello valid method")
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

//createUser()
/**
 * Create a User
 * @param {String} userID
 * @param {String} username
 * @param {String} password
 * @param {Boolean} canRepair
 * @param {Boolean} banned
 * @param {String} privilege
 * @returns A promise. Resolves to the JSON object for the document created by calling save
 */
const createUser = async (userID, username, password, canRepair, banned, privilege, token) => {
  const user = new User({
    userID: userID,
    username: username,
    password: password,
    canRepair: canRepair,
    banned: banned,
    privilege: privilege,
    token: token
  });
  return user.save();
};

//findUsers
/**
 * Retrieves all the bikes, since the filter passed is empty
 * @param {Object} filter
 * @param {String} projection (not specified)
 * @param {Number} limit (not specified)
 * @returns
 */
const findUsers = async (filter) => {
  const query = User.find(filter);
  return query.exec();
};

//findUserById - verified it works
/**
 * Retrieves the user based on the filter, which is the _id passed
 * @param {Object} filter
 * @param {String} projection (not specified)
 * @param {Number} limit (not specified)
 * @returns
 */
const findUserById = async (id) => {
  const query = User.findById(id);
  return query.exec();
};

/**
 *
 * @param {Object} obj
 * @returns a boolean value denoting whether a JSON object is empty or not
 */
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

//updateUser
/**
 * updates a user in the database
 * MUST ENSURE THAT THE OTHER PROPERTIES ARE RETURNED AS WELL, INTACT !!!!
 * @param {Object} conditions (an object containing a user's _id)
 * @param {Object} update (the parameters entered by the user in the query that they want to update)
 * @param {Number} options (None)
 * @returns A promise. Resolves to the number of documents modified
 */
const updateUser = async (_id, userID, username, canRepair, banned, privilege, token) => {
  const conditions = { _id: _id };
  const update = {
    _id: _id,
    userID: userID,
    username: username,
    canRepair: canRepair,
    banned: banned,
    privilege: privilege,
    token: token
  };
  const result = await User.findOneAndUpdate(conditions, update);
  if (isEmpty(conditions)) {
    return 0;
  } else {
    return 1;
  }
};

//deleteById
/**
 * Delete the user given the _id
 * @param {Object} input (represents all the parameters entered in the query)
 * @returns A promise. Resolves to the count of deleted documents
 */
const deleteUserById = async (_id) => {
  const result = await User.deleteOne({ _id: _id });
  return result.deletedCount;
};

export { deleteUserById, updateUser, findUsers, findUserById, createUser };
