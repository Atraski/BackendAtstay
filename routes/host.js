const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Host = require("../models/Host");

// Create a new host
router.post("/Registerhosts", async (req, res) => {
  try {
    /* Take all information from the form */
    const { firstName, lastName, email, password, contact } = req.body;
    console.log("body", req.body);
    const existingUser = await Host.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }
    /* Hass the password */

    const hashedPassword = await bcrypt.hash(password, 10);
    const host = new Host({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contact,
    });
    console.log(host);
    await host.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed!", error: error.message });
    console.log(error);
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
