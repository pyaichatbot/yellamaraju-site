#!/bin/bash

# GitHub Repository Setup Script
# This script helps you connect your local repository to GitHub

echo "🚀 GitHub Repository Setup"
echo "=========================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized!"
    echo "Run: git init"
    exit 1
fi

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Remote 'origin' already exists:"
    git remote -v
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 0
    fi
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Get repository name
read -p "Enter repository name (default: yellamaraju-site): " REPO_NAME
REPO_NAME=${REPO_NAME:-yellamaraju-site}

# Repository URL
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo ""
echo "📋 Configuration:"
echo "  Username: $GITHUB_USERNAME"
echo "  Repository: $REPO_NAME"
echo "  URL: $REPO_URL"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting..."
    exit 0
fi

# Add remote
echo ""
echo "🔗 Adding remote repository..."
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

# Verify
echo ""
echo "✅ Remote added:"
git remote -v

echo ""
echo "📝 Next steps:"
echo "1. Create the repository on GitHub:"
echo "   Visit: https://github.com/new"
echo "   Repository name: $REPO_NAME"
echo "   DO NOT initialize with README, .gitignore, or license"
echo ""
echo "2. Push your code:"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Netlify:"
echo "   Visit: https://app.netlify.com"
echo "   Follow the deployment guide in DEPLOYMENT_GUIDE.md"
echo ""

