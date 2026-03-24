#!/usr/bin/env python
"""Full clean git setup and push"""

import os
import subprocess
import sys
import time
import shutil

repo_path = r"c:\Users\prave\Desktop\signai"
git_path = os.path.join(repo_path, ".git")

def remove_tree(path, retries=5):
    """Remove directory tree with retries"""
    for attempt in range(retries):
        try:
            if os.path.exists(path):
                shutil.rmtree(path)
                return True
            return True
        except Exception as e:
            print(f"Attempt {attempt+1}: {e}")
            time.sleep(0.5)
    return False

print("="*70)
print("SIGNAI PROJECT - GITHUB PUSH SCRIPT")
print("="*70)

os.chdir(repo_path)

# Step 1: Remove git directory
print("\n[Step 1] Cleaning up existing git directory...")
if os.path.exists(git_path):
    print(f"Removing {git_path}...")
    if remove_tree(git_path):
        print("✓ Successfully removed .git directory")
    else:
        print("❌ Failed to remove .git directory")
else:
    print("✓ No existing .git directory")

time.sleep(1)

# Step 2: Reinitialize git
print("\n[Step 2] Initializing new git repository...")
commands = [
    ("git init", "Initialize repository"),
    ("git config user.email 'signai-bot@example.com'", "Set git email"),
    ("git config user.name 'SignAI'", "Set git name"),
    ("git remote add origin https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System.git", "Add GitHub remote"),
]

for cmd, desc in commands:
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=repo_path)
    if result.returncode == 0:
        print(f"✓ {desc}")
    else:
        print(f"❌ {desc}: {result.stderr}")

# Step 3: Stage files
print("\n[Step 3] Staging project files...")
result = subprocess.run("git add -A", shell=True, capture_output=True, text=True, cwd=repo_path)
print(f"✓ Files staged")

# Step 4: Check status
print("\n[Step 4] Git status:")
result = subprocess.run("git status --short", shell=True, capture_output=True, text=True, cwd=repo_path)
lines = result.stdout.strip().split('\n')
print(f"Staging {len(lines)} files")
for line in lines[:10]:  # Show first 10
    print(f"  {line}")
if len(lines) > 10:
    print(f"  ... and {len(lines)-10} more files")

# Step 5: Create commit
print("\n[Step 5] Creating commit...")
msg = 'Initial commit: SignAI - AI-Powered Indian Sign Language Recognition System'
cmd = f'git commit -m "{msg}"'
result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=repo_path)

if result.returncode == 0:
    print("✓ Commit created successfully")
    # Extract commit hash if available
    result2 = subprocess.run("git log --oneline -1", shell=True, capture_output=True, text=True, cwd=repo_path)
    if result2.stdout:
        print(f"  Commit: {result2.stdout.strip()}")
else:
    print(f"❌ Commit failed: {result.stderr}")
    sys.exit(1)

# Step 6: Check current branch and rename if needed
print("\n[Step 6] Checking branch...")
result = subprocess.run("git branch", shell=True, capture_output=True, text=True, cwd=repo_path)
current_branch = result.stdout.strip().replace('* ', '').split('\n')[0] if result.stdout else 'master'
print(f"Current branch: {current_branch}")

# Step 7: Push to GitHub
print("\n[Step 7] Pushing to GitHub...")
print("Using: git push -u origin HEAD:main")

# Try to push to main - handles both master and main branches
cmd = "git push -u origin HEAD:main 2>&1"
result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=repo_path)

output = result.stdout + result.stderr
print(output)

if "fatal" not in output.lower() and result.returncode == 0:
    print("\n" + "="*70)
    print("✓ SUCCESS! Project pushed to GitHub!")
    print("="*70)
    print(f"\nRepository: https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System")
else:
    print("\n⚠ Push encountered issues. Check output above.")
    if "Authentication required" in output or "credential" in output.lower():
        print("\nNote: GitHub may be asking for authentication.")
        print("Make sure to:")
        print("1. Set up SSH keys, or")
        print("2. Create a Personal Access Token at github.com/settings/tokens")
    
print("\n" + "="*70)
