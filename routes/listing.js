const router = require("express").Router();
const multer = require("multer");
var uniqid = require("uniqid");

const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const Listing = require("../models/Listing");
const User = require("../models/User");
const Host = require("../models/Host");
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
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: "atstaytravel@gmail.com",
      pass: "emqr amor owjl fpax",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

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

    const listingPhotos = req.files;
    let FinalListing;
    if (!listingPhotos) {
      return res.status(400).send("No file uploaded.");
    }

    const listingPhotoPaths = listingPhotos.map((file) => file.path);
    if (type === "Rooms") {
      const rooms = [
        { roomType: "standard", price: singleRoom },
        {
          roomType: "double",
          price: doubleRoom,
        },
        {
          roomType: "deluxe",
          price: deluxeRoom,
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
        pincode,
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
        pincode,
      };
    }

    const newListing = new Listing(FinalListing);

    await newListing.save();

    let amount;
    if (type === "Rooms") {
      const priceArray = [
        { roomType: "standard", price: singleRoom },
        {
          roomType: "double",
          price: doubleRoom,
        },
        {
          roomType: "deluxe",
          price: deluxeRoom,
        },
      ];

      amount = `
         <table style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          <th style="border: 1px solid black; padding: 8px;">Room Type</th>
          <th style="border: 1px solid black; padding: 8px;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${priceArray
          .map(
            (room) => `
          <tr>
            <td style="border: 1px solid black; padding: 8px;">${
              room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)
            }</td>
            <td style="border: 1px solid black; padding: 8px;">${
              room.price
            }</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
      `;
    } else {
      amount = price;
    }

    // Pending Verification Mail
    const adminEmail = "admin.atstay@atraski.com";
    const adminMailOptions = {
      from: "atstaytravel@gmail.com",
      to: adminEmail,
      subject: "Pending Verification",
      html: `<p>Dear Admin,</p>
         <p>A new property has been added and requires verification.</p>

         <p><strong>Property Details:</strong></p>
        <ul>
          <li>Type: ${type}</li>
          <li>Hotel Id: ${hotelId}</li>
          <li>Host Id: ${hostId}</li>
          <li>Property Name: ${title}</li>
        </ul>
        <p><strong>Prices:</strong></p>
        ${amount} 
        `,
    };

    const host = await Host.findOne({
      _id: new mongoose.Types.ObjectId(hostId),
    });
    const hostEmail = host.email;
    const hostName = host.firstName + " " + host.lastName;
    const hostPendingVerificationMailOptions = {
      from: "atstaytravel@gmail.com",
      to: hostEmail,
      subject: "Sent for verification",
      html: `<p>Dear ${hostName},</p>
         <p>Your property has been sent for verification to our team.</p>

         <p><strong>Property Details:</strong></p>
        <ul>
          <li>Type: ${type}</li>
          <li>Hotel Id: ${hotelId}</li>
          <li>Host Id: ${hostId}</li>
          <li>Property Name: ${title}</li>
        </ul>
        <p><strong>Prices:</strong></p>
        ${amount}
        <p>Best regards,<br/>Team AtStay</p>
        `,
    };

    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(hostPendingVerificationMailOptions);

    res.status(200).json(newListing);
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
    const resp = await Listing.find({ verification: true });
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
      listings = await Listing.find({
        category: qCategory,
        verification: true,
      });
    } else {
      listings = await Listing.find({ verification: true });
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
    console.log("search property route hit");

    if (search === "all") {
      listings = await Listing.find({ verification: true });
    } else {
      listings = await Listing.find({
        $and: [
          {
            $or: [
              { category: { $regex: search, $options: "i" } },
              { title: { $regex: search, $options: "i" } },
              { city: { $regex: search, $options: "i" } },
              { type: { $regex: search, $options: "i" } },
            ],
          },
          {
            verification: true,
          },
        ],
      });
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
    // console.log(listingId);
    const listing = await Listing.find({ hotelId: listingId });
    // console.log(listing);
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

router.patch("/updateListing", async (req, res) => {
  try {
    console.log("data form frontend: ", req.body);
    const {
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
      description,
      highlight,
      highlightDesc,
      pincode,
      price,
      standardRoom,
      doubleRoom,
      deluxeRoom,
    } = req.body;
    const resp = await Listing.findOneAndUpdate(
      { hostId, hotelId },
      {
        title,
        category,
        type,
        streetAddress,
        city,
        province,
        country,
        amenities,
        description,
        highlight,
        highlightDesc,
        pincode,
        price,
        rooms: [
          { roomType: "standard", price: standardRoom },
          { roomType: "double", price: doubleRoom },
          { roomType: "deluxe", price: deluxeRoom },
        ],
      },
      { new: true }
    );
    console.log("updated value: ", resp);
    res.json(resp);
  } catch (error) {
    console.log(error);
  }
});

router.get("/getListingsHost/:hostId", async (req, res) => {
  try {
    const { hostId } = req.params;
    const resp = await Listing.find({ hostId });
    res.json(resp);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/:hotelid", async (req, res) => {
  const hotelid = req.params.hotelid;
  try {
    const data = await Listing.findOneAndDelete({ hotelId: hotelid });
    res.json({ msg: "Your Property is deleted successfully" });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
