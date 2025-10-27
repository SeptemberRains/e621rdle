import csv
import requests
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from time import sleep

SPACE = " "

def find_top_image_url(tag_name, max_retries=3, debug=True, login=None, api_key=None):
    """Query e621 API for the top image URL for a given tag name with retry logic"""
    BASE_URL = "https://e621.net/posts.json"
    HEADERS = {
        "User-Agent": "YourProject/1.0 (by yourusername on e621)"
    }
    tags = [tag_name, "order:score", "-animated"]
    tags_string = SPACE.join(tags)
    params = {
        "tags": tags_string,
        "limit": 10,  # Get more posts to check for valid URLs
        "page": 1,
    }
    
    # Add login credentials if provided
    if login and api_key:
        params["login"] = login
        params["api_key"] = api_key
        if debug:
            print(f"Using login credentials: {login}")
    elif debug:
        print("No login credentials provided - some posts may be unavailable")
    
    if debug:
        print(f"\n--- DEBUG: Querying {tag_name} ---")
        print(f"Request URL: {BASE_URL}")
        print(f"Query tags: {tags_string}")
        print(f"Full params: {params}")
    
    for attempt in range(max_retries):
        try:
            if debug:
                print(f"Making request (attempt {attempt + 1})...")
            
            response = requests.get(BASE_URL, headers=HEADERS, params=params)
            
            if debug:
                print(f"Response status: {response.status_code}")
                print(f"Response headers: {dict(response.headers)}")
            
            if response.status_code != 200:
                print(f"Error fetching post for {tag_name} (attempt {attempt + 1}): HTTP {response.status_code}")
                if debug:
                    print(f"Response content: {response.text[:500]}...")
                if attempt < max_retries - 1:
                    print(f"Retrying in 3 seconds...")
                    sleep(3)
                    continue
                return ""
            
            response_data = response.json()
            results = response_data.get("posts", [])
            
            if debug:
                print(f"API response structure: {type(response_data)}")
                print(f"Posts array length: {len(results)}")
                if results:
                    post = results[0]
                    print(f"First post keys: {list(post.keys())}")
                    if "file" in post:
                        print(f"Post: {post}")
                        print(f"File object: {post['file']}")
                        print(f"File URL: {post['file'].get('url', 'NO URL KEY')}")
                    else:
                        print("NO 'file' key in post object")
                else:
                    print("No posts in response")
                    print(f"Full response: {response_data}")
            
            if results:
                # Iterate through posts to find one with a valid image URL
                for i, post in enumerate(results):
                    if debug:
                        print(f"Checking post {i+1}/{len(results)}: {post.get('id', 'no_id')}")
                    
                    if "file" in post and post["file"] and post["file"].get("url"):
                        url = post["file"]["url"]
                        if debug:
                            print(f"SUCCESS: Found URL in post {i+1}: {url}")
                        return url
                    else:
                        if debug:
                            if "file" not in post:
                                print(f"  -> Post {i+1} has no 'file' key")
                            elif not post["file"]:
                                print(f"  -> Post {i+1} file object is None/empty")
                            elif not post["file"].get("url"):
                                print(f"  -> Post {i+1} file has no URL (likely login required)")
                
                # If we get here, no posts had valid URLs
                print(f"No valid URLs found in {len(results)} posts for {tag_name} (attempt {attempt + 1})")
                if debug:
                    print("  -> All posts either missing file object or require login")
                
                if attempt < max_retries - 1:
                    print(f"Retrying in 3 seconds...")
                    sleep(3)
                    continue
                return ""
            else:
                print(f"No posts returned for {tag_name} (attempt {attempt + 1})")
                if attempt < max_retries - 1:
                    print(f"Retrying in 3 seconds...")
                    sleep(3)
                    continue
                return ""
                
        except Exception as e:
            print(f"Exception fetching post for {tag_name} (attempt {attempt + 1}): {e}")
            if debug:
                import traceback
                print(f"Full traceback: {traceback.format_exc()}")
            if attempt < max_retries - 1:
                print(f"Retrying in 3 seconds...")
                sleep(3)
                continue
            return ""
    
    return ""

