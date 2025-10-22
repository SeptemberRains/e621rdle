import requests
import csv
import argparse
from time import sleep

# Parse command line arguments
parser = argparse.ArgumentParser(description='Fetch top character tags from e621.net and save to CSV')
parser.add_argument('output_file', help='Path to the output CSV file')
args = parser.parse_args()

BASE_URL = "https://e621.net/tags.json"
HEADERS = {
    "User-Agent": "YourProject/1.0 (by yourusername on e621)"  # Must set a custom User-Agent
}
params = {
    "search[category]": 4,        # Character tags
    "search[order]": "count",     # Order by post count
    "limit": 320,                 # Max allowed
}

all_tags = []
pages_needed = (1000 // 320) + 1

for i in range(pages_needed):
    if i > 0:
        params["page"] = i + 1    # Pagination starts from 2nd page
    response = requests.get(BASE_URL, headers=HEADERS, params=params)
    tags = response.json()
    all_tags.extend(tags)
    sleep(1.1)  # Respect rate limiting

# Keep only the top 1000
top_1000_tags = all_tags[:1000]

# Write to CSV file
with open(args.output_file, 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['name', 'post_count']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    # Write header
    writer.writeheader()
    
    # Write data
    for tag in top_1000_tags:
        writer.writerow({
            'name': tag['name'],
            'post_count': tag['post_count']
        })

print(f"Successfully saved {len(top_1000_tags)} character tags to {args.output_file}")