const mongoose = require("mongoose");
const Booking = require("./bookingModel");
const Review = require("./reviewModel");

const listingSchema = new mongoose.Schema({
  hotelName: String,
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  rooms: [
    {
      type: String,
      quantity: Number,
      pricePerNight: Number,
    },
  ],
  amenities: [String],
  images: [String],
  host: String,
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

listingSchema.index({ location: "2dsphere" });

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
