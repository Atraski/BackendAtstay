const express = require('express');

const Razorpay = require("razorpay");
 const instance = new Razorpay({
    key_id: 'rzp_test_OmCfFJhnp3Fztn',
    key_secret:'wyTuLIkM1pDzjPnYg9E3NV6E',
  });
module.exports=instance;