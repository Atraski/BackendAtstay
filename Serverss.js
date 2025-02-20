const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

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

// ✅ Secure & Configurable CORS Settings
const corsOptions = {
  origin: ["https://atstay.in", "http://localhost:3000"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.get("/", (req, res) => {
  res.send("Welcome to Atstay Backend API! 🚀");
});
  
app.use(cors(corsOptions));
app.use(helmet()); // Security Headers
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // Limit requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ✅ Standardized API Routes */

app.use("/api/auth", authRoutes);
app.use("/api/properties", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/host", host);
app.use("/api/rooms", roomRoutes);

/* ✅ Orders */
app.post("/api/order", ordersController.postOrders);

/* ✅ Form */
app.post("/api/saveDataToDatabase", formController.postForm);

/* ✅ Sending Email */
app.post("/api/sendInvoiceByEmail", sendingEmailController.sendEmail);

/* ✅ Global Error Handling Middleware */
app.use((error, req, res, next) => {
  console.error("❌ Error:", error.message);
  res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
});

/* ✅ Connect to MongoDB & Start Server */
const connectDBAndStartServer = async () => {
  try {
    const dbURI = process.env.MONGODB_URI;

    if (!dbURI) {
      throw new Error("MONGODB_URI is missing in environment variables.");
    }

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Successfully connected to MongoDB.");


    // Start server only after successful DB connection
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

    // ✅ Send email verification after successful DB connection
    sendingEmailController.sendVerificationEmail();

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Stop server if DB connection fails
  }
};

// Call the function to start everything
connectDBAndStartServer();
