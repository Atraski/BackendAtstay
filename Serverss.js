const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// const FormAtStay = require("./Formatstay");
const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const availabilityRoutes = require("./routes/availability.js");
const roomRoutes = require("./routes/room.js");
const host = require("./routes/host.js");
const ordersController = require("./controllers/order.js");
const formController = require("./controllers/form.js");
const sendingEmailController = require("./controllers/sendEmail.js");

const app = express();

const corsOptions = {
  // origin: "https://astay.in",
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable this if you need to send cookies or HTTP authentication headers
  optionsSuccessStatus: 204,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/api", availabilityRoutes);
app.use("/api", host);
app.use("/api", roomRoutes);

// Orders
app.get("/key", (req, resp) => {
  resp.json({ key: process.env.RAZOR_AP1_KEY });
});

app.post("/Order", ordersController.postOrders);

// Form
app.post("/saveDataToDatabase", formController.postForm);

// Sending Email
app.post("/sendInvoiceByEmail", sendingEmailController.sendEmail);

// Error handling middleware
app.use((error, req, res, next) => {
  console.log(error);
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  return res.status(statusCode).send({ message });
});

const db = process.env.MONGODB_URI;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((then) => {
    console.log("Connected to database");
    app.listen(process.env.PORT);

    // Email after verification
    sendingEmailController.sendVerificationEmail();
  })
  .catch((e) => {
    console.log(e);
  });
