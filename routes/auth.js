const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
var uniqid = require("uniqid");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Host = require("../models/Host");

const clientUrl = "http://localhost:3000";

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, uniqid() + file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

/* USER REGISTER */
router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    /* Take all information from the form */
    const { firstName, lastName, email, password, contact } = req.body;

    /* The uploaded file is available as req.file */
    const profileImage = req.file;

    if (!profileImage) {
      return res.status(400).send("No file uploaded");
    }

    /* path to the uploaded profile photo */
    const profileImagePath = profileImage.path;

    /* Check if user exists */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    /* Hass the password */
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    /* Create a new User */
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImagePath,
      contact,
    });

    /* Save the new User */
    await newUser.save();

    /* Send a successful message */
    res
      .status(200)
      .json({ message: "User registered successfully!", user: newUser });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Registration failed!", error: err.message });
  }
});

/* USER LOGIN*/
router.post("/login", async (req, res) => {
  try {
    /* Take the infomation from the form */
    const { email, password } = req.body;
    console.log(req.body);

    /* Check if user exists */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(409).json({ message: "User doesn't exist!" });
    }

    /* Compare the password with the hashed password */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials!" });
    }

    /* Generate JWT token */
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    const temp = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImagePath: user.profileImagePath,
      tripList: user.tripList,
      wishList: user.wishList,
      propertyList: user.propertyList,
      reservationList: user.reservationList,
      contact: user.contact,
    };
    res.status(200).json({ token, user: temp });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Reset Password
router.post("/reset", async (req, res, next) => {
  const { email, type } = req.body;

  try {
    // Nodemailer Config
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

    let token;

    let user;
    if (type === "user") {
      user = await User.findOne({ email });

      if (!user) {
        const error = new Error("Email not found!");
        error.statusCode = 404;
        throw error;
      }
      // Creating the token
      token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30m",
      });
    }

    let host;
    if (type === "host") {
      host = await Host.findOne({ email });

      if (!host) {
        const error = new Error("Email not found!");
        error.statusCode = 404;
        throw error;
      }
      // Creating the token
      token = jwt.sign({ id: host._id }, process.env.JWT_SECRET, {
        expiresIn: "30m",
      });
    }

    const resetLink = `${clientUrl}/reset/${token}?type=${type}`;

    const options = {
      from: "atstaytravel@gmail.com",
      to: email,
      subject: "Reset Password",
      text: `Click the link- ${resetLink} to reset your password.`,
    };

    // Send the email
    const mailResponse = await transporter.sendMail(options);
    console.log("Email sent:", mailResponse.response);

    res.status(200).send({ message: `Email sent successfully! - ${type}` });
  } catch (err) {
    next(err);
  }
});

router.post("/new-password", async (req, res, next) => {
  const { resetToken, password, confirmPassword, type } = req.body;

  console.log("Type", type);

  try {
    const decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET);

    let user;
    if (type === "user") {
      user = await User.findOne({ _id: decodedToken.id });

      if (!user) {
        const error = new Error("User not found!");
        error.statusCode(404);
        throw error;
      }
    }

    let host;
    if (type === "host") {
      host = await Host.findOne({ _id: decodedToken.id });

      if (!host) {
        const error = new Error("Host not found!");
        error.statusCode(404);
        throw error;
      }
    }

    if (password.trim() !== confirmPassword.trim()) {
      const error = new Error("Passwords should match!");
      error.statusCode(401);
      throw error;
    }

    if (type === "user") {
      user.password = await bcrypt.hash(password, 12);

      await user.save();
    }

    if (type === "host") {
      host.password = await bcrypt.hash(password, 12);

      await host.save();
    }

    res.status(200).send({ message: "Reset successful" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      err.message = "Token expired.";
      next(err);
    }

    next(err);
  }
});
