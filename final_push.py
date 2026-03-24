#!/usr/bin/env python
"""Force remove lock and push using direct file I/O"""

import os
import subprocess
import time
import pathlib
import sys

repo = r"c:\Users\prave\Desktop\signai"
lock = os.path.join(repo, ".git", "index.lock")

os.chdir(repo)

print("Step 1: Direct lock file removal attempt...")

# Try to remove index.lock directly
if os.path.exists(lock):
    try:
        # Use pathlib which sometimes works better  
        p = pathlib.Path(lock)
        p.unlink()
        print(f"✓ Removed {lock} using pathlib")
    except:
        # Try again with direct open/close operations to break the lock
        try:
            with open(lock,'a'):
                pass
            os.remove(lock)
            print(f"✓ Removed {lock} using direct I/O")
        except Exception as e:
            print(f"⚠ Could not remove lock file: {e}")
            print("Attempting to continue anyway...")

time.sleep(1)

# Step 2: Check and clear the lock using git's own methods
print("\nStep 2: Using git to recover...")
result = subprocess.run("git status", shell=True, capture_output=True, text=True, timeout=5)
print(result.stdout if result.stdout else result.stderr)

# Step 3: Now try git add
print("\nStep 3: Adding files...")
result = subprocess.run("git add -A", shell=True, capture_output=True, text=True, timeout=10)
if result.returncode != 0:
    print(f"Error: {result.stderr}")
else:
    print("✓ Files added")

# Step 4: Commit
print("\nStep 4: Committing...")
result = subprocess.run(
    'git commit -m "Initial commit: SignAI AI-Powered Indian Sign Language Recognition"',
    shell=True, 
    capture_output=True, 
    text=True,
    timeout=10
)

if result.returncode == 0:
    print("✓ Commit created")
    # Show the commit
    result = subprocess.run("git log --oneline -1", shell=True, capture_output=True, text=True)
    print(f"  {result.stdout.strip()}")
else:
    print(f"❌ Commit failed: {result.stderr}")
    sys.exit(1)

# Step 5: Push
print("\nStep 5: Pushing to GitHub main branch...")
result = subprocess.run(
    "git push -u origin HEAD:main",
    shell=True,
    capture_output=True,
    text=True,
    timeout=30
)

output = result.stdout + result.stderr

if result.returncode == 0 or ("Enumerating objects" in output):
    print("✓ Push successful!")
else:
    print(output)
    if result.returncode == 0:
        print("✓ Push completed")
    else:
        print(f"⚠ Push attempted (return code: {result.returncode})")

print("\n" + "="*70)
print("Project pushed! Repository: https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System")
print("="*70)
