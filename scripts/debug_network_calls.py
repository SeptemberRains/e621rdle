#!/usr/bin/env python3

import csv
import sys
from fix_missing_images import find_top_image_url

def debug_comparison(login=None, api_key=None):
    """Debug comparison between a failing character and a working character"""
    
    # Find the first character with no image and the first with an image
    failing_character = None
    working_character = None
    working_url = None
    
    with open("top_img.csv", newline="", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)
        for row in reader:
            # Find first failing character
            if failing_character is None and (not row["image_url"] or row["image_url"].strip() == ""):
                failing_character = row["name"]
            
            # Find first working character
            if working_character is None and row["image_url"] and row["image_url"].strip() != "":
                working_character = row["name"]
                working_url = row["image_url"]
            
            # Stop when we have both
            if failing_character and working_character:
                break
    
    print("COMPARISON TEST: Failing vs Working Character")
    print("=" * 80)
    
    # Test the failing character
    print(f"\n🔴 TESTING FAILING CHARACTER: {failing_character}")
    print("=" * 80)
    
    failing_tag_query = failing_character.replace(" ", "_")
    failing_result = find_top_image_url(failing_tag_query, debug=True, login=login, api_key=api_key)
    
    print(f"\n🔴 FINAL RESULT for {failing_character}: {failing_result}")
    print("=" * 80)
    
    input("\nPress Enter to test the working character...")
    
    # Test the working character (re-query to see what a successful call looks like)
    print(f"\n🟢 TESTING WORKING CHARACTER: {working_character}")
    print(f"🟢 EXISTING URL: {working_url}")
    print("=" * 80)
    
    working_tag_query = working_character.replace(" ", "_")
    working_result = find_top_image_url(working_tag_query, debug=True, login=login, api_key=api_key)
    
    print(f"\n🟢 FINAL RESULT for {working_character}: {working_result}")
    print("=" * 80)
    
    # Summary comparison
    print(f"\n📊 SUMMARY COMPARISON:")
    print("-" * 40)
    print(f"Failing Character: {failing_character}")
    print(f"  Tag Query: {failing_tag_query}")
    print(f"  Result: {failing_result}")
    print(f"  Success: {'✅' if failing_result else '❌'}")
    print()
    print(f"Working Character: {working_character}")
    print(f"  Tag Query: {working_tag_query}")
    print(f"  Original URL: {working_url}")
    print(f"  Re-queried URL: {working_result}")
    print(f"  Success: {'✅' if working_result else '❌'}")
    print(f"  URLs Match: {'✅' if working_result == working_url else '❌'}")

if __name__ == "__main__":
    login = None
    api_key = None
    
    if len(sys.argv) >= 3:
        login = sys.argv[1]
        api_key = sys.argv[2]
    elif len(sys.argv) == 2:
        print("Error: If providing login, you must also provide api_key")
        print("Usage: python debug_network_calls.py [login] [api_key]")
        sys.exit(1)
    
    if login and api_key:
        print(f"Using login credentials: {login}")
    else:
        print("No login credentials provided - testing without authentication")
    
    debug_comparison(login, api_key)
