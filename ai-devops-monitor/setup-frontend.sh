#!/bin/bash

# AI DevOps Monitor - Quick Setup Script
# This script sets up the React frontend

echo "🚀 AI DevOps Monitor - React Frontend Setup"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Navigate to frontend directory
cd frontend || exit 1

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "VITE_API_URL=http://localhost:8000" > .env
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi
echo ""

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "The frontend will be available at http://localhost:3000"
echo ""
echo "Make sure the backend is running at http://localhost:8000"
echo ""
