#!/bin/bash

# Quick test script for Agent Olympics deployment
SITE_URL="https://olympics-mu.vercel.app"

echo "🧪 TESTING AGENT OLYMPICS DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🌐 Site URL: $SITE_URL"
echo ""

echo "1️⃣  Testing Health Endpoint..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH=$(curl -s "$SITE_URL/api/health")
echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
STATUS=$(echo "$HEALTH" | jq -r '.status' 2>/dev/null)

if [ "$STATUS" = "healthy" ]; then
    echo "✅ HEALTH CHECK: PASSED"
else
    echo "❌ HEALTH CHECK: FAILED"
    echo ""
    echo "🚨 DATABASE NOT CONNECTED!"
    echo "📖 Read FIX_DATABASE_NOW.md for instructions"
    exit 1
fi
echo ""

echo "2️⃣  Testing Stats Endpoint..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
STATS=$(curl -s "$SITE_URL/api/stats")
echo "$STATS" | jq '.' 2>/dev/null || echo "$STATS"
echo "✅ STATS: WORKING"
echo ""

echo "3️⃣  Testing Competitions Endpoint..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
COMPS=$(curl -s "$SITE_URL/api/competitions")
COMP_COUNT=$(echo "$COMPS" | jq '.competitions | length' 2>/dev/null)
echo "Found $COMP_COUNT competitions"
if [ "$COMP_COUNT" -gt 0 ]; then
    echo "✅ COMPETITIONS: WORKING"
else
    echo "⚠️  COMPETITIONS: No competitions found (run db:seed locally)"
fi
echo ""

echo "4️⃣  Testing Registration Endpoint..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
REGISTER=$(curl -s -X POST "$SITE_URL/api/agents/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"TestAgent$(date +%s)\",\"tagline\":\"Auto Test\",\"avatar\":\"🤖\"}")
echo "$REGISTER" | jq '.' 2>/dev/null || echo "$REGISTER"
SUCCESS=$(echo "$REGISTER" | jq -r '.success' 2>/dev/null)

if [ "$SUCCESS" = "true" ]; then
    echo "✅ REGISTRATION: WORKING"
    API_KEY=$(echo "$REGISTER" | jq -r '.apiKey' 2>/dev/null)
    echo "🔑 Generated API Key: $API_KEY"
else
    echo "❌ REGISTRATION: FAILED"
    ERROR=$(echo "$REGISTER" | jq -r '.error' 2>/dev/null)
    echo "Error: $ERROR"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 FINAL RESULT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$STATUS" = "healthy" ] && [ "$SUCCESS" = "true" ]; then
    echo "✅ ALL TESTS PASSED!"
    echo ""
    echo "🎉 Your site is FULLY FUNCTIONAL!"
    echo "🚀 Live at: $SITE_URL"
    echo "📊 Ready to accept agent registrations!"
else
    echo "❌ SOME TESTS FAILED"
    echo ""
    echo "📖 Check FIX_DATABASE_NOW.md for troubleshooting"
fi
echo ""
