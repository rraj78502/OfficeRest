#!/bin/bash

echo "🔐 NTC SOAP Service Test with Authentication"
echo "============================================"

# NTC SOAP service details
SOAP_HOST="192.168.200.85"
WSDL_URL="http://192.168.200.85/Authuser.asmx?wsdl"
SOAP_ENDPOINT="http://192.168.200.85/Authuser.asmx"

# Credentials
USERNAME="sdu"
PASSWORD="sdu321*"
BUSICODE="787878"

echo "Testing NTC SOAP Service:"
echo "Host: $SOAP_HOST"
echo "WSDL: $WSDL_URL"
echo "Username: $USERNAME"
echo "BusiCode: $BUSICODE"
echo ""

# Test 1: Basic connectivity
echo "1. Testing Basic Connectivity"
echo "============================"
timeout 5 bash -c "echo >/dev/tcp/$SOAP_HOST/80" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✓ TCP connection to port 80 successful"
    CONNECTION_OK=true
else
    echo "✗ Cannot connect to $SOAP_HOST:80"
    CONNECTION_OK=false
fi
echo ""

if [ "$CONNECTION_OK" = true ]; then
    # Test 2: HTTP GET to base URL
    echo "2. Testing HTTP GET to Base URL"
    echo "==============================="
    curl -s -m 10 -w "HTTP Status: %{http_code} | Time: %{time_total}s | Size: %{size_download} bytes\n" \
         "http://$SOAP_HOST/" -o /tmp/base_response.txt
    echo ""
    
    # Test 3: WSDL Access
    echo "3. Testing WSDL Access"
    echo "======================"
    echo "Requesting: $WSDL_URL"
    curl -s -m 15 -w "HTTP Status: %{http_code} | Time: %{time_total}s | Size: %{size_download} bytes\n" \
         "$WSDL_URL" -o /tmp/wsdl_response.xml
    
    if [ -f /tmp/wsdl_response.xml ] && [ -s /tmp/wsdl_response.xml ]; then
        echo ""
        echo "WSDL Response Preview:"
        head -10 /tmp/wsdl_response.xml | sed 's/^/  /'
        echo ""
        
        # Check if it's valid WSDL
        if grep -q "wsdl:definitions\|<definitions" /tmp/wsdl_response.xml; then
            echo "✓ Valid WSDL content detected"
            
            # Check for GenerateAuthPassword method
            if grep -q "GenerateAuthPassword" /tmp/wsdl_response.xml; then
                echo "✓ GenerateAuthPassword method found"
                WSDL_OK=true
            else
                echo "⚠ GenerateAuthPassword method not found"
                WSDL_OK=false
            fi
        else
            echo "⚠ Invalid WSDL format"
            WSDL_OK=false
        fi
    else
        echo "✗ No WSDL response received"
        WSDL_OK=false
    fi
    echo ""
    
    # Test 4: SOAP Request with Authentication
    if [ "$WSDL_OK" = true ]; then
        echo "4. Testing SOAP Request with NTC Credentials"
        echo "============================================"
        
        # Create SOAP envelope for GenerateAuthPassword
        cat > /tmp/ntc_soap_request.xml << EOF
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthHeader xmlns="NepalTelecom.AuthGateway">
      <Username>$USERNAME</Username>
      <Password>$PASSWORD</Password>
    </AuthHeader>
  </soap:Header>
  <soap:Body>
    <GenerateAuthPassword xmlns="NepalTelecom.AuthGateway">
      <MDN>9851347856</MDN>
      <Busicode>$BUSICODE</Busicode>
    </GenerateAuthPassword>
  </soap:Body>
