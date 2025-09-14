require('dotenv').config();
const soap = require('soap');
const jwt = require('jsonwebtoken');
const ApiError = require('./ApiError');
const http = require('http');
const https = require('https');

const {
  NTC_WSDL_URL,
  NTC_USERNAME,
  NTC_PASSWORD,
  NTC_BUSICODE,
  OTP_SECRET_KEY,
  OTP_TOKEN_EXPIRY,
} = process.env;

// Force Node.js to use the VPN interface for outgoing connections
const VPN_INTERFACE_IP = '172.16.49.163';

// Custom HTTP agent that binds to the VPN interface
const httpAgent = new http.Agent({
  localAddress: VPN_INTERFACE_IP,
  keepAlive: true,
  maxSockets: 10,
});

const httpsAgent = new https.Agent({
  localAddress: VPN_INTERFACE_IP,
  keepAlive: true,
  maxSockets: 10,
});

// Create a fresh client for each request with VPN binding
async function getClient() {
  try {
    console.log(`Creating SOAP client for: ${NTC_WSDL_URL} via VPN interface: ${VPN_INTERFACE_IP}`);
    
    const client = await soap.createClientAsync(NTC_WSDL_URL, {
      httpAgent: NTC_WSDL_URL.startsWith('https://') ? httpsAgent : httpAgent,
      timeout: 30000, // 30 second timeout
      connection_timeout: 10000, // 10 second connection timeout
    });
    
    client.addSoapHeader(
      { AuthHeader: { Username: NTC_USERNAME, Password: NTC_PASSWORD } },
      '',
      'tns',
      'NepalTelecom.AuthGateway'
    );
    
    console.log('✓ SOAP client created successfully via VPN');
    return client;
  } catch (error) {
    console.error('SOAP Client Creation Error:', error);
    throw new ApiError(500, 'Failed to initialize SOAP client via VPN interface');
  }
}

async function requestOtp(mdn) {
  try {
    if (!mdn) {
      throw new ApiError(400, 'Mobile number is required');
    }
    
    console.log(`Requesting OTP for ${mdn} via VPN interface ${VPN_INTERFACE_IP}`);
    const client = await getClient();
    
    const [res] = await client.GenerateAuthPasswordAsync({
      MDN: mdn,
      Busicode: NTC_BUSICODE,
    });
    
    const { ResultCode: code, GenerateAuthPasswordResult: trId } = res;
    console.log(`NTC Response - Code: ${code}, TransactionId: ${trId}`);

    if (code !== '0' && code !== '00') {
      console.error('NTC OTP Request Failed:', { code, trId });
      throw new ApiError(400, `Failed to send OTP. Error code: ${code}`);
    }

    const token = jwt.sign(
      { mdn, trId },
      OTP_SECRET_KEY,
      { expiresIn: OTP_TOKEN_EXPIRY }
    );

    console.log('✓ OTP sent successfully via SMS');
    return { success: true, token, message: 'OTP sent successfully via SMS' };
  } catch (error) {
    console.error('NTC OTP Request Error:', error);
    throw error instanceof ApiError
      ? error
      : new ApiError(500, 'Internal error while sending OTP via VPN');
  }
}

async function confirmOtp(token, otp) {
  try {
    if (!token || !otp) {
      throw new ApiError(400, 'Token and OTP are required');
    }
    
    const { mdn, trId } = jwt.verify(token, OTP_SECRET_KEY);
    console.log(`Validating OTP for ${mdn} with TransactionId: ${trId}`);

    const client = await getClient();
    const [res] = await client.ValidateOTPAsync({
      MDN: mdn,
      BusiCode: NTC_BUSICODE,
      OTP: otp,
      TrId: trId,
    });

    const code = res.ValidateOTPResult;
    console.log(`NTC Validation Response - Code: ${code}`);
    const success = code === '0' || code === '00';

    if (!success) {
      console.error('NTC OTP Verification Failed:', { code, mdn, trId });
      throw new ApiError(400, `Invalid or expired OTP. Error code: ${code}`);
    }

    console.log('✓ OTP verified successfully');
    return { success: true, mdn, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('NTC OTP Verification Error:', error);
    throw error instanceof ApiError
      ? error
      : new ApiError(401, 'Invalid or expired token or OTP');
  }
}

// Test function to verify VPN connectivity
async function testVpnConnectivity() {
  try {
    const client = await getClient();
    console.log('✓ VPN connectivity test passed');
    return true;
  } catch (error) {
    console.error('✗ VPN connectivity test failed:', error.message);
    return false;
  }
}

module.exports = { requestOtp, confirmOtp, testVpnConnectivity };