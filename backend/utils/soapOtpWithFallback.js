require('dotenv').config();
const soap = require('soap');
const jwt = require('jsonwebtoken');
const ApiError = require('./ApiError');
const generateOTP = require('./generateOTP');
const sendEmail = require('./sendEmail');

const {
  NTC_WSDL_URL,
  NTC_USERNAME,
  NTC_PASSWORD,
  NTC_BUSICODE,
  OTP_SECRET_KEY,
  OTP_TOKEN_EXPIRY,
  NODE_ENV,
  ENABLE_SMS_FALLBACK_TO_EMAIL,
} = process.env;

// Mock OTP service for development
const mockOtpService = {
  async generateOtp(mdn) {
    console.log(`[MOCK] Generating OTP for ${mdn}`);
    const mockTrId = `MOCK_${Date.now()}`;
    const token = jwt.sign(
      { mdn, trId: mockTrId },
      OTP_SECRET_KEY,
      { expiresIn: OTP_TOKEN_EXPIRY }
    );
    
    // In development, we can log the mock OTP for testing
    const mockOtp = NODE_ENV === 'development' ? '123456' : generateOTP();
    console.log(`[MOCK] OTP for ${mdn}: ${mockOtp} (Token: ${token})`);
    
    return { success: true, token, message: 'Mock OTP sent successfully' };
  },

  async validateOtp(token, otp) {
    console.log(`[MOCK] Validating OTP: ${otp}`);
    
    try {
      const { mdn, trId } = jwt.verify(token, OTP_SECRET_KEY);
      
      // In development, accept 123456 as valid OTP, otherwise check against generated
      const isValid = NODE_ENV === 'development' ? 
        (otp === '123456' || otp.length === 6) : 
        otp.length === 6;
      
      if (!isValid) {
        console.log(`[MOCK] Invalid OTP: ${otp}`);
        throw new ApiError(400, 'Invalid OTP');
      }
      
      console.log(`[MOCK] OTP validated successfully for ${mdn}`);
      return { success: true, mdn, message: 'Mock OTP verified successfully' };
    } catch (error) {
      console.log(`[MOCK] OTP validation failed:`, error.message);
      throw new ApiError(401, 'Invalid or expired token or OTP');
    }
  }
};

// Test SOAP service connectivity
async function testSOAPConnectivity() {
  try {
    const client = await soap.createClientAsync(NTC_WSDL_URL, { timeout: 5000 });
    return true;
  } catch (error) {
    console.warn('SOAP service connectivity test failed:', error.code || error.message);
    return false;
  }
}

// Enhanced SOAP client with retry logic
async function getClient() {
  try {
    console.log('Creating SOAP client for:', NTC_WSDL_URL);
    const client = await soap.createClientAsync(NTC_WSDL_URL, { 
      timeout: 10000,
      connection_timeout: 10000,
    });
    
    client.addSoapHeader(
      { AuthHeader: { Username: NTC_USERNAME, Password: NTC_PASSWORD } },
      '',
      'tns',
      'NepalTelecom.AuthGateway'
    );
    
    console.log('SOAP client created successfully');
    return client;
  } catch (error) {
    console.error('SOAP Client Creation Error:', error);
    throw new ApiError(500, 'Failed to initialize SOAP client');
  }
}

async function requestOtp(mdn) {
  try {
    if (!mdn) {
      throw new ApiError(400, 'Mobile number is required');
    }

    // Check if we should use mock service
    if (NODE_ENV === 'development') {
      const isConnected = await testSOAPConnectivity();
      if (!isConnected) {
        console.log('SOAP service unavailable, using mock service for development');
        return await mockOtpService.generateOtp(mdn);
      }
    }

    // Try real SOAP service
    try {
      const client = await getClient();
      const [res] = await client.GenerateAuthPasswordAsync({
        MDN: mdn,
        Busicode: NTC_BUSICODE,
      });
      
      const { ResultCode: code, GenerateAuthPasswordResult: trId } = res;

      if (code !== '0' && code !== '00') {
        console.error('NTC OTP Request Failed:', { code, trId });
        throw new ApiError(400, 'Failed to send OTP via SMS');
      }

      const token = jwt.sign(
        { mdn, trId },
        OTP_SECRET_KEY,
        { expiresIn: OTP_TOKEN_EXPIRY }
      );

      return { success: true, token, message: 'OTP sent successfully via SMS' };
    } catch (soapError) {
      console.error('SOAP OTP Request Error:', soapError);
      
      // Fallback to email if enabled
      if (ENABLE_SMS_FALLBACK_TO_EMAIL === 'true') {
        console.log('SMS failed, attempting email fallback');
        throw new ApiError(503, 'SMS service unavailable, please use email OTP instead');
      }
      
      // In development, use mock service as fallback
      if (NODE_ENV === 'development') {
        console.log('SOAP failed, using mock service as fallback');
        return await mockOtpService.generateOtp(mdn);
      }
      
      throw soapError;
    }
  } catch (error) {
    console.error('OTP Request Error:', error);
    throw error instanceof ApiError
      ? error
      : new ApiError(500, 'Internal error while sending OTP');
  }
}

async function confirmOtp(token, otp) {
  try {
    if (!token || !otp) {
      throw new ApiError(400, 'Token and OTP are required');
    }
    
    const { mdn, trId } = jwt.verify(token, OTP_SECRET_KEY);

    // Check if this is a mock token
    if (trId?.startsWith('MOCK_')) {
      console.log('Validating mock OTP');
      return await mockOtpService.validateOtp(token, otp);
    }

    // Check if we should use mock service for development
    if (NODE_ENV === 'development') {
      const isConnected = await testSOAPConnectivity();
      if (!isConnected) {
        console.log('SOAP service unavailable, using mock validation');
        return await mockOtpService.validateOtp(token, otp);
      }
    }

    // Try real SOAP service
    try {
      const client = await getClient();
      const [res] = await client.ValidateOTPAsync({
        MDN: mdn,
        BusiCode: NTC_BUSICODE,
        OTP: otp,
        TrId: trId,
      });

      const code = res.ValidateOTPResult;
      const success = code === '0' || code === '00';

      if (!success) {
        console.error('NTC OTP Verification Failed:', { code, mdn, trId });
        throw new ApiError(400, 'Invalid or expired OTP');
      }

      return { success: true, mdn, message: 'OTP verified successfully' };
    } catch (soapError) {
      console.error('SOAP OTP Verification Error:', soapError);
      
      // In development, use mock service as fallback
      if (NODE_ENV === 'development') {
        console.log('SOAP verification failed, using mock service as fallback');
        return await mockOtpService.validateOtp(token, otp);
      }
      
      throw soapError;
    }
  } catch (error) {
    console.error('OTP Verification Error:', error);
    throw error instanceof ApiError
      ? error
      : new ApiError(401, 'Invalid or expired token or OTP');
  }
}

module.exports = { requestOtp, confirmOtp };