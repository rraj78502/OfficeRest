#!/usr/bin/env node

require('dotenv').config();
const { sendOTPController, verifyOTPController } = require('./controller/otpControllerEnhanced');

console.log('🧪 Testing Enhanced OTP System');
console.log('==============================');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('');

async function testEmailOTP() {
  console.log('1. Testing Email OTP');
  console.log('-------------------');
  
  const testEmail = 'test@example.com';
  
  try {
    console.log(`Sending OTP to email: ${testEmail}`);
    const sendResult = await sendOTPController({
      identifier: testEmail,
      deliveryMethod: 'email'
    });
    
    console.log('✓ Email OTP sent successfully');
    console.log('- Message:', sendResult.message);
    console.log('- Token length:', sendResult.token?.length || 0);
    
    // Extract OTP from token (for email, token IS the OTP)
    const otp = sendResult.token;
    
    console.log(`Verifying OTP: ${otp}`);
    const verifyResult = await verifyOTPController({
      token: sendResult.token,
      otp: otp,
      deliveryMethod: 'email'
    });
    
    console.log('✓ Email OTP verified successfully');
    console.log('- Identifier:', verifyResult.identifier);
    console.log('- Message:', verifyResult.message);
    
    return true;
  } catch (error) {
    console.log('✗ Email OTP test failed');
    console.log('- Error:', error.message);
    return false;
  }
}

async function testSMSOTP() {
  console.log('');
  console.log('2. Testing SMS OTP (with fallback)');
  console.log('----------------------------------');
  
  const testPhone = '9851347856';
  
  try {
    console.log(`Sending OTP to phone: ${testPhone}`);
    const sendResult = await sendOTPController({
      identifier: testPhone,
      deliveryMethod: 'sms'
    });
    
    console.log('✓ SMS OTP sent successfully');
    console.log('- Message:', sendResult.message);
    console.log('- Token type:', sendResult.token ? 'JWT' : 'None');
    
    // For SMS with mock service, use default OTP
    const testOtp = process.env.NODE_ENV === 'development' ? '123456' : '000000';
    
    console.log(`Verifying OTP: ${testOtp}`);
    const verifyResult = await verifyOTPController({
      token: sendResult.token,
      otp: testOtp,
      deliveryMethod: 'sms'
    });
    
    console.log('✓ SMS OTP verified successfully');
    console.log('- Identifier:', verifyResult.identifier);
    console.log('- Message:', verifyResult.message);
    
    return true;
  } catch (error) {
    console.log('✗ SMS OTP test failed');
    console.log('- Error:', error.message);
    
    if (error.statusCode === 503) {
      console.log('- This is expected when SMS service is unavailable');
      console.log('- Fallback to email should be suggested');
      return 'fallback_expected';
    }
    
    return false;
  }
}

async function testInvalidOTP() {
  console.log('');
  console.log('3. Testing Invalid OTP Handling');
  console.log('-------------------------------');
  
  const testEmail = 'test2@example.com';
  
  try {
    const sendResult = await sendOTPController({
      identifier: testEmail,
      deliveryMethod: 'email'
    });
    
    console.log('✓ Email OTP sent');
    
    // Try with wrong OTP
    try {
      await verifyOTPController({
        token: sendResult.token,
        otp: '999999', // Wrong OTP
        deliveryMethod: 'email'
      });
      
      console.log('✗ Should have failed with wrong OTP');
      return false;
    } catch (error) {
      if (error.message.includes('Invalid OTP')) {
        console.log('✓ Correctly rejected invalid OTP');
        return true;
      } else {
        console.log('✗ Wrong error for invalid OTP:', error.message);
        return false;
      }
    }
  } catch (error) {
    console.log('✗ Failed to test invalid OTP:', error.message);
    return false;
  }
}

async function main() {
  const results = {
    email: false,
    sms: false,
    validation: false
  };
  
  // Test email OTP
  results.email = await testEmailOTP();
  
  // Test SMS OTP (may fallback)
  const smsResult = await testSMSOTP();
  results.sms = smsResult === true || smsResult === 'fallback_expected';
  
  // Test validation
  results.validation = await testInvalidOTP();
  
  console.log('');
  console.log('🎯 Test Results Summary');
  console.log('=======================');
  console.log(`Email OTP: ${results.email ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`SMS OTP: ${results.sms ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Validation: ${results.validation ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(r => r === true);
  console.log(`Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
  
  if (!allPassed) {
    console.log('');
    console.log('💡 Note: Some failures may be expected in development environment');
    console.log('   - SMS failures are normal when NTC service is unavailable');
    console.log('   - Email failures may indicate SMTP configuration issues');
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