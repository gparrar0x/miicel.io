#!/bin/bash

# Script para subir assets de SuperHotDog a Supabase Storage
# Bucket: assets
# Path: superhotdog/

SUPABASE_URL="https://lmqysqapqbttmyheuejo.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcXlzcWFwcWJ0dG15aGV1ZWpvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc0NDkzOCwiZXhwIjoyMDc4MzIwOTM4fQ.9zjymZFyQOZpFd15zrnb6-l3OjGiqzJsv2XeL2MdNuk"

ASSETS_DIR="/Users/gpublica/workspace/skywalking/projects/sw_commerce_superhotdog/assets"
BUCKET_NAME="assets"
TENANT_PATH="superhotdog"

echo "🌭 Subiendo assets de SuperHotDog a Supabase Storage..."
echo ""

# Función para subir un archivo
upload_file() {
  local file_path=$1
  local storage_path=$2
  local content_type=$3

  echo "📤 Subiendo: $storage_path"

  curl -X POST \
    "${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${storage_path}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: ${content_type}" \
    --data-binary "@${file_path}" \
    -w "\nStatus: %{http_code}\n\n"
}

# Subir logo principal (logo-superhotdog.png → logo-circle.png)
upload_file "${ASSETS_DIR}/logo-superhotdog.png" "${TENANT_PATH}/logo-circle.png" "image/png"

# Subir logo texto (logo.png → logo-text.png)
upload_file "${ASSETS_DIR}/logo.png" "${TENANT_PATH}/logo-text.png" "image/png"

# Subir banner
upload_file "${ASSETS_DIR}/banner.png" "${TENANT_PATH}/banner.png" "image/png"

echo "✅ Assets subidos exitosamente"
echo ""
echo "URLs públicas:"
echo "- Logo: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${TENANT_PATH}/logo-circle.png"
echo "- Logo Texto: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${TENANT_PATH}/logo-text.png"
echo "- Banner: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${TENANT_PATH}/banner.png"
