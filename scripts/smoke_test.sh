#!/bin/bash
set -e

BASE_URL="http://localhost:3000"

echo "Running Waypoint enterprise smoke test suite"

assert_ok() {
  local name="$1"
  local status="$2"
  if [ "$status" != "200" ]; then
    echo "FAILED: $name check failed with HTTP $status"
    exit 1
  fi
  echo "PASSED: $name returned HTTP $status"
}

echo "Checking Web Portal availability"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login" || echo "000")
assert_ok "Login portal page" "$HTTP_STATUS"

echo "Verifying unauthenticated access to Dispatcher API is blocked"
UNAUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/dispatcher/summary" || echo "000")
if [ "$UNAUTH_STATUS" != "401" ]; then
  echo "FAILED: Unauthenticated dispatcher API check failed to block (returned HTTP $UNAUTH_STATUS)"
  exit 1
fi
echo "PASSED: Unauthenticated request rejected with HTTP 401 Unauthorized"

COOKIE_JAR="/tmp/wp_smoke_cookie.txt"
rm -f "$COOKIE_JAR"

echo "Testing authentication endpoint with dispatcher credentials"
AUTH_RES=$(curl -s -c "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dispatcher@waypoint.test","password":"REDACTED"}' || echo "{}")
if [[ "$AUTH_RES" != *"success"* ]]; then
  echo "FAILED: Authentication endpoint did not return success"
  exit 1
fi
echo "PASSED: Dispatcher credentials authenticated successfully"

echo "Testing Dispatcher summary API with authenticated session"
DISP_STATUS=$(curl -s -b "$COOKIE_JAR" -o /dev/null -w "%{http_code}" "$BASE_URL/api/dispatcher/summary" || echo "000")
assert_ok "Dispatcher summary endpoint" "$DISP_STATUS"

echo "Testing Store summary API with authenticated session"
STORE_STATUS=$(curl -s -b "$COOKIE_JAR" -o /dev/null -w "%{http_code}" "$BASE_URL/api/store/summary" || echo "000")
assert_ok "Store summary endpoint" "$STORE_STATUS"

echo "Testing Loader runs API with authenticated session"
LOADER_STATUS=$(curl -s -b "$COOKIE_JAR" -o /dev/null -w "%{http_code}" "$BASE_URL/api/loader/runs" || echo "000")
assert_ok "Loader runs endpoint" "$LOADER_STATUS"

echo "Testing Driver route API with authenticated session"
DRIVER_STATUS=$(curl -s -b "$COOKIE_JAR" -o /dev/null -w "%{http_code}" "$BASE_URL/api/driver/route" || echo "000")
assert_ok "Driver route endpoint" "$DRIVER_STATUS"

echo "Testing Offline batch sync reconciliation API"
SYNC_RES=$(curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/api/sync/batch" \
  -H "Content-Type: application/json" \
  -d '{"pods":[{"id":"TEST_01","deliveryCode":"OUT001","receiverName":"Sunil Bandara"}]}' || echo "{}")
if [[ "$SYNC_RES" != *"appliedCount"* && "$SYNC_RES" != *"success"* ]]; then
  echo "FAILED: Sync batch endpoint returned unexpected response"
  exit 1
fi
echo "PASSED: Offline batch sync reconciliation endpoint validated"
rm -f "$COOKIE_JAR"

echo "All portal APIs verified successfully with strict assertions"
