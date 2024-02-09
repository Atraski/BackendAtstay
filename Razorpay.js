const express = require("express");
require("dotenv").config({ path: "./.env" });
const Razorpay = require("razorpay");
const instance = new Razorpay({
  key_id: process.env.RAZOR_AP1_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});
module.exports = instance;
