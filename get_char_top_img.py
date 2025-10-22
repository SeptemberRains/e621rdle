import csv
import requests
import sys
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
    response = requests.get(BASE_URL, headers=HEADERS, params=params)
    if response.status_code != 200:
        print(f"Error fetching post for {tag_name}: HTTP {response.status_code}")
        return ""
    results = response.json().get("posts", [])
    if results:
        return results[0]["file"]["url"]
    else:
        return ""

def main(input_csv, output_csv):
    with open(input_csv, newline="", encoding="utf-8") as infile, open(output_csv, "w", newline="", encoding="utf-8") as outfile:
        reader = csv.DictReader(infile)
        writer = csv.writer(outfile)
        writer.writerow(["name", "image_url"])
        for row in reader:
            tag_name = row["name"]
            # replace spaces with underscores for tag naming
            tag_query = tag_name.replace(" ", "_")
            image_url = find_top_image_url(tag_query)
            writer.writerow([tag_name, image_url])
            print(f"{tag_name}: {image_url}")
            sleep(1.1)  # Avoid hammering the API

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python character_top_image.py input.csv output.csv")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
