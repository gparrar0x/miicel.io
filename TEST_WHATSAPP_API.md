# WhatsApp Number API Test

## Test Cases

### 1. Valid WhatsApp Number (E.164 format)

**Request:**
```bash
PATCH /api/settings?tenant_id=1
Content-Type: application/json

{
  "whatsapp_number": "+5491123456789"
}
```

**Expected:** 200 OK, number saved

---

### 2. Valid International Numbers

```json
{ "whatsapp_number": "+12025551234" }     // USA
{ "whatsapp_number": "+447700900123" }    // UK
{ "whatsapp_number": "+34612345678" }     // Spain
{ "whatsapp_number": "+5511987654321" }   // Brazil
```

**Expected:** All should return 200 OK

---

### 3. Invalid Format (missing +)

```json
{ "whatsapp_number": "5491123456789" }
```

**Expected:** 400 Bad Request
```json
{
  "error": "WhatsApp number must be in international format (e.g., +1234567890)"
}
```

---

### 4. Invalid Format (too long)

```json
{ "whatsapp_number": "+123456789012345678901" }
```

**Expected:** 400 Bad Request
```json
{
  "error": "WhatsApp number cannot exceed 20 characters"
}
```

---

### 5. Invalid Format (starts with 0)

```json
{ "whatsapp_number": "+0123456789" }
```

**Expected:** 400 Bad Request
```json
{
  "error": "WhatsApp number must be in international format (e.g., +1234567890)"
}
```

---

### 6. Clear Field (null)

```json
{ "whatsapp_number": null }
```

**Expected:** 200 OK, field cleared

---

### 7. Clear Field (empty string)

```json
{ "whatsapp_number": "" }
```

**Expected:** 200 OK, field cleared (normalized to null)

---

### 8. GET Request Returns WhatsApp Number

**Request:**
```bash
GET /api/settings?tenant_id=1
```

**Expected Response:**
```json
{
  "id": 1,
  "slug": "demo_galeria",
  "name": "Demo Galería",
  "whatsapp_number": "+5491123456789",
  ...
}
```

---

## Manual Test via curl

```bash
# Set these variables first
TENANT_ID=1
API_URL="http://localhost:3000"

# Test 1: Set valid number
curl -X PATCH "${API_URL}/api/settings?tenant_id=${TENANT_ID}" \
  -H "Content-Type: application/json" \
  -d '{"whatsapp_number": "+5491123456789"}' \
  -b cookies.txt

# Test 2: Get settings (verify number saved)
curl "${API_URL}/api/settings?tenant_id=${TENANT_ID}" \
  -b cookies.txt

# Test 3: Invalid format (should fail)
curl -X PATCH "${API_URL}/api/settings?tenant_id=${TENANT_ID}" \
  -H "Content-Type: application/json" \
  -d '{"whatsapp_number": "5491123456789"}' \
  -b cookies.txt

# Test 4: Clear field
curl -X PATCH "${API_URL}/api/settings?tenant_id=${TENANT_ID}" \
  -H "Content-Type: application/json" \
  -d '{"whatsapp_number": null}' \
  -b cookies.txt

# Test 5: Verify cleared
curl "${API_URL}/api/settings?tenant_id=${TENANT_ID}" \
  -b cookies.txt
```

## Verification Queries

```sql
-- Check column exists
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'tenants' AND column_name = 'whatsapp_number';

-- View current values
SELECT id, slug, whatsapp_number FROM tenants LIMIT 5;

-- Test manual update
UPDATE tenants SET whatsapp_number = '+5491123456789' WHERE id = 1;

-- Test manual clear
UPDATE tenants SET whatsapp_number = NULL WHERE id = 1;
```
