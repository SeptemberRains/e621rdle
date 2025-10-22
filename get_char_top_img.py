import csv
import requests
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from time import sleep

SPACE = " "

def find_top_image_url(tag_name):
    BASE_URL = "https://e621.net/posts.json"
    HEADERS = {
        "User-Agent": "YourProject/1.0 (by yourusername on e621)"
    }
    tags = [tag_name, "order:score", "-animated"]
    tags_string = SPACE.join(tags)
    params = {
        "tags": tags_string,
        "limit": 1,
        "page": 1,
    }
    try:
        response = requests.get(BASE_URL, headers=HEADERS, params=params)
        if response.status_code != 200:
            print(f"Error fetching post for {tag_name}: HTTP {response.status_code}")
            return ""
        results = response.json().get("posts", [])
        if results:
            return results[0]["file"]["url"]
        else:
            return ""
    except Exception as e:
        print(f"Exception fetching post for {tag_name}: {e}")
        return ""

def process_character(row, write_lock, writer):
    """Process a single character and write result to CSV"""
    tag_name = row["name"]
    # replace spaces with underscores for tag naming
    tag_query = tag_name.replace(" ", "_")
    image_url = find_top_image_url(tag_query)
    
    # Thread-safe writing
    with write_lock:
        writer.writerow([tag_name, image_url])
        print(f"{tag_name}: {image_url}")
    
    return tag_name, image_url

def main(input_csv, output_csv, max_workers=10):
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
                executor.submit(process_character, row, write_lock, writer): row 
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
    if len(sys.argv) < 3 or len(sys.argv) > 4:
        print("Usage: python get_char_top_img.py input.csv output.csv [max_workers]")
        print("  max_workers: Number of threads (default: 10)")
        sys.exit(1)
    
    max_workers = 10
    if len(sys.argv) == 4:
        max_workers = int(sys.argv[3])
    
    main(sys.argv[1], sys.argv[2], max_workers)
