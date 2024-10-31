// emailHelper.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
        user: "gadonchristian01@gmail.com", // Email address you’ll send from
        pass:  "cgg"  // Email password or app password
    }
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };
    await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
