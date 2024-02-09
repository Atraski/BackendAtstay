const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  rating: Number,
  comment: String,
  datePosted: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
