import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('Email service ready');
  }
});

// Send OTP email
export const sendOTPEmail = async (email, otp, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'SecureAuth AI - Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">SecureAuth AI</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 14px; color: #666;">We detected a login attempt to your SecureAuth account. Use the OTP below to verify it's you:</p>
          
          <div style="background: white; border: 2px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
            <p style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 0;">${otp}</p>
            <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">Valid for 10 minutes</p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            If you didn't attempt this login, please ignore this email and consider changing your password.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
            <p>This is an automated message, please don't reply directly.</p>
            <p>&copy; 2024 SecureAuth AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send security alert email
export const sendSecurityAlertEmail = async (email, userName, alertDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'SecureAuth AI - Security Alert 🚨',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">🚨 Security Alert</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 14px; color: #666;">We detected suspicious activity on your account:</p>
          
          <div style="background: white; border-left: 4px solid #f5576c; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="font-size: 14px; color: #333; margin: 5px 0;"><strong>Alert Type:</strong> ${alertDetails.type}</p>
            <p style="font-size: 14px; color: #333; margin: 5px 0;"><strong>Location:</strong> ${alertDetails.location}</p>
            <p style="font-size: 14px; color: #333; margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p style="font-size: 14px; color: #333; margin: 5px 0;"><strong>Risk Level:</strong> <span style="color: #f5576c; font-weight: bold;">${alertDetails.riskLevel}</span></p>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            If this wasn't you, please secure your account immediately by changing your password.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
            <p>This is an automated message, please don't reply directly.</p>
            <p>&copy; 2024 SecureAuth AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Alert email sent successfully' };
  } catch (error) {
    console.error('Error sending alert email:', error);
    return { success: false, error: error.message };
  }
};

// Send email verification
export const sendVerificationEmail = async (email, userName, verificationLink) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'SecureAuth AI - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">SecureAuth AI</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 14px; color: #666;">Welcome to SecureAuth! Please verify your email address to complete your registration.</p>
          
          <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">
            Verify Email Address
          </a>
          
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            If the button above doesn't work, copy and paste this link in your browser:
          </p>
          <p style="font-size: 12px; color: #667eea; word-break: break-all;">${verificationLink}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
            <p>This link will expire in 24 hours.</p>
            <p>&copy; 2024 SecureAuth AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

export default transporter;
