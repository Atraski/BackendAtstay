const router = require("express").Router();
const multer = require("multer");
const uniqid = require("uniqid");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const Listing = require("../models/Listing");
const User = require("../models/User");
const Host = require("../models/Host");

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/property/"); // Store uploaded files in 'property' folder
  },
  filename: function (req, file, cb) {
    cb(null, uniqid() + file.originalname);
  },
});
const upload = multer({ storage });

/* ✅ CREATE LISTING */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    const hotelId = uniqid();
    const {
      hostId,
      category,
      type,
      streetAddress,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
      singleRoom,
      doubleRoom,
      deluxeRoom,
      pincode,
    } = req.body;

    if (!hostId) return res.status(400).json({ message: "Host ID is required" });

    const listingPhotos = req.files;
    if (!listingPhotos) return res.status(400).json({ message: "No file uploaded" });

    const listingPhotoPaths = listingPhotos.map((file) => file.path);
    let FinalListing;

    if (type === "Rooms") {
      FinalListing = {
        hostId,
        hotelId,
        title,
        category,
        type,
        streetAddress,
        city,
        province,
        country,
        amenities,
        listingPhotoPaths,
        description,
        highlight,
        highlightDesc,
        rooms: [
          { roomType: "standard", price: singleRoom },
          { roomType: "double", price: doubleRoom },
          { roomType: "deluxe", price: deluxeRoom },
        ],
        pincode,
        verification: false,
      };
    } else {
      FinalListing = {
        hostId,
        hotelId,
        title,
        category,
        type,
        streetAddress,
        city,
        province,
        country,
        amenities,
        listingPhotoPaths,
        description,
        highlight,
        highlightDesc,
        price,
        guestCount,
        bedroomCount,
        bedCount,
        bathroomCount,
        pincode,
        verification: false,
      };
    }

    const newListing = new Listing(FinalListing);
    await newListing.save();
    console.log("✅ New Listing Created:", newListing);

    res.status(201).json(newListing);
  } catch (err) {
    console.error("❌ Error Creating Listing:", err);
    res.status(500).json({ message: "Fail to create listing", error: err.message });
  }
});

/* ✅ GET ALL VERIFIED LISTINGS */
router.get("/getALL", async (req, res) => {
  try {
    const listings = await Listing.find({ verification: true });
    console.log("✅ Listings Retrieved:", listings.length);
    res.status(200).json(listings);
  } catch (err) {
    console.error("❌ Error Fetching Listings:", err);
    res.status(500).json({ message: "Fail to fetch listings", error: err.message });
  }
});

/* ✅ GET LISTINGS BY CATEGORY */
router.get("/", async (req, res) => {
  const qCategory = req.query.category;
  try {
    let listings;
    if (qCategory) {
      listings = await Listing.find({ category: qCategory, verification: true });
    } else {
      listings = await Listing.find({ verification: true });
    }
    res.status(200).json(listings);
  } catch (err) {
    console.error("❌ Error Fetching Listings:", err);
    res.status(500).json({ message: "Fail to fetch listings", error: err.message });
  }
});

/* ✅ GET LISTING DETAILS BY ID */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    if (!listingId) return res.status(400).json({ message: "Listing ID is required" });

    const listing = await Listing.findOne({ hotelId: listingId });

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    console.log("✅ Retrieved Listing:", listing);
    res.status(200).json(listing);
  } catch (err) {
    console.error("❌ Error Fetching Listing:", err);
    res.status(500).json({ message: "Fail to fetch listing", error: err.message });
  }
});

/* ✅ UPDATE LISTING */
router.patch("/updateListing", async (req, res) => {
  try {
    const { hostId, hotelId, ...updateFields } = req.body;

    if (!hostId || !hotelId)
      return res.status(400).json({ message: "Both hostId and hotelId are required" });

    const updatedListing = await Listing.findOneAndUpdate(
      { hostId, hotelId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedListing) return res.status(404).json({ message: "Listing not found" });

    console.log("✅ Listing Updated:", updatedListing);
    res.status(200).json(updatedListing);
  } catch (error) {
    console.error("❌ Error Updating Listing:", error);
    res.status(500).json({ message: "Fail to update listing", error: error.message });
  }
});

/* ✅ DELETE LISTING */
router.delete("/:hotelid", async (req, res) => {
  try {
    const { hotelid } = req.params;
    if (!hotelid) return res.status(400).json({ message: "Hotel ID is required" });

    const deletedListing = await Listing.findOneAndDelete({ hotelId: hotelid });

    if (!deletedListing) return res.status(404).json({ message: "Listing not found" });

    console.log("✅ Listing Deleted:", deletedListing);
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("❌ Error Deleting Listing:", error);
    res.status(500).json({ message: "Fail to delete listing", error: error.message });
  }
});

module.exports = router;
