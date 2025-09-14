const { requestOtp, confirmOtp } = require('./utils/soapOtp');

async function testNTCOTP() {
  console.log('🚀 Testing NTC SOAP OTP Service...\n');
  
  // Test mobile number (use a valid Nepali mobile number for actual testing)
  const testMobile = '9851347856'; // Admin's mobile from registerAdmin.js
  
  try {
    // Test 1: Check environment variables
    console.log('📋 Environment Variables Check:');
    console.log('NTC_WSDL_URL:', process.env.NTC_WSDL_URL || '❌ Missing');
    console.log('NTC_USERNAME:', process.env.NTC_USERNAME || '❌ Missing');
    console.log('NTC_PASSWORD:', process.env.NTC_PASSWORD ? '✅ Set' : '❌ Missing');
    console.log('NTC_BUSICODE:', process.env.NTC_BUSICODE || '❌ Missing');
    console.log('OTP_SECRET_KEY:', process.env.OTP_SECRET_KEY ? '✅ Set' : '❌ Missing');
    console.log('OTP_TOKEN_EXPIRY:', process.env.OTP_TOKEN_EXPIRY || '❌ Missing');
    console.log('');
    
    // Test 2: Test OTP Request
    console.log('📱 Testing OTP Request...');
    console.log(`Sending OTP to: ${testMobile}`);
    
    const result = await requestOtp(testMobile);
    console.log('✅ OTP Request Result:', result);
    
    // Test 3: Prompt for OTP verification (for manual testing)
    if (result.success && result.token) {
      console.log('\n📝 To complete the test:');
      console.log('1. Check your mobile for the OTP');
      console.log('2. Run: node testOtp.js verify <OTP> <TOKEN>');
      console.log(`   Example: node testOtp.js verify 123456 "${result.token}"`);
    }
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.error('Status Code:', error.statusCode);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Possible Issues:');
      console.log('- Network connectivity to NTC SOAP service');
      console.log('- WSDL URL is not accessible from your location');
      console.log('- Service might be down or behind a firewall');
    } else if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
      console.log('\n💡 Possible Issues:');
      console.log('- Invalid NTC credentials (username/password)');
      console.log('- Account might be disabled or expired');
    }
  }
}

async function testOTPVerification(otp, token) {
  console.log('🔐 Testing OTP Verification...\n');
  
  try {
    const result = await confirmOtp(token, otp);
    console.log('✅ OTP Verification Result:', result);
  } catch (error) {
    console.error('❌ Verification Failed:', error.message);
    console.error('Status Code:', error.statusCode);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args[0] === 'verify' && args[1] && args[2]) {
  testOTPVerification(args[1], args[2]);
} else {
  testNTCOTP();
}