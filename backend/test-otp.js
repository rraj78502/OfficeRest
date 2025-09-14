#!/usr/bin/env node

require('dotenv').config();
const soap = require('soap');
const axios = require('axios');

const {
  NTC_WSDL_URL,
  NTC_USERNAME,
  NTC_PASSWORD,
  NTC_BUSICODE,
} = process.env;

console.log('🔍 OTP Service Diagnostic Test');
console.log('================================');
console.log('Environment Variables:');
console.log('- NTC_WSDL_URL:', NTC_WSDL_URL);
console.log('- NTC_USERNAME:', NTC_USERNAME ? 'Set ✓' : 'Not Set ✗');
console.log('- NTC_PASSWORD:', NTC_PASSWORD ? 'Set ✓' : 'Not Set ✗');
console.log('- NTC_BUSICODE:', NTC_BUSICODE);
console.log('');

async function testConnectivity() {
  console.log('1. Testing Basic Network Connectivity');
  console.log('====================================');
  
  try {
    const url = new URL(NTC_WSDL_URL);
    const baseUrl = `${url.protocol}//${url.hostname}:${url.port || 80}`;
    
    console.log(`Attempting to connect to: ${baseUrl}`);
    
    const response = await axios.get(baseUrl, { 
      timeout: 10000,
      validateStatus: () => true // Accept all status codes
    });
    
    console.log(`✓ Connection successful! Status: ${response.status}`);
    console.log(`✓ Server responded with: ${response.statusText}`);
    
    return true;
  } catch (error) {
    console.log('✗ Connection failed!');
    console.log('Error details:');
    console.log(`  - Code: ${error.code}`);
    console.log(`  - Message: ${error.message}`);
    
    if (error.code === 'EHOSTDOWN') {
      console.log('  ❌ Host is down or unreachable');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('  ❌ Connection refused by server');
    } else if (error.code === 'ENOTFOUND') {
      console.log('  ❌ Host not found (DNS issue)');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('  ❌ Connection timed out');
    }
    
    return false;
  }
}

async function testWSDL() {
  console.log('');
  console.log('2. Testing WSDL Access');
  console.log('======================');
  
  try {
    console.log(`Attempting to fetch WSDL: ${NTC_WSDL_URL}`);
    
    const response = await axios.get(NTC_WSDL_URL, { 
      timeout: 15000,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      console.log('✓ WSDL accessible!');
      console.log(`✓ Content-Type: ${response.headers['content-type']}`);
      
      const wsdlContent = response.data;
      if (wsdlContent.includes('wsdl:definitions') || wsdlContent.includes('<definitions')) {
        console.log('✓ Valid WSDL content detected');
        
        // Check for expected operations
        if (wsdlContent.includes('GenerateAuthPassword')) {
          console.log('✓ GenerateAuthPassword operation found');
        } else {
          console.log('⚠ GenerateAuthPassword operation not found');
        }
        
        if (wsdlContent.includes('ValidateOTP')) {
          console.log('✓ ValidateOTP operation found');
        } else {
          console.log('⚠ ValidateOTP operation not found');
        }
      } else {
        console.log('⚠ Invalid WSDL content');
      }
      
      return true;
    } else {
      console.log(`✗ WSDL not accessible! Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('✗ WSDL access failed!');
    console.log('Error details:');
    console.log(`  - Code: ${error.code}`);
    console.log(`  - Message: ${error.message}`);
    return false;
  }
}

async function testSOAPClient() {
  console.log('');
  console.log('3. Testing SOAP Client Creation');
  console.log('===============================');
  
  try {
    console.log('Creating SOAP client...');
    const client = await soap.createClientAsync(NTC_WSDL_URL);
    
    console.log('✓ SOAP client created successfully!');
    console.log('Available methods:', Object.keys(client).filter(key => typeof client[key] === 'function' && key.endsWith('Async')));
    
    // Add auth headers
    client.addSoapHeader(
      { AuthHeader: { Username: NTC_USERNAME, Password: NTC_PASSWORD } },
      '',
      'tns',
      'NepalTelecom.AuthGateway'
    );
    
    console.log('✓ Authentication headers added');
    return true;
  } catch (error) {
    console.log('✗ SOAP client creation failed!');
    console.log('Error details:');
    console.log(`  - Message: ${error.message}`);
    console.log(`  - Stack: ${error.stack?.split('\n')[0]}`);
    return false;
  }
}

async function checkAlternatives() {
  console.log('');
  console.log('4. Alternative Solutions');
  console.log('========================');
  
  console.log('💡 Recommendations:');
  console.log('');
  
  if (NTC_WSDL_URL?.includes('192.168.200.85')) {
    console.log('1. Network Issue:');
    console.log('   - The NTC SOAP service is on a local network (192.168.200.85)');
    console.log('   - This IP may not be accessible from your current network');
    console.log('   - Check if you\'re connected to the correct VPN/network');
    console.log('');
  }
  
  console.log('2. Environment-based Configuration:');
  console.log('   - Use email OTP for development environment');
  console.log('   - Only use SMS OTP in production with working NTC service');
  console.log('');
  
  console.log('3. Fallback Strategy:');
  console.log('   - Implement automatic fallback from SMS to email');
  console.log('   - Add mock OTP service for development');
  console.log('');
  
  console.log('4. Development Mock:');
  console.log('   - Create a mock SOAP service for local development');
  console.log('   - Use environment variable to switch between real/mock service');
}

async function main() {
  const connectivityOk = await testConnectivity();
  
  if (connectivityOk) {
    const wsdlOk = await testWSDL();
    if (wsdlOk) {
      await testSOAPClient();
    }
  }
  
  await checkAlternatives();
  
  console.log('');
  console.log('🏁 Diagnostic Complete');
  console.log('======================');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

main().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});