#!/usr/bin/env python
"""Delete git index lock and retry operations"""

import os
import subprocess
import sys
import time

lock_file = r"c:\Users\prave\Desktop\signai\.git\index.lock"

print(f"Attempting to remove index lock file: {lock_file}")

# Try to remove the lock file
if os.path.exists(lock_file):
    try:
        os.remove(lock_file)
        print("✓ Successfully removed index.lock")
        time.sleep(1)  # Give git time to release
    except Exception as e:
        print(f"❌ Failed to remove lock file: {e}")
        sys.exit(1)
else:
    print("✓ No lock file found")

# Now run git operations
os.chdir(r"c:\Users\prave\Desktop\signai")

print("\n" + "="*60)
print("Now adding files...")
print("="*60)

cmd = 'git add -A'
result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
print(result.stdout or result.stderr)

print("\n" + "="*60)
print("Checking git status...")
print("="*60)

cmd = 'git status --short'
result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
print(result.stdout or result.stderr)

print("\n" + "="*60)
print("Creating commit...")
print("="*60)

cmd = 'git commit -m "Initial commit: SignAI full-stack project"'
result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
print(result.stdout or result.stderr)

print("\n" + "="*60)
print("Checking git log...")
print("="*60)

cmd = 'git log --oneline -1'
result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
print(result.stdout or result.stderr)

print("\n" + "="*60)
print("Pushing to GitHub...")
print("="*60)

cmd = 'git push -u origin master:main'
result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
print(result.stdout or result.stderr)

if result.returncode == 0:
    print("\n✓ SUCCESS! Project pushed to GitHub main branch!")
else:
    print(f"\n❌ Push completed with exit code {result.returncode}")
    print("If authentication was needed, run: git push -u origin master:main")
