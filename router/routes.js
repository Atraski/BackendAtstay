const express = require("express");
const router = express.Router();

// User Controller
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");

// Listing Controller
const {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
} = require("../controllers/listingController");

// Booking Controller
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  checkRoomAvailability,
} = require("../controllers/bookingController");

// Review Controller
const {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

// Middleware to display a message when the root route is accessed
router.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Test routes (prefixed with /test)
router.post("/test/users/register", registerUser);
router.post("/test/users/login", loginUser);
router.get("/test/users/profile", getUserProfile);
router.put("/test/users/profile", updateUserProfile);

router.post("/test/listings", createListing);
router.get("/test/listings", getAllListings);
router.get("/test/listings/:id", getListingById);
router.put("/test/listings/:id", updateListing);
router.delete("/test/listings/:id", deleteListing);

router.post("/test/bookings", createBooking);
router.get("/test/bookings", getAllBookings);
router.get("/test/bookings/:id", getBookingById);
router.put("/test/bookings/:id", updateBooking);
router.delete("/test/bookings/:id", deleteBooking);
router.post("/test/bookings/checkAvailability", checkRoomAvailability);

router.post("/test/reviews", createReview);
router.get("/test/reviews", getAllReviews);
router.get("/test/reviews/:id", getReviewById);
router.put("/test/reviews/:id", updateReview);
router.delete("/test/reviews/:id", deleteReview);

module.exports = router;
