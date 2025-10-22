# E621 Character Tags Fetcher

A Python script that fetches the top 1000 character tags from e621.net and saves them to a CSV file.

## Features

- Fetches character tags from e621.net API
- Orders results by post count (most popular first)
- Saves data to CSV format with customizable output path
- Respects API rate limiting (1.1 second delay between requests)
- Command-line interface for easy usage

## Requirements

- Python 3.6+
- `requests` library

## Installation

1. Clone or download this repository
2. Create a virtual environment (recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Basic Usage

```bash
python get_chars.py output.csv
```

### With Virtual Environment

```bash
source venv/bin/activate
python get_chars.py characters.csv
```

### Command Line Arguments

- `output_file` (required): Path to the output CSV file

### Help

```bash
python get_chars.py --help
```

## Output Format

The script generates a CSV file with the following columns:

- `name`: The character tag name
- `post_count`: Number of posts associated with this character

### Example Output

```csv
name,post_count
fan_character,154806
twilight_sparkle_(mlp),38517
judy_hopps,37810
fluttershy_(mlp),30834
rainbow_dash_(mlp),29747
```

## How It Works

1. **API Request**: The script makes requests to `https://e621.net/tags.json` with parameters:
   - `search[category]`: 4 (Character tags only)
   - `search[order]`: "count" (Order by post count)
   - `limit`: 320 (Maximum results per page)

2. **Pagination**: Fetches multiple pages to get the top 1000 characters (approximately 4 pages)

3. **Rate Limiting**: Includes a 1.1-second delay between requests to respect e621.net's rate limits

4. **Data Processing**: Sorts and limits results to the top 1000 characters by post count

5. **CSV Export**: Writes the results to a CSV file with proper headers and UTF-8 encoding

## API Compliance

- Uses a custom User-Agent header as required by e621.net
- Respects rate limiting with appropriate delays
- Only fetches character tags (category 4)

## Error Handling

The script includes basic error handling for:
- Missing command line arguments
- File writing permissions
- Network connectivity issues

## Example Session

```bash
$ python get_chars.py top_characters.csv
Successfully saved 1000 character tags to top_characters.csv

$ head -5 top_characters.csv
name,post_count
fan_character,154806
twilight_sparkle_(mlp),38517
judy_hopps,37810
fluttershy_(mlp),30834
```

## License

This script is provided as-is for educational and research purposes. Please respect e621.net's terms of service and API usage guidelines.

## Contributing

Feel free to submit issues or pull requests to improve the script.