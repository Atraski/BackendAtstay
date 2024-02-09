const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  name: String,
  dateJoined: { type: Date, default: Date.now },
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
