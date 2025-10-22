import requests
from time import sleep

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

for tag in top_1000_tags:
    print(f"{tag['name']}: {tag['post_count']} posts")