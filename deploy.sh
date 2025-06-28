#!/bin/bash

# Lotus Direct Care Policy Manual - Deployment Script
# This script helps deploy the policy manual to Netlify

echo "====================================="
echo "Lotus Direct Care Policy Manual"
echo "Deployment Script"
echo "====================================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js first."
    exit 1
fi

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Check for .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with your Google credentials."
    echo "See .env.example for the template."
    echo ""
    read -p "Do you want to continue without .env? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Initialize Netlify site
echo ""
echo "Initializing Netlify site..."
netlify init

# Deploy to Netlify
echo ""
echo "Deploying to Netlify..."
netlify deploy --prod

echo ""
echo "====================================="
echo "Deployment Complete!"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Go to your Netlify dashboard"
echo "2. Add environment variables:"
echo "   - GOOGLE_SERVICE_ACCOUNT_KEY"
echo "   - COMPLIANCE_SPREADSHEET_ID"
echo "3. Redeploy from Netlify dashboard"
echo ""
echo "For detailed instructions, see GOOGLE_WORKSPACE_SETUP.md"