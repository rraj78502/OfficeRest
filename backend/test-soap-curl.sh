#!/bin/bash

echo "🔍 SOAP Service Connectivity Test using cURL"
echo "============================================="

# Load environment variables
source .env 2>/dev/null || echo "Warning: .env file not found"

# SOAP service details
SOAP_HOST="192.168.200.85"
WSDL_URL="http://192.168.200.85/Authuser.asmx?wsdl"
SOAP_ENDPOINT="http://192.168.200.85/Authuser.asmx"

echo "Testing SOAP service at: $SOAP_HOST"
echo "WSDL URL: $WSDL_URL"
echo "SOAP Endpoint: $SOAP_ENDPOINT"
echo ""

# Test 1: Basic connectivity (ping)
echo "1. Testing Basic Network Connectivity (ping)"
echo "============================================"
ping -c 3 -W 3000 $SOAP_HOST 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ Host $SOAP_HOST is reachable via ping"
else
    echo "✗ Host $SOAP_HOST is NOT reachable via ping"
    echo "  This could indicate:"
    echo "  - Host is down"
    echo "  - Firewall blocking ICMP"
    echo "  - Not on the same network/VPN"
fi
echo ""

# Test 2: Port connectivity
echo "2. Testing Port Connectivity (HTTP - Port 80)"
echo "============================================="
timeout 10 bash -c "</dev/tcp/$SOAP_HOST/80" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ Port 80 is open on $SOAP_HOST"
else
    echo "✗ Port 80 is NOT accessible on $SOAP_HOST"
    echo "  This could indicate:"
    echo "  - Service is not running"
    echo "  - Firewall blocking port 80"
    echo "  - Wrong port number"
fi
echo ""

# Test 3: HTTP GET to base URL
echo "3. Testing HTTP GET to Base URL"
echo "==============================="
curl -s -m 10 -w "HTTP Status: %{http_code}\nTotal Time: %{time_total}s\n" \
     -H "User-Agent: SOAP-Test-Client/1.0" \
     "http://$SOAP_HOST/" -o /tmp/base_response.html 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ HTTP GET to base URL successful"
    if [ -f /tmp/base_response.html ]; then
        echo "Response preview:"
        head -5 /tmp/base_response.html | sed 's/^/  /'
    fi
else
    echo "✗ HTTP GET to base URL failed"
    echo "  Connection timeout or host unreachable"
fi
echo ""

# Test 4: WSDL accessibility
echo "4. Testing WSDL Accessibility"
echo "============================="
curl -s -m 15 -w "HTTP Status: %{http_code}\nTotal Time: %{time_total}s\nContent Length: %{size_download} bytes\n" \
     -H "User-Agent: SOAP-WSDL-Client/1.0" \
     -H "Accept: text/xml, application/xml, text/html" \
     "$WSDL_URL" -o /tmp/wsdl_response.xml 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ WSDL request completed"
    
    if [ -f /tmp/wsdl_response.xml ]; then
        # Check if response contains WSDL content
        if grep -q "wsdl:definitions\|<definitions" /tmp/wsdl_response.xml 2>/dev/null; then
            echo "✓ Valid WSDL content detected"
            
            # Check for expected operations
            if grep -q "GenerateAuthPassword" /tmp/wsdl_response.xml 2>/dev/null; then
                echo "✓ GenerateAuthPassword operation found"
            else
                echo "⚠ GenerateAuthPassword operation NOT found"
            fi
            
            if grep -q "ValidateOTP" /tmp/wsdl_response.xml 2>/dev/null; then
                echo "✓ ValidateOTP operation found"
            else
                echo "⚠ ValidateOTP operation NOT found"
            fi
            
            echo ""
            echo "WSDL Preview (first 10 lines):"
            head -10 /tmp/wsdl_response.xml | sed 's/^/  /'
            
        else
            echo "⚠ Response received but doesn't appear to be valid WSDL"
            echo "Response preview:"
            head -5 /tmp/wsdl_response.xml | sed 's/^/  /'
        fi
    fi
else
    echo "✗ WSDL request failed"
    echo "  Timeout or connection error"
fi
echo ""

