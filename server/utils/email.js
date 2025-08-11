const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Rental Management System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Welcome to Rental Management System!</h2>
      <p>Hello ${user.firstName},</p>
      <p>Thank you for registering with our rental management system. Your account has been created successfully.</p>
      <p>You can now:</p>
      <ul>
        <li>Browse our product catalog</li>
        <li>Create rental requests</li>
        <li>Manage your profile</li>
        <li>Track your rentals</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Rental Management Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetUrl) => {
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Password Reset Request</h2>
      <p>Hello ${user.firstName},</p>
      <p>You requested a password reset for your account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="padding: 12px 24px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Rental Management Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html });
};

// Send email verification email
const sendEmailVerificationEmail = async (user, verificationUrl) => {
  const subject = 'Verify Your Email Address';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Verify Your Email Address</h2>
      <p>Hello ${user.firstName},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="padding: 12px 24px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
      </div>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>Best regards,<br>The Rental Management Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail
}; 