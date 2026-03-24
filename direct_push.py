#!/usr/bin/env python3
"""Direct push to GitHub with proper error handling"""

import subprocess
import os
import sys

# Change to project directory
os.chdir(r"c:\Users\prave\Desktop\signai")

print("="*70)
print("SignAI - Direct GitHub Push")
print("="*70)

# Verify we're in a git repository
print("\n[1] Verifying git repository...")
result = subprocess.run(["git", "status"], capture_output=True, text=True)
if result.returncode != 0:
    print("⚠ Git repository issue detected:")
    print(result.stderr)
    print("\nThis might be a PowerShell context issue. Trying direct push anyway...")
else:
    print("✓ Valid git repository found")
    print(result.stdout[:200])

# Check remote configuration
print("\n[2] Checking remote configuration...")
result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True)
print(result.stdout)

# Get latest commit
print("[3] Latest commit:")
result = subprocess.run(["git", "log", "--oneline", "-1"], capture_output=True, text=True)
if result.returncode == 0:
    print(result.stdout)
else:
    print("(no commits yet or repository issue)")

# Attempt push
print("\n[4] Pushing to GitHub...")
print("Command: git push -u origin HEAD:main\n")

result = subprocess.run(
    ["git", "push", "-u", "origin", "HEAD:main"],
    capture_output=True,
    text=True
)

print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)

print("\n" + "="*70)
if result.returncode == 0:
    print("✓ SUCCESS! Project pushed to GitHub")
else:
    print(f"Push returned code: {result.returncode}")
    
    # Try alternate branch name
    if "src refspec" in result.stderr or "master" not in result.stderr:
        print("\nTrying alternative: git push -u origin master:main")
        result2 = subprocess.run(
            ["git", "push", "-u", "origin", "master:main"],
            capture_output=True,
            text=True
        )
        print(result2.stdout)
        if result2.returncode == 0:
            print("✓ Push successful with master:main")
            
print("="*70)
