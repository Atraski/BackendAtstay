const mongoose = require("mongoose");
const User = require("./userModel");
const Listing = require("./listingModel");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  roomType: String,
  quantity: Number,
  checkIn: Date,
  checkOut: Date,
  totalPrice: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }, // Add createdAt field with default value set to current date and time
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
