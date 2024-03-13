const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Host = require("../models/Host");

// Assuming you have imported necessary dependencies and models

// Apply express.json() middleware to parse JSON request bodies
router.use(express.json());

router.post("/Registerhosts", async (req, res) => {
  try {
    const { firstName, lastName, email, password, contact } = req.body;

    // Check if any required fields are missing
    if (!firstName || !lastName || !email || !password || !contact) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is already registered
    const existingUser = await Host.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new host
    const host = new Host({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contact,
    });

    // Save the host to the database
    await host.save();

    // Respond with success message
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // Handle any errors
    console.error("Registration failed:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

/* For getting host info for listing Details page */
router.post("/hostInfo", async (req, res) => {
  try {
    const { id } = req.body;
    const host = await Host.findById({ _id: id });
    console.log("hostInfo route");
    const { _id, firstName, lastName, email, contact } = host;
    res.json({ _id, firstName, lastName, email, contact });

    console.log(host);
  } catch (error) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/hostLogin", async (req, res) => {
  try {
    /* Take the infomation from the form */
    const { email, password } = req.body;
    console.log(req.body);

    /* Check if user exists */
    const user = await Host.findOne({ email });
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
    const temp = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contact: user.contact,
      numOfProp: user.numOfProp,
      property: user.property,
      verified: user.verified,
    };
    res.status(200).json({ token, user: temp });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all hosts
router.get("/hosts", async (req, res) => {
  try {
    const hosts = await Host.find();
    res.json(hosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single host by ID
router.get("/hosts/:id", async (req, res) => {
  try {
    const host = await Host.findById(req.params.id);
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    res.json(host);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a host by ID
router.put("/hosts/:id", async (req, res) => {
  try {
    const host = await Host.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    res.json(host);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a host by ID
router.delete("/hosts/:id", async (req, res) => {
  try {
    const host = await Host.findByIdAndDelete(req.params.id);
    if (!host) {
      return res.status(404).json({ message: "Host not found" });
    }
    res.json({ message: "Host deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/testhost", async (req, res) => {
  try {
    res.json({ msg: "route is working" });
  } catch (error) {
    res.json({ error: error.message });
    console.log(error);
  }
});
module.exports = router;
