require('dotenv').config();
const soap = require('soap');
const jwt = require('jsonwebtoken');
const ApiError = require('./ApiError');
const axios = require('axios');

const {
  NTC_WSDL_URL,
  NTC_USERNAME,
  NTC_PASSWORD,
  NTC_BUSICODE,
  OTP_SECRET_KEY,
  OTP_TOKEN_EXPIRY,
} = process.env;

// Use axios with VPN interface binding for HTTP requests
const VPN_INTERFACE_IP = '172.16.49.163';

// Create axios instance that uses VPN interface
const vpnAxios = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Node-SOAP-Client-VPN/1.0',
  },
  // Use localAddress to bind to specific interface
  httpAgent: require('http').Agent({ 
    localAddress: VPN_INTERFACE_IP,
    timeout: 30000 
  }),
  httpsAgent: require('https').Agent({ 
    localAddress: VPN_INTERFACE_IP,
    timeout: 30000 
  }),
});

// Test VPN connectivity first
async function testVpnConnectivity() {
  try {
    const response = await vpnAxios.get(NTC_WSDL_URL, { timeout: 10000 });
    console.log(`✓ VPN connectivity test passed - Status: ${response.status}`);
    return true;
  } catch (error) {
    console.error('✗ VPN connectivity test failed:', error.code || error.message);
    return false;
  }
}

// Alternative approach: Create SOAP requests manually using axios
async function createSOAPRequest(action, soapBody) {
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthHeader xmlns="NepalTelecom.AuthGateway">
      <Username>${NTC_USERNAME}</Username>
      <Password>${NTC_PASSWORD}</Password>
    </AuthHeader>
  </soap:Header>
  <soap:Body>
    ${soapBody}
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await vpnAxios.post('http://192.168.200.85/Authuser.asmx', soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': `"NepalTelecom.AuthGateway/${action}"`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(`SOAP ${action} request failed:`, error.response?.status, error.message);
    throw error;
  }
}

async function requestOtp(mdn) {
  try {
    if (!mdn) {
      throw new ApiError(400, 'Mobile number is required');
    }

    console.log(`Requesting OTP for ${mdn} via VPN interface ${VPN_INTERFACE_IP}`);
    
    // Test connectivity first
    const isConnected = await testVpnConnectivity();
    if (!isConnected) {
      throw new ApiError(503, 'Cannot connect to NTC service via VPN');
    }

    const soapBody = `<GenerateAuthPassword xmlns="NepalTelecom.AuthGateway">
      <MDN>${mdn}</MDN>
      <Busicode>${NTC_BUSICODE}</Busicode>
    </GenerateAuthPassword>`;

    const responseXml = await createSOAPRequest('GenerateAuthPassword', soapBody);
    
    // Parse XML response
    const resultCodeMatch = responseXml.match(/<ResultCode>([^<]*)<\/ResultCode>/);
    const trIdMatch = responseXml.match(/<GenerateAuthPasswordResult>([^<]*)<\/GenerateAuthPasswordResult>/);
    
    if (!resultCodeMatch || !trIdMatch) {
      console.error('Invalid SOAP response format:', responseXml);
      throw new ApiError(500, 'Invalid response from NTC service');
    }

    const code = resultCodeMatch[1];
    const trId = trIdMatch[1];
    
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

    console.log('✅ OTP sent successfully via SMS');
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

    // Test connectivity first
    const isConnected = await testVpnConnectivity();
    if (!isConnected) {
      throw new ApiError(503, 'Cannot connect to NTC service via VPN');
    }

    const soapBody = `<ValidateOTP xmlns="NepalTelecom.AuthGateway">
      <MDN>${mdn}</MDN>
      <BusiCode>${NTC_BUSICODE}</BusiCode>
      <OTP>${otp}</OTP>
      <TrId>${trId}</TrId>
    </ValidateOTP>`;

    const responseXml = await createSOAPRequest('ValidateOTP', soapBody);
    
    // Parse XML response
    const resultMatch = responseXml.match(/<ValidateOTPResult>([^<]*)<\/ValidateOTPResult>/);
    
    if (!resultMatch) {
      console.error('Invalid SOAP validation response:', responseXml);
      throw new ApiError(500, 'Invalid response from NTC service');
    }

    const code = resultMatch[1];
    console.log(`NTC Validation Response - Code: ${code}`);
    const success = code === '0' || code === '00';

    if (!success) {
      console.error('NTC OTP Verification Failed:', { code, mdn, trId });
      throw new ApiError(400, `Invalid or expired OTP. Error code: ${code}`);
    }

    console.log('✅ OTP verified successfully');
    return { success: true, mdn, message: 'OTP verified successfully' };
    
  } catch (error) {
    console.error('NTC OTP Verification Error:', error);
    throw error instanceof ApiError
      ? error
      : new ApiError(401, 'Invalid or expired token or OTP');
  }
}

module.exports = { requestOtp, confirmOtp, testVpnConnectivity };