</soap:Envelope>
EOF
        
        echo "SOAP Request XML:"
        cat /tmp/ntc_soap_request.xml | sed 's/^/  /'
        echo ""
        
        echo "Sending SOAP request..."
        curl -s -m 20 -w "HTTP Status: %{http_code} | Time: %{time_total}s | Size: %{size_download} bytes\n" \
             -X POST \
             -H "Content-Type: text/xml; charset=utf-8" \
             -H "SOAPAction: \"NepalTelecom.AuthGateway/GenerateAuthPassword\"" \
             -H "User-Agent: NTC-SOAP-Client/1.0" \
             -d @/tmp/ntc_soap_request.xml \
             "$SOAP_ENDPOINT" -o /tmp/soap_response.xml
        
        echo ""
        if [ -f /tmp/soap_response.xml ] && [ -s /tmp/soap_response.xml ]; then
            echo "SOAP Response:"
            cat /tmp/soap_response.xml | sed 's/^/  /'
            echo ""
            
            # Analyze response
            if grep -q "GenerateAuthPasswordResult" /tmp/soap_response.xml; then
                echo "✅ SUCCESS: GenerateAuthPassword response received!"
                
                # Extract result code and transaction ID
                RESULT_CODE=$(grep -o '<ResultCode>[^<]*</ResultCode>' /tmp/soap_response.xml | sed 's/<[^>]*>//g')
                TR_ID=$(grep -o '<GenerateAuthPasswordResult>[^<]*</GenerateAuthPasswordResult>' /tmp/soap_response.xml | sed 's/<[^>]*>//g')
                
                echo "Result Code: $RESULT_CODE"
                echo "Transaction ID: $TR_ID"
                
                if [ "$RESULT_CODE" = "0" ] || [ "$RESULT_CODE" = "00" ]; then
                    echo "🎉 OTP generation successful!"
                    echo "📱 SMS OTP should be sent to 9851347856"
                else
                    echo "⚠ OTP generation failed with code: $RESULT_CODE"
                fi
            elif grep -q "soap:Fault\|faultstring" /tmp/soap_response.xml; then
                echo "❌ SOAP Fault detected:"
                grep "faultstring" /tmp/soap_response.xml | sed 's/^/  /' | sed 's/<[^>]*>//g'
            else
                echo "⚠ Unexpected response format"
            fi
        else
            echo "✗ No response received"
        fi
    else
        echo "4. SOAP Request Test Skipped"
        echo "============================"
        echo "⚠ Skipped because WSDL is invalid or inaccessible"
    fi
    
else
    echo "2-4. All Tests Skipped"
    echo "====================="
    echo "❌ Cannot proceed - no network connectivity to $SOAP_HOST"
fi

echo ""
echo "🎯 Final Diagnosis"
echo "=================="

if [ "$CONNECTION_OK" = true ]; then
    if [ "$WSDL_OK" = true ]; then
        echo "✅ Network connectivity: OK"
        echo "✅ WSDL accessibility: OK"
        echo "✅ Service appears operational"
        echo ""
        echo "💡 If your Node.js app still fails, check:"
        echo "   - JWT token signing (OTP_SECRET_KEY)"
        echo "   - Database connectivity (MongoDB)"
        echo "   - Node.js SOAP library configuration"
    else
        echo "✅ Network connectivity: OK"
        echo "⚠ WSDL issues detected"
        echo ""
        echo "💡 Possible solutions:"
        echo "   - Verify WSDL URL is correct"
        echo "   - Check if authentication is required for WSDL"
        echo "   - Try different endpoint URL"
    fi
else
    echo "❌ Network connectivity: FAILED"
    echo "❌ Host $SOAP_HOST is not reachable"
    echo ""
    echo "💡 Required actions:"
    echo "   1. Connect to VPN that provides access to 192.168.200.x network"
    echo "   2. Verify you're on the correct internal network"
    echo "   3. Check with network administrator"
    echo "   4. Confirm the server IP address is correct"
    echo ""
    echo "🔧 Development alternatives:"
    echo "   - Use email OTP (already configured and working)"
    echo "   - Enable mock SMS service for development"
    echo "   - Use the enhanced fallback system"
fi

# Cleanup
rm -f /tmp/base_response.txt /tmp/wsdl_response.xml /tmp/ntc_soap_request.xml /tmp/soap_response.xml 2>/dev/null

echo ""
echo "🏁 Test completed at $(date)"