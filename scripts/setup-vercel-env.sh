#!/bin/bash
# Setup Vercel Environment Variables for micelio project

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up Vercel environment variables...${NC}"

# Project: micelio (prj_cECQQO37wRXluZO4i5MxrKIjj3pg)

vercel env add NEXT_PUBLIC_SUPABASE_URL production --force <<< "https://lmqysqapqbttmyheuejo.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtcXlzcWFwcWJ0dG15aGV1ZWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNDk4ODcsImV4cCI6MjA1MTkyNTg4N30.ObLy7wMqX2F7XqSrDlpBYr9Tx2JVqK5qBWrxgz5nDkU"

echo -e "${GREEN}✓ Environment variables configured${NC}"
echo -e "${YELLOW}Triggering redeploy...${NC}"

vercel --prod

echo -e "${GREEN}✓ Done! Check: https://miceliio.vercel.app/en${NC}"

