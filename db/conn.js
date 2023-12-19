const mongoose = require("mongoose");

async function dbConnect() {
  try {
    await mongoose.connect("mongodb://localhost:27017/getapet");
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { mongoose, dbConnect };
