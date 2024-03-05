const mongoose = require("mongoose");

const HostSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    numOfProp: {
      type: Number,
      required: true,
      default: 0,
    },
    property: [
      {
        type: String,
        default: "",
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Host = mongoose.model("Host", HostSchema);
module.exports = Host;
