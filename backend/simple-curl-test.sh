#!/bin/bash

echo "📡 Simple SOAP XML Server Test"
echo "=============================="

SOAP_HOST="192.168.200.85"
BASE_URL="http://192.168.200.85"
WSDL_URL="http://192.168.200.85/Authuser.asmx?wsdl"

echo "Target: $SOAP_HOST"
echo ""

# Test basic connectivity with different timeouts
echo "1. Quick connectivity test (3 sec timeout):"
curl -m 3 --connect-timeout 3 -s -w "Status: %{http_code} | Time: %{time_total}s | Size: %{size_download} bytes\n" \
     "$BASE_URL" -o /dev/null
echo ""

echo "2. WSDL endpoint test (5 sec timeout):"
curl -m 5 --connect-timeout 5 -s -w "Status: %{http_code} | Time: %{time_total}s | Size: %{size_download} bytes\n" \
     "$WSDL_URL" -o /dev/null
echo ""

echo "3. Verbose connectivity test:"
curl -v --connect-timeout 5 -m 10 "$BASE_URL" 2>&1 | head -20
echo ""

echo "4. Testing different potential ports:"
for port in 80 8080 443 8443; do
    echo -n "Port $port: "
    timeout 3 bash -c "</dev/tcp/$SOAP_HOST/$port" 2>/dev/null && echo "✓ Open" || echo "✗ Closed/Filtered"
done
echo ""

# Check local network interface to see what network we're on
echo "5. Local network info:"
echo "Current IP addresses:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "  " $2}' | head -5
echo ""

# Check if it's a routing issue
echo "6. Can we reach other hosts on that subnet?"
echo -n "Testing 192.168.200.1: "
timeout 2 bash -c "</dev/tcp/192.168.200.1/80" 2>/dev/null && echo "✓ Reachable" || echo "✗ Not reachable"
echo -n "Testing 192.168.200.254: "
timeout 2 bash -c "</dev/tcp/192.168.200.254/80" 2>/dev/null && echo "✓ Reachable" || echo "✗ Not reachable"
echo ""

echo "🔍 Analysis:"
echo "============"
if timeout 3 bash -c "</dev/tcp/$SOAP_HOST/80" 2>/dev/null; then
    echo "✅ Server is accessible - check application-level issues"
else
    echo "❌ Server is NOT accessible"
    echo ""
    echo "Possible causes:"
    echo "• Not connected to the same network (192.168.200.x)"
    echo "• VPN/network configuration issue"
    echo "• Server is down or moved"
    echo "• Firewall blocking connection"
    echo "• Wrong IP address"
    echo ""
    echo "Solutions for development:"
    echo "• Use email OTP instead (working)"
    echo "• Enable mock service: USE_MOCK_OTP_IN_DEV=true"
    echo "• Use fallback system we created"
fi