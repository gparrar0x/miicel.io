#!/bin/bash

# Verify Consignments E2E Test Fixes
# Runs test suite and validates all 7 fixes

set -e

echo "🔧 Consignments E2E Test Verification"
echo "======================================="
echo ""

# Kill any existing processes
echo "📋 Cleaning up previous processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "playwright" 2>/dev/null || true
sleep 2

# Start dev server
echo "🚀 Starting dev server on localhost:3000..."
npm run dev > /tmp/next.log 2>&1 &
DEV_PID=$!
sleep 15

# Verify server is ready
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "❌ Dev server failed to start"
  cat /tmp/next.log
  kill $DEV_PID 2>/dev/null || true
  exit 1
fi
echo "✓ Dev server ready"

echo ""
echo "🧪 Running Consignments Test Suite"
echo "===================================="

# Run tests with detailed reporter
npm run test:e2e:local -- tests/e2e/specs/consignments/ --reporter=verbose 2>&1 | tee /tmp/test-results.log

# Extract results
PASSED=$(grep -c "✓" /tmp/test-results.log || echo "0")
FAILED=$(grep -c "✗" /tmp/test-results.log || echo "0")

echo ""
echo "📊 Results Summary"
echo "=================="
echo "Passed: $PASSED"
echo "Failed: $FAILED"

# Cleanup
echo ""
echo "🧹 Cleanup..."
kill $DEV_PID 2>/dev/null || true

if [ "$FAILED" -eq 0 ]; then
  echo ""
  echo "✅ All tests passed!"
  exit 0
else
  echo ""
  echo "❌ $FAILED tests failed"
  echo ""
  echo "Failed test details:"
  grep -A 10 "✗" /tmp/test-results.log || true
  exit 1
fi
