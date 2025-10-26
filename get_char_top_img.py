import csv
import requests
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from time import sleep

SPACE = " "

def find_top_image_url(tag_name, login=None, api_key=None):
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
    try:
        response = requests.get(BASE_URL, headers=HEADERS, params=params)
        if response.status_code != 200:
            print(f"Error fetching post for {tag_name}: HTTP {response.status_code}")
            return ""
        results = response.json().get("posts", [])
        if results:
            # Iterate through posts to find one with a valid image URL
            for i, post in enumerate(results):
                if "file" in post and post["file"] and post["file"].get("url"):
                    return post["file"]["url"]
            # If no valid URLs found
            print(f"No valid URLs found in {len(results)} posts for {tag_name} (likely all require login)")
            return ""
        else:
            return ""
    except Exception as e:
        print(f"Exception fetching post for {tag_name}: {e}")
        return ""

def process_character(row, write_lock, writer, login=None, api_key=None):
    """Process a single character and write result to CSV"""
    tag_name = row["name"]
    # replace spaces with underscores for tag naming
    tag_query = tag_name.replace(" ", "_")
    image_url = find_top_image_url(tag_query, login=login, api_key=api_key)
    
    # Thread-safe writing
    with write_lock:
        writer.writerow([tag_name, image_url])
        print(f"{tag_name}: {image_url}")
    
    return tag_name, image_url

def main(input_csv, output_csv, max_workers=10, login=None, api_key=None):
    """Main function with parallel processing"""
    # Read all rows first
    rows = []
    with open(input_csv, newline="", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)
        rows = list(reader)
    
    print(f"Processing {len(rows)} characters with {max_workers} threads...")
    
    # Create thread-safe writing setup
    write_lock = threading.Lock()
    
    with open(output_csv, "w", newline="", encoding="utf-8") as outfile:
        writer = csv.writer(outfile)
        writer.writerow(["name", "image_url"])
        
        # Use ThreadPoolExecutor for parallel processing
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_row = {
                executor.submit(process_character, row, write_lock, writer, login, api_key): row 
                for row in rows
            }
            
            # Process completed tasks
            completed = 0
            for future in as_completed(future_to_row):
                try:
                    tag_name, image_url = future.result()
                    completed += 1
                    if completed % 50 == 0:  # Progress update every 50 characters
                        print(f"Progress: {completed}/{len(rows)} characters processed")
                except Exception as e:
                    row = future_to_row[future]
                    print(f"Error processing {row['name']}: {e}")
                    completed += 1
    
    print(f"Completed processing {len(rows)} characters!")

if __name__ == "__main__":
    if len(sys.argv) < 3 or len(sys.argv) > 6:
        print("Usage: python get_char_top_img.py input.csv output.csv [max_workers] [login] [api_key]")
        print("  max_workers: Number of threads (default: 10)")
        print("  login: e621 username (optional, for accessing login-required posts)")
        print("  api_key: e621 API key (optional, required if login provided)")
        print("\nExample:")
        print("  python get_char_top_img.py chars.csv images.csv 5 myusername myapikey")
        sys.exit(1)
    
    max_workers = 10
    login = None
    api_key = None
    
    if len(sys.argv) >= 4:
        max_workers = int(sys.argv[3])
    if len(sys.argv) >= 5:
        login = sys.argv[4]
    if len(sys.argv) >= 6:
        api_key = sys.argv[5]
    
    # Validate that both login and api_key are provided together
    if (login and not api_key) or (api_key and not login):
        print("Error: Both login and api_key must be provided together")
        sys.exit(1)
    
    main(sys.argv[1], sys.argv[2], max_workers, login, api_key)
