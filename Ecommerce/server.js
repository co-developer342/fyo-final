import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDb from './Config/db.js';
import authRoute from './routes/authRoute.js';
import categoryRoutes from './routes/categoryRoutes.js'; 
import productRoutes from './routes/productRoute.js';
import cors from 'cors';
import nodemailer from 'nodemailer'; // Import nodemailer

dotenv.config();

const app = express();

// Database configuration
connectDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/product', productRoutes);

// Rest API
app.get('/', (req, res) => {
  res.send('Hello');
});

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025, // MailHog's default SMTP port
  secure: false,
});

// Function to send email
const sendContactEmail = (senderName, subject, senderEmail, message) => {
  const mailOptions = {
    from: `"${senderName}" <${senderEmail}>`,
    to: 'bilal34200gcu@gmail.com', // Your email (receiver)
    subject: `${subject} from ${senderName}`,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
};

// Example route to handle form submission
app.post('/api/v1/contact', async (req, res) => {
  const { name, subject, email, message } = req.body;
  console.log(subject);
  sendContactEmail(name, subject, email, message);

  return res.status(200).json({ message: 'Your message has been sent successfully!' });
});

// PORT
const PORT = 8080;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.DEV_MODE} mode at ${PORT}`.bgCyan.white);
});
