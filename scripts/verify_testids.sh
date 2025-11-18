#!/bin/bash
# Verify all critical test IDs exist in AdminSidebar

echo "=== Test ID Contract Verification ==="
echo ""

testids=(
  "admin-sidebar"
  "nav-products"
  "nav-orders"
  "nav-settings"
  "btn-logout"
  "btn-toggle-sidebar"
)

missing=0
for testid in "${testids[@]}"; do
  if grep -q "data-testid=\"$testid\"" components/AdminSidebar.tsx; then
    echo "✓ $testid"
  else
    echo "✗ MISSING: $testid"
    missing=$((missing + 1))
  fi
done

echo ""
if [ $missing -eq 0 ]; then
  echo "✓ All test IDs present"
  exit 0
else
  echo "✗ $missing test IDs missing"
  exit 1
fi
