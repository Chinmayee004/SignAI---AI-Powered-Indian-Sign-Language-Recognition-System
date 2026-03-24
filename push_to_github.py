#!/usr/bin/env python
"""Push SignAI project to GitHub main branch"""

import subprocess
import os
import sys
import shutil

def run_cmd(cmd, description="", check=True):
    """Run a shell command and print output"""
    print(f"\n{'='*60}")
    print(f"▶ {description or cmd}")
    print('='*60)
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=r"c:\Users\prave\Desktop\signai")
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        if check and result.returncode != 0:
            print(f"❌ Command failed with return code {result.returncode}")
            return False
        print(f"✓ Success")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    os.chdir(r"c:\Users\prave\Desktop\signai")
    
    # Check if .git exists and remove if corrupted
    print("\n[1] Checking git repository...")
    if os.path.exists(".git"):
        print("✓ Git repository exists")
    else:
        print("⚠ Git repository not found, will initialize")
    
    # Initialize or reset git
    print("\n[2] Initializing git repository...")
    run_cmd("git init", "Initialize git repository")
    run_cmd("git config user.email 'signai@example.com'", "Configure git email")
    run_cmd("git config user.name 'SignAI'", "Configure git name")
    run_cmd("git remote remove origin", "Remove existing origin (if any)", check=False)
    run_cmd("git remote add origin https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System.git", "Add GitHub origin")
    
    # Check gitignore
    print("\n[3] Checking gitignore...")
    if os.path.exists(".gitignore"):
        print("✓ .gitignore exists")
    
    # Stage files
    print("\n[4] Staging files...")
    files_to_add = [
        ".gitignore",
        "README.md",
        "SETUP.md",
        "MODEL_PIPELINE.md",
        "backend",
        "frontend", 
        "datasets"
    ]
    
    for file in files_to_add:
        run_cmd(f'git add -f "{file}"', f"Adding {file}", check=False)
    
    # Show status
    print("\n[5] Checking git status...")
    run_cmd("git status --short", "Git status")
    
    # Commit
    print("\n[6] Creating commit...")
    run_cmd('git commit -m "Initial commit: SignAI full-stack project with VideoMAE model"', "Create initial commit")
    
    # Show log
    print("\n[7] Showing commit log...")
    run_cmd("git log --oneline -1", "Latest commit")
    
    # Push
    print("\n[8] Pushing to GitHub...")
    print("\nNote: You may be prompted for GitHub authentication.")
    print("Use your GitHub personal access token or SSH key when prompted.")
    
    # Try to push - this will fail if not authenticated, which is OK
    run_cmd("git push -u origin master:main", "Push to main branch", check=False)
    
    print("\n" + "="*60)
    print("✓ Git operations completed!")
    print("="*60)
    print("\nNext steps:")
    print("1. If push failed, authenticate with GitHub:")
    print("   - Use 'git Push origin master main' after setting auth")
    print("   - Or use SSH if configured")
    print("2. Check repository at: https://github.com/S-Rahul-Naik/SignAI---AI-Powered-Indian-Sign-Language-Recognition-System")

if __name__ == "__main__":
    main()
