const OTP = require('../model/otpModel');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { requestOtp, confirmOtp } = require('../utils/soapOtpWithFallback');
const generateOTP = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

const sendOTPController = asyncHandler(async ({ identifier, deliveryMethod }) => {
  console.log("sendOTPController input:", { identifier, deliveryMethod });

  if (!identifier || !deliveryMethod) {
    throw new ApiError(400, 'Identifier and delivery method are required');
  }
  if (!['sms', 'email'].includes(deliveryMethod)) {
    throw new ApiError(400, 'Invalid delivery method. Use "sms" or "email"');
  }

  // Delete previous OTPs/tokens for this identifier
  const query =
    deliveryMethod === 'sms' ? { mobileNumber: identifier } : { email: identifier };
  await OTP.deleteMany(query);

  let token;
  let message;

  if (deliveryMethod === 'sms') {
    console.log("Sending SMS OTP to:", identifier);
    try {
      const result = await requestOtp(identifier);
      if (!result.success) {
        console.log("SMS OTP request failed:", result.message);
        throw new ApiError(400, result.message);
      }
      token = result.token;
      message = result.message;
    } catch (error) {
      console.log("SMS OTP failed, checking for email fallback...", error.message);
      
      // If SMS fails and fallback is enabled, suggest email instead
      if (process.env.ENABLE_SMS_FALLBACK_TO_EMAIL === 'true') {
        throw new ApiError(503, 'SMS service temporarily unavailable. Please use email OTP instead.', {
          suggestedFallback: 'email',
          originalError: error.message
        });
      }
      
      throw error;
    }
  } else {
    const otp = generateOTP();
    console.log("Sending email OTP:", { to: identifier, otp });
    try {
      await sendEmail({
        to: identifier,
        subject: 'Your OTP Code - Rest NTC',
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #333;">Your OTP Code</h2>
            <p>Your OTP code is:</p>
            <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 10px; background: #f8f9fa; text-align: center; border-radius: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });
      token = otp;
      message = 'OTP sent successfully via email';
    } catch (error) {
      console.error("Email send error:", error);
      throw new ApiError(500, 'Failed to send OTP email');
    }
  }

  // Store OTP/token in MongoDB
  console.log("Storing OTP record:", { identifier, token: token.substring(0, 10) + '...', deliveryMethod });
  const otpRecord = await OTP.create({
    [deliveryMethod === 'sms' ? 'mobileNumber' : 'email']: identifier,
    token,
    deliveryMethod,
    expiry: new Date(Date.now() + 5 * 60 * 1000), // Explicit 5-minute expiry
  });
  console.log("OTP record stored with ID:", otpRecord._id);

  return {
    token,
    identifier,
    deliveryMethod,
    message,
  };
});

const verifyOTPController = asyncHandler(async ({ token, otp, deliveryMethod }) => {
  console.log("verifyOTPController input:", { 
    token: token?.substring(0, 10) + '...', 
    otp: otp?.substring(0, 2) + '***', 
    deliveryMethod 
  });

  if (!token || !otp || !deliveryMethod) {
    throw new ApiError(400, 'Token, OTP, and delivery method are required');
  }
  if (!['sms', 'email'].includes(deliveryMethod)) {
    throw new ApiError(400, 'Invalid delivery method. Use "sms" or "email"');
  }

  // Find OTP/token record
  const otpRecord = await OTP.findOne({ token, deliveryMethod });
  if (!otpRecord) {
    console.log("No OTP record found:", { deliveryMethod });
    throw new ApiError(404, 'Token/OTP not found or expired');
  }

  let identifier;
  let message;

  if (deliveryMethod === 'sms') {
    console.log("Verifying SMS OTP");
    try {
      const result = await confirmOtp(token, otp);
      if (!result.success) {
        console.log("SMS OTP verification failed:", result.message);
        await OTP.findByIdAndDelete(otpRecord._id);
        throw new ApiError(400, result.message);
      }
      identifier = result.mdn;
      message = result.message;
    } catch (error) {
      console.log("SMS OTP verification error:", error.message);
      await OTP.findByIdAndDelete(otpRecord._id);
      throw error;
    }
  } else {
    console.log("Verifying email OTP");
    if (otpRecord.token !== otp) {
      await OTP.findByIdAndDelete(otpRecord._id);
      throw new ApiError(400, 'Invalid OTP');
    }
    if (otpRecord.expiry < new Date()) {
      await OTP.findByIdAndDelete(otpRecord._id);
      throw new ApiError(400, 'OTP has expired');
    }
    identifier = otpRecord.email;
    message = 'OTP verified successfully';
  }

  // Delete OTP/token after successful verification
  await OTP.findByIdAndDelete(otpRecord._id);

  return {
    identifier,
    deliveryMethod,
    message,
  };
});

// Utility function to check service status
const checkOTPServiceStatus = asyncHandler(async (req, res) => {
  const { requestOtp: testRequestOtp } = require('../utils/soapOtpWithFallback');
  
  const status = {
    sms: { available: false, message: '' },
    email: { available: true, message: 'Email service is operational' },
    environment: process.env.NODE_ENV || 'development',
    fallbackEnabled: process.env.ENABLE_SMS_FALLBACK_TO_EMAIL === 'true'
  };

  // Test SMS service
  try {
    // Just test connectivity without actually sending OTP
    const soap = require('soap');
    await soap.createClientAsync(process.env.NTC_WSDL_URL, { timeout: 5000 });
    status.sms.available = true;
    status.sms.message = 'SMS service is operational';
  } catch (error) {
    status.sms.available = false;
    status.sms.message = `SMS service unavailable: ${error.code || error.message}`;
  }

  return res.json({
    success: true,
    data: status,
    message: 'OTP service status retrieved successfully'
  });
});

module.exports = { 
  sendOTPController, 
  verifyOTPController, 
  checkOTPServiceStatus 
};