const router = require("express").Router();

const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");

/* GET TRIP LIST */
router.get("/:userId/trips", async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Booking.find({ customerId: userId }).populate(
      "customerId hostId hotelId"
    );
    res.status(202).json(trips);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find trips!", error: err.message });
  }
});

/* ADD LISTING TO WISHLIST */
router.patch("/:userId/:listingId", async (req, res) => {
  try {
    const { userId, listingId } = req.params;
    console.log("adding to wishlish route hit", userId, listingId);
    const user = await User.findById(userId);
    // const listing = await Listing.findById(listingId).populate("creator");

    const favoriteListing = user.wishList.find(
      (item) => item.toString() === listingId
    );
    console.log("favoriteListing", favoriteListing);

    if (favoriteListing) {
      user.wishList = user.wishList.filter(
        (item) => item.toString() !== listingId
      );
      const resp = await user.save();
      console.log(resp);
      res.status(200).json({
        message: "Listing is removed from wish list",
        wishList: user.wishList,
      });
    } else {
      console.log("else part executed");
      user.wishList.push(listingId);
      const resp = await user.save();
      console.log(resp);
      res.status(200).json({
        message: "Listing is added to wish list",
        wishList: resp.wishList,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: err.message });
  }
});

// get all wishlist updated at login time
router.get("/:userId/getAllWishlist", async (req, res) => {
  try {
    console.log("get all wishlist");
    const { userId } = req.params;
    const user = await User.findById(userId);
    console.log(user);
    res.status(200).json({
      message: "Listing is added to wish list",
      wishList: user.wishList,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: err.message });
  }
});

/* GET PROPERTY LIST */
router.get("/:userId/properties", async (req, res) => {
  try {
    const { userId } = req.params;
    const properties = await Listing.find({ creator: userId }).populate(
      "creator"
    );
    res.status(202).json(properties);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find properties!", error: err.message });
  }
});

/* GET RESERVATION LIST */
router.get("/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Booking.find({ hostId: userId }).populate(
      "customerId hostId listingId"
    );
    res.status(202).json(reservations);
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .json({ message: "Can not find reservations!", error: err.message });
  }
});

module.exports = router;