def process_missing_character(row, write_lock, writer, processed_count, debug_mode=False, login=None, api_key=None):
    """Process a single character with missing image and write result to CSV"""
    tag_name = row["name"]
    existing_url = row["image_url"]
    
    # Only query if image_url is missing (empty or None)
    if not existing_url or existing_url.strip() == "":
        # replace spaces with underscores for tag naming
        tag_query = tag_name.replace(" ", "_")
        image_url = find_top_image_url(tag_query, debug=debug_mode, login=login, api_key=api_key)
        print(f"Fetched for {tag_name}: {image_url}")
    else:
        image_url = existing_url
        print(f"Keeping existing for {tag_name}: {image_url}")
    
    # Thread-safe writing
    with write_lock:
        writer.writerow([tag_name, image_url])
        processed_count[0] += 1
        if processed_count[0] % 50 == 0:
            print(f"Progress: {processed_count[0]} characters processed")
    
    return tag_name, image_url

def main(input_csv="top_img.csv", output_csv="top_img_2.csv", max_workers=10, debug_mode=False, login=None, api_key=None):
    """Main function to process missing images"""
    # Read all rows first
    rows = []
    with open(input_csv, newline="", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)
        rows = list(reader)
    
    # Count missing images
    missing_count = sum(1 for row in rows if not row["image_url"] or row["image_url"].strip() == "")
    total_count = len(rows)
    
    print(f"Found {total_count} total characters")
    print(f"Found {missing_count} characters with missing images")
    print(f"Processing with {max_workers} threads...")
    
    if missing_count == 0:
        print("No missing images found! Creating copy of original file...")
        with open(output_csv, "w", newline="", encoding="utf-8") as outfile:
            writer = csv.writer(outfile)
            writer.writerow(["name", "image_url"])
            for row in rows:
                writer.writerow([row["name"], row["image_url"]])
        return
    
    # Create thread-safe writing setup
    write_lock = threading.Lock()
    processed_count = [0]  # Use list so it can be modified in threads
    
    with open(output_csv, "w", newline="", encoding="utf-8") as outfile:
        writer = csv.writer(outfile)
        writer.writerow(["name", "image_url"])
        
        # Use ThreadPoolExecutor for parallel processing
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_row = {
                executor.submit(process_missing_character, row, write_lock, writer, processed_count, debug_mode, login, api_key): row 
                for row in rows
            }
            
            # Process completed tasks
            completed = 0
            errors = 0
            for future in as_completed(future_to_row):
                try:
                    tag_name, image_url = future.result()
                    completed += 1
                except Exception as e:
                    row = future_to_row[future]
                    print(f"Error processing {row['name']}: {e}")
                    # Write the row with empty image_url if there was an error
                    with write_lock:
                        writer.writerow([row['name'], row.get('image_url', '')])
                        processed_count[0] += 1
                    errors += 1
                    completed += 1
    
    print(f"\nCompleted processing {total_count} characters!")
    print(f"Successfully processed: {completed - errors}")
    print(f"Errors: {errors}")
    print(f"Output written to: {output_csv}")

if __name__ == "__main__":
    if len(sys.argv) < 1 or len(sys.argv) > 7:
        print("Usage: python fix_missing_images.py [input.csv] [output.csv] [max_workers] [debug] [login] [api_key]")
        print("  input.csv: Input CSV file (default: top_img.csv)")
        print("  output.csv: Output CSV file (default: top_img_2.csv)")
        print("  max_workers: Number of threads (default: 10)")
        print("  debug: Enable debug mode (true/false, default: false)")
        print("  login: e621 username (optional, for accessing login-required posts)")
        print("  api_key: e621 API key (optional, required if login provided)")
        print("\nExample:")
        print("  python fix_missing_images.py top_img.csv top_img_fixed.csv 5 false myusername myapikey")
        sys.exit(1)
    
    input_csv = "top_img.csv"
    output_csv = "top_img_2.csv"
    max_workers = 10
    debug_mode = False
    login = None
    api_key = None
    
    if len(sys.argv) >= 2:
        input_csv = sys.argv[1]
    if len(sys.argv) >= 3:
        output_csv = sys.argv[2]
    if len(sys.argv) >= 4:
        max_workers = int(sys.argv[3])
    if len(sys.argv) >= 5:
        debug_mode = sys.argv[4].lower() in ['true', '1', 'yes', 'on']
    if len(sys.argv) >= 6:
        login = sys.argv[5]
    if len(sys.argv) >= 7:
        api_key = sys.argv[6]
    
    # Validate that both login and api_key are provided together
    if (login and not api_key) or (api_key and not login):
        print("Error: Both login and api_key must be provided together")
        sys.exit(1)
    
    main(input_csv, output_csv, max_workers, debug_mode, login, api_key)
