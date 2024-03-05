const mongoose = require("mongoose");

const AvailabilitySchema = new mongoose.Schema(
  {
    date: {
      type: String,
    },
    hotelId: {
      type: String,
    },
    type: {
      type: String,
    },
    Availability: {
      type: Boolean,
      default: false,
    },
    rooms: [
      {
        roomType: {
          type: String,
          // required: true,
        },
        max: {
          type: Number,
          // required: true,
        },
        booked: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

const Availability = mongoose.model("Availability", AvailabilitySchema);
module.exports = Availability;
