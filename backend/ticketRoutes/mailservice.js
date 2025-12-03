import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


// Configure the mail transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email provider's SMTP service
    auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASSWORD // Your email password
    },
    secure : false,
});

/**
 * Sends an email notification.
 * 
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} message - Email body content.
 */
const sendMail = async (to, subject, message) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to,
            subject,
            text: message
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error.message);
    }
};


export default sendMail;