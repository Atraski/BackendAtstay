const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema(
  {
    // store host email
    hostId: {
      type: String,
      required: true,
    },
    // providing custom unique hotel id
    hotelId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    // which category does it falls in like hilly, beach etc.
    category: {
      type: String,
      required: true,
      Default: "rooms",
    },
    // what it provides rooms, entire space, shared room. Currently moving with rooms
    type: {
      type: String,
      required: true,
    },
    // provides complete address
    streetAddress: {
      type: String,
      required: true,
    },
    // aptSuite: {
    //   type: String,
    //   required: true,
    // },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },

    amenities: {
      type: Array,
      default: [],
    },
    listingPhotoPaths: [{ type: String }],

    description: {
      type: String,
      required: true,
    },
    highlight: {
      type: String,
      required: true,
    },
    highlightDesc: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },

    // For type="Rooms" only
    rooms: [
      {
        roomType: String,
        price: Number,
      },
    ],

    // For type="An entire place" only
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },

    guestCount: {
      type: Number,
      default: 0,
    },
    bedroomCount: {
      type: Number,
      default: 0,
    },
    bedCount: {
      type: Number,
      default: 0,
    },
    bathroomCount: {
      type: Number,
      default: 0,
    },
    verification: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", ListingSchema, "listings"); // Explicit collection name
module.exports = Listing;

