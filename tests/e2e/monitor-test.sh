#!/bin/bash
# Script para monitorear test E2E en tiempo real
# Uso: ./monitor-test.sh

LOG_FILE="test-debug.log"
TEST_PID_FILE="test.pid"

echo "🔍 Monitor de Test E2E - MercadoPago Sandbox"
echo "=============================================="
echo ""

# Verificar si el test está corriendo
if [ -f "$TEST_PID_FILE" ]; then
    TEST_PID=$(cat "$TEST_PID_FILE")
    if ps -p "$TEST_PID" > /dev/null 2>&1; then
        echo "✅ Test ejecutándose (PID: $TEST_PID)"
    else
        echo "⚠️  Test no está ejecutándose"
    fi
else
    echo "⚠️  No se encontró archivo de PID"
fi

echo ""
echo "📊 Monitoreando logs (Ctrl+C para salir)..."
echo ""

# Monitorear log en tiempo real
tail -f "$LOG_FILE" 2>/dev/null | while IFS= read -r line; do
    # Resaltar líneas importantes
    if echo "$line" | grep -qE "📍|📄|✓|❌|⏳"; then
        echo "$line"
    elif echo "$line" | grep -qE "Error:|Timeout|Failed"; then
        echo "❌ $line"
    elif echo "$line" | grep -qE "MercadoPago|MP|payment"; then
        echo "💳 $line"
    elif echo "$line" | grep -qE "Success|Passed|completed"; then
        echo "✅ $line"
    fi
done

