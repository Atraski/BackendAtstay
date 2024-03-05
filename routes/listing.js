const router = require("express").Router();
const multer = require("multer");
var uniqid = require("uniqid");

const Listing = require("../models/Listing");
const User = require("../models/User");
var uniqid = require("uniqid");

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/property/"); // Store uploaded files in the 'property' folder
  },
  filename: function (req, file, cb) {
    cb(null, uniqid() + file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

/* CREATE LISTING */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    /* Take the information from the form */
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
      deluxRoom,
    } = req.body;
    // console.log(req.body);
    // console.log(req.body.rooms);
    const listingPhotos = req.files;
    let FinalListing;
    if (!listingPhotos) {
      return res.status(400).send("No file uploaded.");
    }

    const listingPhotoPaths = listingPhotos.map((file) => file.path);
    if (type === "Rooms") {
      const rooms = [
        { roomType: "single", price: singleRoom },
        {
          roomType: "double",
          price: doubleRoom,
        },
        {
          roomType: "delux",
          price: deluxRoom,
        },
      ];
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
        rooms,
      };
    } else if (type === "An entire place") {
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
      };
    }
    console.log(FinalListing);

    const newListing = new Listing(FinalListing);

    await newListing.save();
    res.json({ data: newListing });
    // res.status(200).json(newListing);
  } catch (err) {
    res
      .status(409)
      .json({ message: "Fail to create Listing", error: err.message });
    console.log(err);
  }
});

// get all listings
router.get("/getALL", async (req, res) => {
  try {
    const resp = await Listing.find({});
    res.status(200).json(resp);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Fail to fetch listings", error: err.message });
    console.log(err);
  }
});

/* GET lISTINGS BY CATEGORY */
router.get("/", async (req, res) => {
  const qCategory = req.query.category;

  try {
    let listings;
    if (qCategory) {
      listings = await Listing.find({ category: qCategory }).populate(
        "creator"
      );
    } else {
      listings = await Listing.find().populate("creator");
    }

    res.status(200).json(listings);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Fail to fetch listings", error: err.message });
    console.log(err);
  }
});

/* GET LISTINGS BY SEARCH */
router.get("/search/:search", async (req, res) => {
  const { search } = req.params;

  try {
    let listings = [];

    if (search === "all") {
      listings = await Listing.find().populate("creator");
    } else {
      listings = await Listing.find({
        $or: [
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
      }).populate("creator");
    }

    res.status(200).json(listings);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Fail to fetch listings", error: err.message });
    console.log(err);
  }
});

/* LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.find({ hotelId: listingId });
    console.log(listing);
    res.status(202).json(listing);
  } catch (err) {
    res
      .status(404)
      .json({ message: "Listing can not found!", error: err.message });
  }
});

router.post("/createListing", async (req, res) => {
  try {
    console.log(req.body);
    const {
      hostId,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotoPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price,
      rooms,
    } = req.body;

    const hotelId = uniqid();
    const listing = new Listing({
      hostId,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotoPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price,
      rooms,
      hotelId,
    });
    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
