#!/usr/bin/env node

require('dotenv').config();
const { requestOtp, confirmOtp, testVpnConnectivity } = require('./utils/soapOtpVPN');

console.log('🔥 Testing VPN-Based OTP System');
console.log('===============================');

async function main() {
  console.log('1. Testing VPN Connectivity via Axios');
  console.log('-------------------------------------');
  
  const vpnOk = await testVpnConnectivity();
  if (!vpnOk) {
    console.log('❌ VPN connectivity failed. Cannot proceed.');
    return;
  }
  
  console.log('');
  console.log('2. Testing OTP Generation');
  console.log('-------------------------');
  
  const testPhone = '9851347856';
  
  try {
    console.log(`Requesting OTP for: ${testPhone}`);
    const result = await requestOtp(testPhone);
    
    console.log('🎉 SUCCESS: OTP Generation via VPN!');
    console.log('- Message:', result.message);
    console.log('- Token (preview):', result.token?.substring(0, 30) + '...');
    
    console.log('');
    console.log('📱 SMS OTP should be sent to your phone');
    console.log('');
    console.log('💡 To test validation with your OTP:');
    console.log(`   node -e "require('./utils/soapOtpVPN').confirmOtp('${result.token}', 'YOUR_OTP').then(console.log).catch(console.error)"`);
    
  } catch (error) {
    console.log('❌ OTP Generation Failed');
    console.log('Error:', error.message);
    console.log('Status Code:', error.statusCode);
    
    if (error.response) {
      console.log('HTTP Status:', error.response.status);
      console.log('Response Data:', error.response.data?.substring(0, 200));
    }
  }
}

main().catch(console.error);