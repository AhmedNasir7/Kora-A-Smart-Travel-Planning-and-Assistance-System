#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Kora Backend & Frontend Integration Tests...${NC}\n"

# Check if backend is running
echo -e "${YELLOW}1. Checking backend health...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
  echo -e "${GREEN}✓ Backend is running${NC}\n"
else
  echo -e "${RED}✗ Backend is not responding${NC}"
  echo "  Please run: cd kora_backend && npm run start:dev"
  exit 1
fi

# Test landing page endpoint
echo -e "${YELLOW}2. Testing landing page endpoint...${NC}"
LANDING_RESPONSE=$(curl -s http://localhost:3000/landing)
if [[ $LANDING_RESPONSE == *"Kora"* ]]; then
  echo -e "${GREEN}✓ Landing page endpoint working${NC}\n"
else
  echo -e "${RED}✗ Landing page endpoint failed${NC}\n"
fi

# Test sign up (with test data)
echo -e "${YELLOW}3. Testing sign up endpoint...${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "password123",
    "fullName": "Test User"
  }')

if [[ $SIGNUP_RESPONSE == *"user_id"* ]] || [[ $SIGNUP_RESPONSE == *"id"* ]]; then
  echo -e "${GREEN}✓ Sign up endpoint working${NC}\n"
  echo "Response:"
  echo "$SIGNUP_RESPONSE" | jq . 2>/dev/null || echo "$SIGNUP_RESPONSE"
else
  echo -e "${RED}✗ Sign up endpoint failed${NC}"
  echo "Response:"
  echo "$SIGNUP_RESPONSE" | jq . 2>/dev/null || echo "$SIGNUP_RESPONSE"
  echo ""
fi

# Test sign in (with invalid credentials to check error handling)
echo -e "${YELLOW}4. Testing sign in endpoint (with invalid credentials)...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }')

if [[ $LOGIN_RESPONSE == *"Invalid"* ]] || [[ $LOGIN_RESPONSE == *"Unauthorized"* ]]; then
  echo -e "${GREEN}✓ Sign in error handling working${NC}\n"
else
  echo -e "${YELLOW}⚠ Sign in response:${NC}\n"
  echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
  echo ""
fi

# Test validation (missing required field)
echo -e "${YELLOW}5. Testing validation (missing password)...${NC}"
VALIDATION_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User"
  }')

if [[ $VALIDATION_RESPONSE == *"password"* ]] || [[ $VALIDATION_RESPONSE == *"error"* ]]; then
  echo -e "${GREEN}✓ Validation working${NC}\n"
else
  echo -e "${YELLOW}⚠ Validation may need check${NC}\n"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backend Integration Tests Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Frontend Setup:${NC}"
echo "1. Navigate to: cd Kora_Frontend/kora_app"
echo "2. Install: npm install"
echo "3. Run: npm run dev"
echo "4. Open: http://localhost:3001 (or shown port)"
echo ""
echo -e "${YELLOW}Frontend will connect to backend at:${NC}"
echo "  http://localhost:3000"
