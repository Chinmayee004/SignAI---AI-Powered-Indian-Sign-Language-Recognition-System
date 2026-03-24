# SignAI - GitHub Push Guide

## Overview

The SignAI project has been prepared with a `.gitignore` file to be pushed to the GitHub repository.

**Repository URL:**
```
https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System.git
```

## What Was Done

### 1. `.gitignore` File Created
A comprehensive `.gitignore` file has been created in the project root that excludes:
- Python virtual environments (`.venv`, `venv`, `env`)
- Build outputs and dependencies (`node_modules`, `__pycache__`, `*.egg-info`)
- ML model checkpoints (`.pt`, `.pth` files)
- Temporary and OS files
- IDE configuration folders
- Media files and large datasets
- Environment variables (`.env` files)

### 2. Project Files Ready
The following key files and directories are staged for commit:
- `README.md` - Main project documentation
- `SETUP.md` - Comprehensive setup guide for new laptops
- `MODEL_PIPELINE.md` - Detailed model architecture documentation
- `backend/` - FastAPI backend with VideoMAE model integration
- `frontend/` - React 19 frontend application
- `datasets/` - Training and evaluation datasets

## Pushing to GitHub

### Option 1: Using Provided Scripts (Windows)

**Run the batch script:**
```bash
cd c:\Users\prave\Desktop\signai
push_to_github.bat
```

This script will:
1. Initialize git repository
2. Configure git user
3. Add GitHub remote
4. Stage all project files (respecting .gitignore)
5. Create initial commit
6. Push to main branch

**Note:** You may be prompted for GitHub authentication.

### Option 2: Manual Git Commands

```bash
cd c:\Users\prave\Desktop\signai

# Initialize git
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Add remote
git remote add origin https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System.git

# Stage files
git add -A

# Create commit
git commit -m "Initial commit: SignAI - VideoMAE-based Indian Sign Language Recognition System"

# Push to main branch
git push -u origin HEAD:main
```

### Option 3: GitHub Desktop

1. Open GitHub Desktop
2. Select "Add" → "Add Existing Repository"
3. Browse to `c:\Users\prave\Desktop\signai`
4. Click "Create Repository"
5. Select all files to commit
6. Write commit message
7. Click "Push" → "Push to origin"

## Authentication

If you encounter authentication errors when pushing, use one of these methods:

### Method 1: GitHub Personal Access Token (Recommended)
1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Generate a new token with `repo` scope
3. When prompted for password, paste the token instead

### Method 2: SSH Key
1. Generate SSH keys: `ssh-keygen -t rsa -b 4096`
2. Add public key to [GitHub Settings → SSH and GPG keys](https://github.com/settings/keys)
3. Use SSH URL: `git@github.com:S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System.git`

### Method 3: Git Credentials Manager (Windows)
- Windows will prompt for credentials and securely store them
- Use your GitHub username and personal access token

## Verifying the Push

After pushing, verify the repository was updated:

```bash
# Check remote
git remote -v

# Check branch status
git branch -a

# Check commit log
git log --oneline

# Or visit: https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System
```

## `.gitignore` Details

The `.gitignore` file configured includes:

```
# Python and Virtual Environments
__pycache__/
*.py[cod]
.Python
.venv/
venv/
env/
.env

# ML/Deep Learning
*.pt       # PyTorch models
*.pth
checkpoint*/
*.ckpt

# Frontend
node_modules/
frontend/dist/
frontend/out/

# OS and IDE
.vscode/
.idea/
.DS_Store
Thumbs.db

# Media and Large Files
*.mp4
*.avi
*.mov
datasets/Videos_Sentence_Level/*

# And more... (see .gitignore for full list)
```

## Project Structure Being Committed

```
signai/
├── backend/
│   ├── app/ (FastAPI application)
│   ├── training/ (Training pipeline)
│   ├── scripts/ (Dataset processing)
│   ├── checkpoints/ (Model weights)
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/ (React components)
│   ├── package.json
│   └── [build configuration]
├── datasets/
│   ├── Frames_Sentence_Level/ (Training data)
│   ├── corpus_csv_files/
│   └── [data files]
├── .gitignore
├── README.md
├── SETUP.md
├── MODEL_PIPELINE.md
└── [project details/]
```

## Notes

- **Large Files:** The `.gitignore` excludes `.pt` and `.pth` files (pre-trained models). If you need to commit model weights, consider using [Git LFS](https://git-lfs.github.com/)
- **First Push:** The first push may take longer due to large numbers of files
- **Line Endings:** On Windows, git may auto-convert `LF` to `CRLF` - this is expected
- **Dataset Size:** Large video files in `datasets/Videos_Sentence_Level/` are excluded by default

## Troubleshooting

### "fatal: Unable to create '.git/index.lock'"
```bash
# This means a git process crashed or is hung
# Solution: Delete the lock file
del .git\index.lock
```

### "Authentication failed"
- Verify your GitHub username and token/SSH key
- Check internet connection
- Try: `git config --list` to verify git configuration

### "Branch 'master' does not have commits"
- Ensure your commit was created: `git log`
- If nothing shows, run: `git commit -m "message"` again

### Large file warnings
- This is expected if committing large datasets
- Consider using [Git LFS](https://git-lfs.github.com/) for files > 100MB

## Next Steps After Pushing

1. **Configure Branches:**
   - Set `main` as default branch in GitHub repository settings
   - Delete `master` branch if not needed

2. **Add Protection Rules (Optional):**
   - Require pull request reviews
   - Require status checks before merging

3. **Set Up CI/CD (Optional):**
   - GitHub Actions for automated testing
   - Deploy frontend/backend on push

4. **Documentation:**
   - Update repository description
   - Add topics/tags
   - Set up GitHub Pages for documentation

## Questions?

Refer to:
- [GitHub Help Documentation](https://help.github.com/)
- [Git Official Documentation](https://git-scm.com/doc)
- [SETUP.md](./SETUP.md) - Project setup guide
- [README.md](./README.md) - Project overview