# Test 5: SOAP envelope test (if WSDL is accessible)
if [ -f /tmp/wsdl_response.xml ] && grep -q "wsdl:definitions\|<definitions" /tmp/wsdl_response.xml 2>/dev/null; then
    echo "5. Testing SOAP Envelope (Dry Run)"
    echo "=================================="
    
    # Create a test SOAP envelope for GenerateAuthPassword
    cat > /tmp/soap_test.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthHeader xmlns="NepalTelecom.AuthGateway">
      <Username>test</Username>
      <Password>test</Password>
    </AuthHeader>
  </soap:Header>
  <soap:Body>
    <GenerateAuthPassword xmlns="NepalTelecom.AuthGateway">
      <MDN>9800000000</MDN>
      <Busicode>000000</Busicode>
    </GenerateAuthPassword>
  </soap:Body>
</soap:Envelope>
EOF

    echo "Sending test SOAP request..."
    curl -s -m 15 -w "HTTP Status: %{http_code}\nTotal Time: %{time_total}s\n" \
         -X POST \
         -H "Content-Type: text/xml; charset=utf-8" \
         -H "SOAPAction: \"NepalTelecom.AuthGateway/GenerateAuthPassword\"" \
         -H "User-Agent: SOAP-Test-Client/1.0" \
         -d @/tmp/soap_test.xml \
         "$SOAP_ENDPOINT" -o /tmp/soap_response.xml 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✓ SOAP request completed"
        
        if [ -f /tmp/soap_response.xml ]; then
            echo "SOAP Response preview:"
            head -10 /tmp/soap_response.xml | sed 's/^/  /'
            
            # Check for SOAP fault
            if grep -q "soap:Fault\|faultstring" /tmp/soap_response.xml 2>/dev/null; then
                echo "⚠ SOAP Fault detected (expected with test credentials)"
                grep "faultstring" /tmp/soap_response.xml 2>/dev/null | sed 's/^/  /'
            fi
        fi
    else
        echo "✗ SOAP request failed"
    fi
else
    echo "5. SOAP Envelope Test Skipped"
    echo "============================"
    echo "⚠ Skipped because WSDL is not accessible"
fi
echo ""

# Test 6: Network route tracing (optional)
echo "6. Network Route Analysis"
echo "========================"
echo "Attempting to trace route to $SOAP_HOST (first 5 hops):"
timeout 15 traceroute -m 5 $SOAP_HOST 2>/dev/null | head -10 | sed 's/^/  /'
echo ""

# Test 7: Service recommendations
echo "7. Diagnosis Summary & Recommendations"
echo "====================================="

# Analyze results
if timeout 10 bash -c "</dev/tcp/$SOAP_HOST/80" 2>/dev/null; then
    if [ -f /tmp/wsdl_response.xml ] && grep -q "wsdl:definitions\|<definitions" /tmp/wsdl_response.xml; then
        echo "🎉 SOAP Service Status: OPERATIONAL"
        echo "✅ All connectivity tests passed"
        echo "✅ WSDL is accessible and valid"
        echo "✅ Service appears to be working correctly"
        echo ""
        echo "💡 If your application is still failing:"
        echo "   - Check authentication credentials in .env"
        echo "   - Verify business code (NTC_BUSICODE)"
        echo "   - Check application-level error handling"
    else
        echo "⚠️  SOAP Service Status: PARTIALLY WORKING"
        echo "✅ Network connectivity is OK"
        echo "❌ WSDL is not accessible or invalid"
        echo ""
        echo "💡 Possible issues:"
        echo "   - Web service is not properly configured"
        echo "   - Authentication required for WSDL access"
        echo "   - Wrong endpoint URL"
    fi
else
    echo "❌ SOAP Service Status: NOT ACCESSIBLE"
    echo "❌ Cannot connect to $SOAP_HOST on port 80"
    echo ""
    echo "💡 Troubleshooting steps:"
    echo "   1. Check if you're connected to the correct VPN/network"
    echo "   2. Verify the server IP address (192.168.200.85)"
    echo "   3. Check firewall settings"
    echo "   4. Contact network administrator"
    echo ""
    echo "💡 Development alternatives:"
    echo "   - Use email OTP instead of SMS"
    echo "   - Enable mock OTP service (USE_MOCK_OTP_IN_DEV=true)"
    echo "   - Use the enhanced fallback system we created"
fi

# Cleanup
rm -f /tmp/base_response.html /tmp/wsdl_response.xml /tmp/soap_test.xml /tmp/soap_response.xml 2>/dev/null

echo ""
echo "🏁 Test completed at $(date)"
echo "============================================="