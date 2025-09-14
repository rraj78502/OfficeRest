#!/usr/bin/env node

require('dotenv').config();
const { requestOtp, confirmOtp, testVpnConnectivity } = require('./utils/soapOtpFixed');

console.log('🧪 Testing Node.js OTP System via VPN');
console.log('====================================');

async function main() {
  console.log('1. Testing VPN Connectivity');
  console.log('---------------------------');
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
    
    console.log('✅ OTP Generation Success!');
    console.log('- Message:', result.message);
    console.log('- Token (first 20 chars):', result.token?.substring(0, 20) + '...');
    
    console.log('');
    console.log('📱 Check your phone for SMS OTP');
    console.log('');
    console.log('To test validation, run:');
    console.log(`node -e "const {confirmOtp} = require('./utils/soapOtpFixed'); confirmOtp('${result.token}', 'YOUR_OTP_CODE').then(console.log).catch(console.error);"`);
    
  } catch (error) {
    console.log('❌ OTP Generation Failed');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack?.split('\n')[0]);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

main().catch(error => {
  console.error('Test script failed:', error);
  process.exit(1);
});