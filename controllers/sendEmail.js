const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");

// Nodemailer Configuration
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
