var instance = require("../Razorpay");

exports.postOrders = async (req, resp, next) => {
  try {
    const { amount } = req.body;
    console.log(amount);
    const option = {
      amount: Number(amount * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(option);

    resp.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
