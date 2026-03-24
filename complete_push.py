#!/usr/bin/env python3
"""Complete git reinitialization and push to GitHub"""

import subprocess
import os
import shutil

repo_path = r"c:\Users\prave\Desktop\signai"
git_path = os.path.join(repo_path, ".git")

os.chdir(repo_path)

print("="*70)
print("SignAI GitHub - COMPLETE SETUP & PUSH")
print("="*70)

# Step 1: Remove corrupted .git
print("\n[1] Cleaning up corrupted .git directory...")
try:
    if os.path.exists(git_path):
        shutil.rmtree(git_path)
        print("✓ Removed old .git")
except Exception as e:
    print(f"⚠ Could not remove .git: {e}")

# Step 2: Reinitialize git
print("\n[2] Initializing fresh git repository...")
subprocess.run(["git", "init"], check=True)
subprocess.run(["git", "config", "user.email", "signai@example.com"], check=True)
subprocess.run(["git", "config", "user.name", "SignAI"], check=True)
subprocess.run(["git", "remote", "add", "origin", 
               "https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System.git"], 
              check=True)
print("✓ Git repository initialized and configured")

# Step 3: Stage all files
print("\n[3] Staging all project files...")
result = subprocess.run(["git", "add", "-A"], capture_output=True, text=True)
print(f"✓ Added files")

# Step 4: Show what will be committed
print("\n[4] Files to commit:")
result = subprocess.run(["git", "status", "--short"], capture_output=True, text=True)
lines = result.stdout.strip().split('\n')
file_count = len([l for l in lines if l.strip()])
print(f"Total: {file_count} files")
for line in lines[:15]:
    if line.strip():
        print(f"  {line}")
if len(lines) > 15:
    print(f"  ... and {len(lines)-15} more files")

# Step 5: Create commit
print("\n[5] Creating commit...")
result = subprocess.run([
    "git", "commit", "-m",
    "Initial commit: SignAI - AI-Powered Indian Sign Language Recognition System\n\n" +
    "- VideoMAE Vision Transformer with 74% validation accuracy\n" +
    "- FastAPI backend with real-time inference\n" +
    "- React 19 frontend with modern UI\n" +
    "- 100+ ISL gesture classes\n" +
    "- Complete documentation and setup guides"
], capture_output=True, text=True)

if result.returncode == 0:
    print("✓ Commit created")
    # Show commit
    result = subprocess.run(["git", "log", "--oneline", "-1"], capture_output=True, text=True)
    print(f"  {result.stdout.strip()}")
else:
    print(f"❌ Commit failed: {result.stderr}")

# Step 6: Push to GitHub
print("\n[6] Pushing to GitHub main branch...")
print("   (You may be prompted for GitHub authentication)")
print("   Using Personal Access Token or system credentials...")
print()

result = subprocess.run([
    "git", "push", "-u", "origin", "master:main"
], capture_output=True, text=True)

# Print output
if result.stdout:
    print(result.stdout)
if result.stderr and "fatal" not in result.stderr.lower():
    print(result.stderr)

print()
print("="*70)
if result.returncode == 0:
    print("✓✓✓ SUCCESS! Project pushed to GitHub! ✓✓✓")
    print("\nRepository: https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System")
    print("\nBranch: main")
elif "Connection" in result.stderr or "RPC failed" in result.stderr:
    print("⚠ Connection issue during push - retrying in 5 seconds...")
    import time
    time.sleep(5)
    result = subprocess.run(["git", "push", "-u", "origin", "master:main"], 
                          capture_output=True, text=True)
    if result.returncode == 0:
        print("✓ Retry successful!")
    else:
        print(f"Push error: {result.stderr}")
else:
    print(f"Push completed with return code: {result.returncode}")
    if result.stderr:
        print(f"Error: {result.stderr}")

print("="*70)
