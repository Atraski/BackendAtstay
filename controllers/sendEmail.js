const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Host = require("../models/Host");
const Listing = require("../models/Listing");

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


exports.sendEmail = async (req, res, next) => {
  try {
    const { clientEmail, invoiceHTML, hostEmail } = req.body;
    console.log(req.body);

    const generatePDF = async (htmlContent) => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Set the HTML content
      await page.setContent(htmlContent);

      // Generate PDF from the HTML content
      const pdfBuffer = await page.pdf();

      await browser.close();

      return pdfBuffer;
    };

    const pdfBuffer = await generatePDF(invoiceHTML);

    // Create Nodemailer email options
    const clientMailOptions = {
      from: "atstaytravel@gmail.com",
      to: clientEmail,
      subject: "Invoice",
      text: "Your payment is Successful thankyou for your reservation ",
      attachments: [
        {
          filename: "Invoice.pdf",
          content: pdfBuffer,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    };

    // Send the email
    const info = await transporter.sendMail(clientMailOptions);
    console.log("Email sent:", info.response);

    // sending mail to host
    const hostMailOptions = {
      from: "atstaytravel@gmail.com",
      to: hostEmail,
      subject: "Booking Invoice",
      text: "There is a new Booking for your property",
      attachments: [
        {
          filename: "Invoice.pdf",
          content: pdfBuffer,
          encoding: "base64",
        },
      ],
    };
    const infoHost = await transporter.sendMail(hostMailOptions);
    console.log("Email sent:", infoHost.response);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.sendVerificationEmail = async (req, res) => {
  const verificationChange = Listing.watch();

  verificationChange.on("change", async (change) => {
    if (
      change.operationType === "update" &&
      change.updateDescription.updatedFields.verification === true
    ) {
      const listingId = change.documentKey._id;

      const listing = await Listing.findOne({ _id: listingId });

      const propertyName = listing.title;

      const hostId = listing.hostId;
      const host = await Host.findOne({
        _id: new mongoose.Types.ObjectId(hostId),
      });
      const hostName = host.firstName + " " + host.lastName;
      const hostEmail = host.email;

      // Property Verified mail
      const hostPropertyVerifiedMailOptions = {
        from: "atstaytravel@gmail.com",
        to: hostEmail,
        subject: "Property Verified",
        html: `<p>Dear ${hostName},</p>
             <p>Your property has been verified.</p>

             <p>We are pleased to inform you that your property "${propertyName}" has been successfully verified and is now live on our site.</p>

             <p>Thank you for listing your property with us.</p>

             <p>https://atstay.in/</p>

            <p>Best regards,<br/>Team AtStay</p>
            `,
      };

      await transporter.sendMail(hostPropertyVerifiedMailOptions);
    }
  });
};
