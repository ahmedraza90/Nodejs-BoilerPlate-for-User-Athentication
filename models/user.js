const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 20,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 20,
    },
    emailVerifyToken: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetVerifyToken: {
      type: String,
      default: null,
    },
  },
  { 
    timestamps: true,
    strict: true, 
    strictQuery: false
  }
);

module.exports = mongoose.model("user", userSchema);

//https://mongoosejs.com/docs/2.7.x/docs/schema-options.html
//https://mongoosejs.com/docs/guide.html#strictQuery