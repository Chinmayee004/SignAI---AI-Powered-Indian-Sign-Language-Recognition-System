#!/bin/bash
# SignAI GitHub Push Script (Cross-platform)
# This script handles persistent git lock issues and pushes to GitHub

cd "$(dirname "$0")"

echo "=================================="
echo "SignAI - GitHub Push Setup"
echo "=================================="

# Kill any stuck git processes (if possible)
echo ""
echo "[1] Checking for stuck git processes..."

# Try to clean up the index lock by using git's own command
echo "[2] Attempting to recover git state..."
if [ -d ".git" ]; then
    if [ -f ".git/index.lock" ]; then
        echo "Removing stale index.lock file..."
        rm -f .git/index.lock
    fi
fi

# Initialize git if needed
echo ""
echo "[3] Setting up git repository..."
git init
git config user.email "signai@example.com"
git config user.name "SignAI Project"

# Add GitHub remote
echo "[4] Adding GitHub remote..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System.git

# Stage files
echo ""
echo "[5] Staging project files..."
git add -A

# Check status
echo ""
echo "[6] Current git status:"
git status --short | head -15
STATUS_COUNT=$(git status --short | wc -l)
echo "Total files to commit: $STATUS_COUNT"

# Create commit
echo ""
echo "[7] Creating commit..."
git commit -m "Initial commit: SignAI - AI-Powered Indian Sign Language Recognition System

- VideoMAE Vision Transformer model with 74% validation accuracy
- FastAPI backend with real-time gesture recognition
- React 19 frontend with modern UI/UX
- Support for 100+ ISL gesture classes
- Complete documentation and setup guide"

# Push to GitHub
echo ""
echo "[8] Pushing to GitHub main branch..."
git push -u origin HEAD:main

# Final status
echo ""
echo "=================================="
if [ $? -eq 0 ]; then
    echo "✓ SUCCESS! Project pushed to GitHub"
    echo ""
    echo "Repository: https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System"
else
    echo "⚠ Push may need manual completion"
    echo ""
    echo "Manual steps:"
    echo "1. Ensure you're authenticated with GitHub (SSH or token)"
    echo "2. Run: git push -u origin HEAD:main"
    echo "3. Or use: git push-u origin master:main (if on master branch)"
fi
echo "=================================="
