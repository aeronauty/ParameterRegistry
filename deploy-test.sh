#!/bin/bash

# Simple deployment test script for GitLab Pages

echo "🚀 Starting Parameter Registry deployment process..."

# Step 1: Clean previous build
echo "1. Cleaning previous build..."
rm -rf public/assets public/index.html public/vite.svg

# Step 2: Generate data from CSV files
echo "2. Generating data files from CSV..."
npm run generate-data

if [ $? -ne 0 ]; then
    echo "❌ Data generation failed!"
    exit 1
fi

# Step 3: Build the application
echo "3. Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Step 4: Verify build output
echo "4. Verifying build output..."
if [ ! -f "public/index.html" ]; then
    echo "❌ Build output missing - no index.html found"
    exit 1
fi

if [ ! -d "public/assets" ]; then
    echo "❌ Build output missing - no assets directory found"
    exit 1
fi

if [ ! -d "public/data" ]; then
    echo "❌ Data files missing - no data directory found"
    exit 1
fi

echo "✅ Deployment build completed successfully!"
echo "📁 Generated files:"
ls -la public/

echo ""
echo "🌐 To test locally, run: npm run preview"
echo "📋 For GitLab Pages: Commit and push to main/master branch"
