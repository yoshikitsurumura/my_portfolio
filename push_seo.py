# -*- coding: utf-8 -*-
import os
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

print(f"Current directory: {os.getcwd()}")

files = ["index.html", "SEARCH_ENGINES.md", "config/sitemap.xml"]
for file in files:
    if os.path.exists(file):
        subprocess.run(["git", "add", file], check=True)
        print(f"Added: {file}")

result = subprocess.run(["git", "status", "--short"], capture_output=True, text=True, encoding='utf-8')
print("\nGit status:")
print(result.stdout)

commit_message = "SEO対策追加: Google/Bing/Safari対応、Apple Touch Icon、構造化データ改善"
subprocess.run(["git", "commit", "-m", commit_message], check=True)
print("Committed")

subprocess.run(["git", "push", "origin", "master"], check=True)
print("Pushed to origin/master")

print("\nAll done!")

